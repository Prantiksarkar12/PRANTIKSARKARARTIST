import http from 'http';
import express, { Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI } from '@google/genai';

export interface ChatMessageRecord {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_type: 'USER' | 'AI' | 'ADMIN' | 'PRESS' | 'SUPPORT' | 'CREATOR' | 'MODERATOR' | 'SYSTEM';
  sender_role: string;
  sender_avatar?: string;
  text: string;
  attachments?: any[];
  reply_to_message_id?: string;
  reply_snippet?: { id: string; sender_name: string; text: string };
  reactions: Array<{ emoji: string; user_id: string; user_name: string; created_at: string }>;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  ai_generated?: boolean;
  human_generated?: boolean;
  created_at: string;
  delivered_at?: string;
  read_at?: string;
  is_deleted?: boolean;
  is_edited?: boolean;
  edited_at?: string;
}

export type ConversationMode =
  | 'WAITING_FOR_HUMAN'
  | 'HUMAN_ACTIVE'
  | 'AI_ACTIVE'
  | 'HUMAN_AND_AI_HANDOFF'
  | 'CLOSED';

export interface ChatConversationRecord {
  id: string;
  type: string;
  title: string;
  avatar_url?: string;
  description?: string;
  created_by: string;
  participants: Array<{
    user_id: string;
    user_name: string;
    user_role: string;
    joined_at: string;
    is_group_admin?: boolean;
  }>;
  participant_ids: string[];
  mode: ConversationMode;
  ai_enabled: boolean;
  human_operator_id: string | null;
  human_operator_name?: string | null;
  human_operator_role?: 'ADMIN' | 'PRESS' | 'SUPPORT' | 'CREATOR' | null;
  human_response_deadline: string | null;
  human_response_timeout_seconds: number;
  target_queue: 'ALL' | 'SUPPORT' | 'PRESS' | 'ADMIN' | 'CREATOR' | 'USER';
  waiting_notice?: string | null;
  closed_at?: string | null;
  topic?: string;
  status: 'ACTIVE' | 'PENDING_ADMIN' | 'RESOLVED' | 'ARCHIVED';
  user_states: Record<string, { is_pinned?: boolean; is_archived?: boolean; is_muted?: boolean; unread_count: number }>;
  last_message?: {
    id: string;
    sender_id: string;
    sender_name: string;
    text: string;
    status: 'sending' | 'sent' | 'delivered' | 'read';
    created_at: string;
  };
  created_at: string;
  updated_at: string;
}

export interface OperatorPresenceRecord {
  operator_id: string;
  operator_name: string;
  role: 'ADMIN' | 'PRESS' | 'SUPPORT' | 'CREATOR';
  availability: 'ONLINE' | 'AWAY' | 'OFFLINE' | 'BUSY';
  last_active: string;
}

export interface ChatSystemSettingsRecord {
  human_response_timeout_seconds: number;
  ai_auto_response_enabled: boolean;
  escalation_enabled: boolean;
}

// ---------------------------------------------------------------------------
// SERVER-AUTHORITATIVE IN-MEMORY REPOSITORY
// ---------------------------------------------------------------------------
class ChatServerState {
  public settings: ChatSystemSettingsRecord = {
    human_response_timeout_seconds: 120, // 2-minute rule default
    ai_auto_response_enabled: true,
    escalation_enabled: true,
  };

  public operators: Map<string, OperatorPresenceRecord> = new Map([
    [
      'user_owner_01',
      {
        operator_id: 'user_owner_01',
        operator_name: 'Prantik Sarkar',
        role: 'CREATOR',
        availability: 'ONLINE',
        last_active: new Date().toISOString(),
      },
    ],
    [
      'user_admin_01',
      {
        operator_id: 'user_admin_01',
        operator_name: 'Management Operations',
        role: 'ADMIN',
        availability: 'ONLINE',
        last_active: new Date().toISOString(),
      },
    ],
    [
      'user_editor_01',
      {
        operator_id: 'user_editor_01',
        operator_name: 'Press & Editorial Unit',
        role: 'PRESS',
        availability: 'ONLINE',
        last_active: new Date().toISOString(),
      },
    ],
    [
      'user_support_01',
      {
        operator_id: 'user_support_01',
        operator_name: 'Fan Support Desk',
        role: 'SUPPORT',
        availability: 'ONLINE',
        last_active: new Date().toISOString(),
      },
    ],
  ]);

  public conversations: Map<string, ChatConversationRecord> = new Map();
  public messages: ChatMessageRecord[] = [];
  public activeTimers: Map<string, NodeJS.Timeout> = new Map();
  public pendingAiGeneration: Map<string, boolean> = new Map();

  constructor() {
    this.seedInitialConversations();
  }

  private seedInitialConversations() {
    const now = new Date();
    const convTeam: ChatConversationRecord = {
      id: 'conv_team_official',
      type: 'TEAM',
      title: 'PRANTIK SARKAR ARTIST RECORD — Executive Operations',
      description: 'Official internal communication channel for label management, executive producers, and platform administrators.',
      created_by: 'user_owner_01',
      mode: 'HUMAN_ACTIVE',
      ai_enabled: false,
      human_operator_id: 'user_owner_01',
      human_operator_name: 'Prantik Sarkar',
      human_operator_role: 'CREATOR',
      human_response_deadline: null,
      human_response_timeout_seconds: 120,
      target_queue: 'ADMIN',
      status: 'ACTIVE',
      participants: [
        { user_id: 'user_owner_01', user_name: 'Prantik Sarkar', user_role: 'OWNER', joined_at: new Date(now.getTime() - 86400000 * 30).toISOString(), is_group_admin: true },
        { user_id: 'user_admin_01', user_name: 'Management Operations', user_role: 'SUPER_ADMIN', joined_at: new Date(now.getTime() - 86400000 * 30).toISOString(), is_group_admin: true },
        { user_id: 'user_editor_01', user_name: 'Press & Editorial Unit', user_role: 'EDITOR', joined_at: new Date(now.getTime() - 86400000 * 25).toISOString() },
      ],
      participant_ids: ['user_owner_01', 'user_admin_01', 'user_editor_01'],
      user_states: {
        user_owner_01: { is_pinned: true, unread_count: 0 },
        user_admin_01: { is_pinned: true, unread_count: 0 },
        user_editor_01: { is_pinned: false, unread_count: 0 },
      },
      last_message: {
        id: 'msg_team_02',
        sender_id: 'user_admin_01',
        sender_name: 'Management Operations',
        text: 'All label distribution pipelines and ISRC tracking integrations are synchronized. Real-time updates active.',
        status: 'read',
        created_at: new Date(now.getTime() - 7200000).toISOString(),
      },
      created_at: new Date(now.getTime() - 86400000 * 30).toISOString(),
      updated_at: new Date(now.getTime() - 7200000).toISOString(),
    };

    const convSupport: ChatConversationRecord = {
      id: 'conv_user_support_channel',
      type: 'USER_SUPPORT',
      title: 'PRANTIK Platform Support & Fan Desk',
      description: 'General platform inquiries, account access, ticket escalation, and VIP member assistance.',
      created_by: 'user_admin_01',
      mode: 'WAITING_FOR_HUMAN',
      ai_enabled: true,
      human_operator_id: null,
      human_response_deadline: new Date(now.getTime() + 120 * 1000).toISOString(),
      human_response_timeout_seconds: 120,
      target_queue: 'SUPPORT',
      status: 'ACTIVE',
      participants: [
        { user_id: 'user_admin_01', user_name: 'Management Operations', user_role: 'SUPER_ADMIN', joined_at: new Date(now.getTime() - 86400000 * 15).toISOString(), is_group_admin: true },
        { user_id: 'user_owner_01', user_name: 'Prantik Sarkar', user_role: 'OWNER', joined_at: new Date(now.getTime() - 86400000 * 15).toISOString(), is_group_admin: true },
      ],
      participant_ids: ['user_admin_01', 'user_owner_01'],
      user_states: {
        user_admin_01: { is_pinned: false, unread_count: 0 },
        user_owner_01: { is_pinned: false, unread_count: 0 },
      },
      last_message: {
        id: 'msg_support_01',
        sender_id: 'user_admin_01',
        sender_name: 'Management Operations',
        text: 'Platform Support desk is online. Inquiries are handled with 2-minute human priority.',
        status: 'read',
        created_at: new Date(now.getTime() - 21600000).toISOString(),
      },
      created_at: new Date(now.getTime() - 86400000 * 15).toISOString(),
      updated_at: new Date(now.getTime() - 21600000).toISOString(),
    };

    const convPress: ChatConversationRecord = {
      id: 'conv_press_hotline',
      type: 'USER_SUPPORT',
      title: 'Press & Media Editorial Desk',
      description: 'Direct inquiries from journalists, interview inquiries, and EPK licensing inquiries.',
      created_by: 'user_editor_01',
      mode: 'WAITING_FOR_HUMAN',
      ai_enabled: true,
      human_operator_id: null,
      human_response_deadline: new Date(now.getTime() + 120 * 1000).toISOString(),
      human_response_timeout_seconds: 120,
      target_queue: 'PRESS',
      status: 'ACTIVE',
      participants: [
        { user_id: 'user_editor_01', user_name: 'Press & Editorial Unit', user_role: 'EDITOR', joined_at: new Date(now.getTime() - 86400000 * 10).toISOString(), is_group_admin: true },
        { user_id: 'user_owner_01', user_name: 'Prantik Sarkar', user_role: 'OWNER', joined_at: new Date(now.getTime() - 86400000 * 10).toISOString(), is_group_admin: true },
      ],
      participant_ids: ['user_editor_01', 'user_owner_01'],
      user_states: {
        user_editor_01: { is_pinned: false, unread_count: 0 },
        user_owner_01: { is_pinned: false, unread_count: 0 },
      },
      last_message: {
        id: 'msg_press_01',
        sender_id: 'user_editor_01',
        sender_name: 'Press & Editorial Unit',
        text: 'Press desk active. Verification window is open for incoming editorial requests.',
        status: 'read',
        created_at: new Date(now.getTime() - 300000).toISOString(),
      },
      created_at: new Date(now.getTime() - 86400000 * 10).toISOString(),
      updated_at: new Date(now.getTime() - 300000).toISOString(),
    };

    const convAi: ChatConversationRecord = {
      id: 'conv_ai_engine',
      type: 'AI',
      title: 'PRANTIK AI • Autonomous Assistant & Label Intelligence',
      description: 'Official intelligent assistant for PRANTIK SARKAR ARTIST RECORD. Answers label operations, music concepts, coding, maths, and research.',
      created_by: 'user_owner_01',
      mode: 'AI_ACTIVE',
      ai_enabled: true,
      human_operator_id: null,
      human_response_deadline: null,
      human_response_timeout_seconds: 120,
      target_queue: 'ALL',
      status: 'ACTIVE',
      participants: [
        { user_id: 'user_owner_01', user_name: 'Prantik Sarkar', user_role: 'OWNER', joined_at: new Date(now.getTime() - 86400000 * 30).toISOString(), is_group_admin: true },
        { user_id: 'prantik_ai_bot', user_name: 'PRANTIK AI', user_role: 'AI', joined_at: new Date(now.getTime() - 86400000 * 30).toISOString() },
      ],
      participant_ids: ['user_owner_01', 'prantik_ai_bot'],
      user_states: {
        user_owner_01: { is_pinned: true, unread_count: 0 },
      },
      last_message: {
        id: 'msg_ai_01',
        sender_id: 'prantik_ai_bot',
        sender_name: 'PRANTIK AI',
        text: 'Greetings! I am PRANTIK AI, the autonomous intelligence for PRANTIK SARKAR ARTIST RECORD. How may I assist you today?',
        status: 'read',
        created_at: new Date(now.getTime() - 3600000).toISOString(),
      },
      created_at: new Date(now.getTime() - 86400000 * 30).toISOString(),
      updated_at: new Date(now.getTime() - 3600000).toISOString(),
    };

    this.conversations.set(convTeam.id, convTeam);
    this.conversations.set(convSupport.id, convSupport);
    this.conversations.set(convPress.id, convPress);
    this.conversations.set(convAi.id, convAi);

    // Initial messages
    this.messages = [
      {
        id: 'msg_team_01',
        conversation_id: 'conv_team_official',
        sender_id: 'user_owner_01',
        sender_name: 'Prantik Sarkar',
        sender_type: 'CREATOR',
        sender_role: 'OWNER',
        text: 'Welcome to the PRANTIK CHAT internal communications grid. This channel is dedicated to label operations, roster planning, and platform oversight.',
        reactions: [
          { emoji: '🔥', user_id: 'user_admin_01', user_name: 'Management Operations', created_at: new Date(now.getTime() - 36000000).toISOString() },
          { emoji: '🎵', user_id: 'user_editor_01', user_name: 'Press & Editorial Unit', created_at: new Date(now.getTime() - 32400000).toISOString() },
        ],
        status: 'read',
        human_generated: true,
        ai_generated: false,
        created_at: new Date(now.getTime() - 43200000).toISOString(),
      },
      {
        id: 'msg_team_02',
        conversation_id: 'conv_team_official',
        sender_id: 'user_admin_01',
        sender_name: 'Management Operations',
        sender_type: 'ADMIN',
        sender_role: 'SUPER_ADMIN',
        text: 'All label distribution pipelines and ISRC tracking integrations are synchronized. Real-time updates active.',
        reply_to_message_id: 'msg_team_01',
        reply_snippet: {
          id: 'msg_team_01',
          sender_name: 'Prantik Sarkar',
          text: 'Welcome to the PRANTIK CHAT internal communications grid...',
        },
        reactions: [
          { emoji: '👍', user_id: 'user_owner_01', user_name: 'Prantik Sarkar', created_at: new Date(now.getTime() - 3600000).toISOString() },
        ],
        status: 'read',
        human_generated: true,
        ai_generated: false,
        created_at: new Date(now.getTime() - 7200000).toISOString(),
      },
      {
        id: 'msg_support_01',
        conversation_id: 'conv_user_support_channel',
        sender_id: 'user_admin_01',
        sender_name: 'Management Operations',
        sender_type: 'SUPPORT',
        sender_role: 'SUPER_ADMIN',
        text: 'Platform Support desk is online. Inquiries are handled with 2-minute human priority.',
        reactions: [],
        status: 'read',
        human_generated: true,
        ai_generated: false,
        created_at: new Date(now.getTime() - 21600000).toISOString(),
      },
      {
        id: 'msg_press_01',
        conversation_id: 'conv_press_hotline',
        sender_id: 'user_editor_01',
        sender_name: 'Press & Editorial Unit',
        sender_type: 'PRESS',
        sender_role: 'EDITOR',
        text: 'Press desk active. Verification window is open for incoming editorial requests.',
        reactions: [],
        status: 'read',
        human_generated: true,
        ai_generated: false,
        created_at: new Date(now.getTime() - 300000).toISOString(),
      },
      {
        id: 'msg_ai_01',
        conversation_id: 'conv_ai_engine',
        sender_id: 'prantik_ai_bot',
        sender_name: 'PRANTIK AI',
        sender_type: 'AI',
        sender_role: 'AI',
        text: 'Greetings! I am PRANTIK AI, the autonomous intelligence for PRANTIK SARKAR ARTIST RECORD. How may I assist you today?',
        reactions: [
          { emoji: '🚀', user_id: 'user_owner_01', user_name: 'Prantik Sarkar', created_at: new Date(now.getTime() - 1800000).toISOString() },
        ],
        status: 'read',
        human_generated: false,
        ai_generated: true,
        created_at: new Date(now.getTime() - 3600000).toISOString(),
      },
    ];
  }

  public getAvailableOperators(queue?: string): OperatorPresenceRecord[] {
    const list = Array.from(this.operators.values());
    return list.filter((op) => {
      if (op.availability === 'OFFLINE') return false;
      if (!queue || queue === 'ALL') return true;
      if (queue === 'SUPPORT' && op.role === 'SUPPORT') return true;
      if (queue === 'PRESS' && op.role === 'PRESS') return true;
      if (queue === 'ADMIN' && (op.role === 'ADMIN' || op.role === 'CREATOR')) return true;
      if (queue === 'CREATOR' && op.role === 'CREATOR') return true;
      return true; // Admin/owner can handle all queues
    });
  }
}

export const chatState = new ChatServerState();

// ---------------------------------------------------------------------------
// WEBSOCKET & REST INITIALIZATION
// ---------------------------------------------------------------------------
export function initChatWebSocketServer(httpServer: http.Server, app: express.Express) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws/chat' });
  const connectedClients = new Set<WebSocket>();

  function broadcast(event: string, payload: any) {
    const data = JSON.stringify({ event, payload });
    for (const client of connectedClients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  // AI response generator with strict identity separation & cancel protection
  async function generateAiReply(conversationId: string, userMessageText: string) {
    const conv = chatState.conversations.get(conversationId);
    if (!conv || conv.mode === 'CLOSED' || !conv.ai_enabled) {
      return;
    }

    // AI Handoff Protection Check #1:
    if (conv.mode === 'HUMAN_ACTIVE' || conv.human_operator_id) {
      return;
    }

    chatState.pendingAiGeneration.set(conversationId, true);
    broadcast('ai:started', { conversationId, timestamp: new Date().toISOString() });

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      let replyContent = '';

      const systemInstruction = `You are PRANTIK AI, the official AI assistant on the website of Prantik Sarkar — Artist, Rapper & Creator.
CRITICAL IDENTITY RULES:
1. You are an AI assistant. You must NEVER pretend to be a human, an admin, Prantik Sarkar, or from the press team.
2. If asked who you are, state clearly: "I am PRANTIK AI, the intelligent assistant for Prantik Sarkar Artist Record."
3. You are responding to assist the user while the human team (Admin/Support/Press/Creator) is currently attending to other inquiries.
4. Assist helpfully with discography, music production, lyrics, coding, maths, general questions, and platform info.`;

      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [{ role: 'user', parts: [{ text: userMessageText }] }],
            config: { systemInstruction, temperature: 0.7, maxOutputTokens: 1024 },
          });
          replyContent = response.text || 'I processed your request, but no text output was generated.';
        } catch (err) {
          console.warn('[PRANTIK CHAT] Gemini API error, falling back to local reasoning:', err);
        }
      }

      if (!replyContent) {
        replyContent = `Hello! I am **PRANTIK AI**, assisting you while our human team is momentarily attending to other inquiries. Regarding your note: *" ${userMessageText} "* — I have logged this with priority. If you need immediate details on releases, distribution, booking policies, or creative work, let me know! A human team member can also take over this conversation at any moment.`;
      }

      // AI Handoff Protection Check #2:
      // Verify that while AI was thinking, a human did NOT join or reply!
      const currentConv = chatState.conversations.get(conversationId);
      const isStillPending = chatState.pendingAiGeneration.get(conversationId);
      if (!isStillPending || !currentConv || currentConv.mode === 'HUMAN_ACTIVE' || currentConv.human_operator_id) {
        console.log(`[PRANTIK CHAT] AI response discarded for conv ${conversationId} because human took over.`);
        broadcast('ai:stopped', { conversationId, cancelled: true });
        return;
      }

      // Save and deliver AI message
      const now = new Date().toISOString();
      const aiMessage: ChatMessageRecord = {
        id: 'msg_ai_' + Date.now(),
        conversation_id: conversationId,
        sender_id: 'prantik_ai_bot',
        sender_name: 'PRANTIK AI',
        sender_type: 'AI',
        sender_role: 'AI',
        text: replyContent,
        reactions: [],
        status: 'delivered',
        ai_generated: true,
        human_generated: false,
        created_at: now,
        delivered_at: now,
      };

      chatState.messages.push(aiMessage);
      currentConv.mode = 'AI_ACTIVE';
      currentConv.waiting_notice = 'AI Assistant is assisting while human operators are attending other inquiries.';
      currentConv.last_message = {
        id: aiMessage.id,
        sender_id: aiMessage.sender_id,
        sender_name: aiMessage.sender_name,
        text: aiMessage.text,
        status: aiMessage.status,
        created_at: now,
      };
      currentConv.updated_at = now;

      broadcast('message:new', aiMessage);
      broadcast('ai:stopped', { conversationId, cancelled: false });
      broadcast('conversation:mode_changed', {
        conversationId,
        mode: currentConv.mode,
        human_operator_id: null,
        human_response_deadline: null,
      });
    } catch (e) {
      console.error('[PRANTIK CHAT] AI generation failed:', e);
      broadcast('ai:stopped', { conversationId, cancelled: true });
    } finally {
      chatState.pendingAiGeneration.delete(conversationId);
    }
  }

  // Starts the authoritative 2-minute timer for human response
  function startHumanResponseTimer(conversationId: string, timeoutSeconds: number, userMessageText: string) {
    // Clear existing timer if any
    const existing = chatState.activeTimers.get(conversationId);
    if (existing) {
      clearTimeout(existing);
      chatState.activeTimers.delete(conversationId);
    }

    const timer = setTimeout(async () => {
      chatState.activeTimers.delete(conversationId);
      const conv = chatState.conversations.get(conversationId);
      if (!conv || conv.mode === 'CLOSED' || conv.mode === 'HUMAN_ACTIVE') {
        return;
      }

      // 2-minute deadline elapsed with no human reply!
      console.log(`[PRANTIK CHAT] Human response window elapsed for conv ${conversationId}. Activating AI Assistant...`);
      conv.mode = 'AI_ACTIVE';
      conv.human_response_deadline = null;
      broadcast('conversation:mode_changed', {
        conversationId,
        mode: 'AI_ACTIVE',
        human_operator_id: null,
        human_response_deadline: null,
        autoAiTriggered: true,
      });

      if (chatState.settings.ai_auto_response_enabled) {
        await generateAiReply(conversationId, userMessageText);
      }
    }, timeoutSeconds * 1000);

    chatState.activeTimers.set(conversationId, timer);
  }

  // -------------------------------------------------------------
  // REST API ENDPOINTS
  // -------------------------------------------------------------
  app.get('/api/chat/sync', (_req: Request, res: Response) => {
    return res.json({
      settings: chatState.settings,
      operators: Array.from(chatState.operators.values()),
      conversations: Array.from(chatState.conversations.values()),
      messages: chatState.messages,
    });
  });

  app.post('/api/chat/message', async (req: Request, res: Response) => {
    try {
      const {
        conversationId,
        senderId,
        senderName,
        senderType,
        senderRole,
        text,
        attachments,
        replyToMessageId,
      } = req.body;

      if (!conversationId || !text) {
        return res.status(400).json({ error: 'Conversation ID and text are required.' });
      }

      let conv = chatState.conversations.get(conversationId);
      const now = new Date().toISOString();

      if (!conv) {
        conv = {
          id: conversationId,
          type: 'DIRECT',
          title: senderName || 'User Conversation',
          created_by: senderId,
          mode: 'WAITING_FOR_HUMAN',
          ai_enabled: true,
          human_operator_id: null,
          human_response_deadline: null,
          human_response_timeout_seconds: chatState.settings.human_response_timeout_seconds,
          target_queue: 'SUPPORT',
          status: 'ACTIVE',
          participants: [
            { user_id: senderId, user_name: senderName || 'User', user_role: senderRole || 'USER', joined_at: now },
            { user_id: 'user_admin_01', user_name: 'Management Operations', user_role: 'ADMIN', joined_at: now },
          ],
          participant_ids: [senderId, 'user_admin_01'],
          user_states: {
            [senderId]: { unread_count: 0 },
            user_admin_01: { unread_count: 1 },
          },
          created_at: now,
          updated_at: now,
        };
        chatState.conversations.set(conversationId, conv);
      }

      const isHumanOperator = ['ADMIN', 'PRESS', 'SUPPORT', 'CREATOR', 'MODERATOR'].includes(senderType || senderRole);

      // Create message record
      const messageRecord: ChatMessageRecord = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        conversation_id: conversationId,
        sender_id: senderId,
        sender_name: senderName || 'Member',
        sender_type: isHumanOperator ? (senderType || senderRole) : 'USER',
        sender_role: senderRole || (isHumanOperator ? 'ADMIN' : 'USER'),
        text: text.trim(),
        attachments: attachments || [],
        reply_to_message_id: replyToMessageId,
        reactions: [],
        status: 'delivered',
        human_generated: true,
        ai_generated: false,
        created_at: now,
        delivered_at: now,
      };

      chatState.messages.push(messageRecord);

      conv.last_message = {
        id: messageRecord.id,
        sender_id: messageRecord.sender_id,
        sender_name: messageRecord.sender_name,
        text: messageRecord.text,
        status: messageRecord.status,
        created_at: now,
      };
      conv.updated_at = now;

      // HUMAN OPERATOR REPLY LOGIC
      if (isHumanOperator) {
        // Cancel pending 2-minute timer immediately
        const timer = chatState.activeTimers.get(conversationId);
        if (timer) {
          clearTimeout(timer);
          chatState.activeTimers.delete(conversationId);
        }
        // Cancel any pending AI generation
        chatState.pendingAiGeneration.delete(conversationId);

        conv.mode = 'HUMAN_ACTIVE';
        conv.ai_enabled = false;
        conv.human_operator_id = senderId;
        conv.human_operator_name = senderName;
        conv.human_operator_role = senderRole;
        conv.human_response_deadline = null;
        conv.waiting_notice = null;

        broadcast('conversation:mode_changed', {
          conversationId,
          mode: 'HUMAN_ACTIVE',
          human_operator_id: senderId,
          human_operator_name: senderName,
          human_operator_role: senderRole,
        });
        broadcast('human:joined', {
          conversationId,
          operatorId: senderId,
          operatorName: senderName,
          operatorRole: senderRole,
        });
      }
      // USER SENT MESSAGE TO HUMAN TEAM
      else {
        if (conv.mode !== 'HUMAN_ACTIVE') {
          // Check online human availability
          const availableOperators = chatState.getAvailableOperators(conv.target_queue);
          const timeoutSeconds = conv.human_response_timeout_seconds || chatState.settings.human_response_timeout_seconds || 120;
          const deadline = new Date(Date.now() + timeoutSeconds * 1000).toISOString();

          conv.mode = 'WAITING_FOR_HUMAN';
          conv.human_response_deadline = deadline;

          if (availableOperators.length === 0) {
            conv.waiting_notice = 'No human team member is currently available. AI Assistant can help while you wait.';
          } else {
            conv.waiting_notice = `Waiting for a human response (${timeoutSeconds}s window)…`;
          }

          startHumanResponseTimer(conversationId, timeoutSeconds, text);

          broadcast('conversation:mode_changed', {
            conversationId,
            mode: 'WAITING_FOR_HUMAN',
            human_response_deadline: deadline,
            waiting_notice: conv.waiting_notice,
            available_operators: availableOperators.length,
          });
        }
      }

      broadcast('message:new', messageRecord);
      return res.json({ success: true, message: messageRecord, conversation: conv });
    } catch (err: unknown) {
      console.error('[PRANTIK CHAT] Error in /api/chat/message:', err);
      return res.status(500).json({ error: 'Failed to record chat message.' });
    }
  });

  // Human Takeover Endpoint
  app.post('/api/chat/takeover', (req: Request, res: Response) => {
    try {
      const { conversationId, operatorId, operatorName, operatorRole } = req.body;
      const conv = chatState.conversations.get(conversationId);
      if (!conv) {
        return res.status(404).json({ error: 'Conversation not found.' });
      }

      // Cancel pending timer & cancel AI generation
      const timer = chatState.activeTimers.get(conversationId);
      if (timer) {
        clearTimeout(timer);
        chatState.activeTimers.delete(conversationId);
      }
      chatState.pendingAiGeneration.delete(conversationId);

      conv.mode = 'HUMAN_ACTIVE';
      conv.ai_enabled = false;
      conv.human_operator_id = operatorId;
      conv.human_operator_name = operatorName || 'Verified Operator';
      conv.human_operator_role = operatorRole || 'ADMIN';
      conv.human_response_deadline = null;
      conv.waiting_notice = null;
      conv.updated_at = new Date().toISOString();

      // In-line system event announcement
      const systemNotice: ChatMessageRecord = {
        id: 'sys_' + Date.now(),
        conversation_id: conversationId,
        sender_id: 'system',
        sender_name: 'PRANTIK CHAT System',
        sender_type: 'SYSTEM',
        sender_role: 'SYSTEM',
        text: `A human team member (${operatorName} · ${operatorRole}) has joined the conversation.`,
        reactions: [],
        status: 'read',
        created_at: new Date().toISOString(),
      };
      chatState.messages.push(systemNotice);

      broadcast('human:joined', {
        conversationId,
        operatorId,
        operatorName,
        operatorRole,
      });
      broadcast('message:new', systemNotice);
      broadcast('conversation:mode_changed', {
        conversationId,
        mode: 'HUMAN_ACTIVE',
        human_operator_id: operatorId,
        human_operator_name: operatorName,
        human_operator_role: operatorRole,
        human_response_deadline: null,
      });

      return res.json({ success: true, conversation: conv });
    } catch (err: unknown) {
      return res.status(500).json({ error: 'Failed to complete human takeover.' });
    }
  });

  // Return to AI Endpoint
  app.post('/api/chat/return-to-ai', (req: Request, res: Response) => {
    try {
      const { conversationId } = req.body;
      const conv = chatState.conversations.get(conversationId);
      if (!conv) {
        return res.status(404).json({ error: 'Conversation not found.' });
      }

      conv.mode = 'AI_ACTIVE';
      conv.ai_enabled = true;
      conv.human_operator_id = null;
      conv.human_operator_name = null;
      conv.human_operator_role = null;
      conv.human_response_deadline = null;
      conv.waiting_notice = 'AI Assistant is active. A human operator can take over at any time.';
      conv.updated_at = new Date().toISOString();

      const systemNotice: ChatMessageRecord = {
        id: 'sys_' + Date.now(),
        conversation_id: conversationId,
        sender_id: 'system',
        sender_name: 'PRANTIK CHAT System',
        sender_type: 'SYSTEM',
        sender_role: 'SYSTEM',
        text: 'AI Assistant is available again. A human operator may rejoin if needed.',
        reactions: [],
        status: 'read',
        created_at: new Date().toISOString(),
      };
      chatState.messages.push(systemNotice);

      broadcast('ai:handoff', { conversationId });
      broadcast('message:new', systemNotice);
      broadcast('conversation:mode_changed', {
        conversationId,
        mode: 'AI_ACTIVE',
        human_operator_id: null,
        human_response_deadline: null,
      });

      return res.json({ success: true, conversation: conv });
    } catch (err: unknown) {
      return res.status(500).json({ error: 'Failed to return conversation to AI.' });
    }
  });

  // Close Conversation Endpoint
  app.post('/api/chat/close', (req: Request, res: Response) => {
    try {
      const { conversationId, operatorName } = req.body;
      const conv = chatState.conversations.get(conversationId);
      if (!conv) {
        return res.status(404).json({ error: 'Conversation not found.' });
      }

      const timer = chatState.activeTimers.get(conversationId);
      if (timer) {
        clearTimeout(timer);
        chatState.activeTimers.delete(conversationId);
      }

      conv.mode = 'CLOSED';
      conv.closed_at = new Date().toISOString();
      conv.human_response_deadline = null;
      conv.waiting_notice = 'This conversation has been closed.';
      conv.updated_at = new Date().toISOString();

      const systemNotice: ChatMessageRecord = {
        id: 'sys_' + Date.now(),
        conversation_id: conversationId,
        sender_id: 'system',
        sender_name: 'PRANTIK CHAT System',
        sender_type: 'SYSTEM',
        sender_role: 'SYSTEM',
        text: `Conversation has been closed by ${operatorName || 'an authorized administrator'}.`,
        reactions: [],
        status: 'read',
        created_at: new Date().toISOString(),
      };
      chatState.messages.push(systemNotice);

      broadcast('conversation:closed', { conversationId });
      broadcast('message:new', systemNotice);
      broadcast('conversation:mode_changed', {
        conversationId,
        mode: 'CLOSED',
        closed_at: conv.closed_at,
      });

      return res.json({ success: true, conversation: conv });
    } catch (err: unknown) {
      return res.status(500).json({ error: 'Failed to close conversation.' });
    }
  });

  // Update Operator Presence Endpoint
  app.post('/api/chat/presence', (req: Request, res: Response) => {
    try {
      const { operatorId, operatorName, role, availability } = req.body;
      if (!operatorId) {
        return res.status(400).json({ error: 'Operator ID is required.' });
      }

      const record: OperatorPresenceRecord = {
        operator_id: operatorId,
        operator_name: operatorName || 'Staff Member',
        role: role || 'SUPPORT',
        availability: availability || 'ONLINE',
        last_active: new Date().toISOString(),
      };

      chatState.operators.set(operatorId, record);
      broadcast('presence:update', record);

      return res.json({ success: true, presence: record });
    } catch (err: unknown) {
      return res.status(500).json({ error: 'Failed to update presence.' });
    }
  });

  // System Settings Endpoint
  app.post('/api/chat/settings', (req: Request, res: Response) => {
    try {
      const { human_response_timeout_seconds, ai_auto_response_enabled, escalation_enabled } = req.body;
      if (typeof human_response_timeout_seconds === 'number' && human_response_timeout_seconds >= 10) {
        chatState.settings.human_response_timeout_seconds = human_response_timeout_seconds;
      }
      if (typeof ai_auto_response_enabled === 'boolean') {
        chatState.settings.ai_auto_response_enabled = ai_auto_response_enabled;
      }
      if (typeof escalation_enabled === 'boolean') {
        chatState.settings.escalation_enabled = escalation_enabled;
      }

      broadcast('settings:update', chatState.settings);
      return res.json({ success: true, settings: chatState.settings });
    } catch (err: unknown) {
      return res.status(500).json({ error: 'Failed to update chat settings.' });
    }
  });

  // -------------------------------------------------------------
  // WEBSOCKET REAL-TIME DISPATCHER
  // -------------------------------------------------------------
  wss.on('connection', (ws: WebSocket) => {
    connectedClients.add(ws);

    // Initial state sync payload
    ws.send(
      JSON.stringify({
        event: 'init',
        payload: {
          settings: chatState.settings,
          operators: Array.from(chatState.operators.values()),
          conversations: Array.from(chatState.conversations.values()),
          messages: chatState.messages,
        },
      })
    );

    ws.on('message', async (raw) => {
      try {
        const parsed = JSON.parse(raw.toString());
        const { event, payload } = parsed;

        if (event === 'typing:start') {
          broadcast('typing:start', payload);
        } else if (event === 'typing:stop') {
          broadcast('typing:stop', payload);
        } else if (event === 'message:read') {
          const { conversationId, userId } = payload;
          const conv = chatState.conversations.get(conversationId);
          if (conv && conv.user_states && conv.user_states[userId]) {
            conv.user_states[userId].unread_count = 0;
          }
          broadcast('message:read', payload);
        } else if (event === 'presence:update') {
          const { operatorId, operatorName, role, availability } = payload;
          chatState.operators.set(operatorId, {
            operator_id: operatorId,
            operator_name: operatorName,
            role,
            availability,
            last_active: new Date().toISOString(),
          });
          broadcast('presence:update', payload);
        }
      } catch (err) {
        console.error('[PRANTIK CHAT WS] Error parsing client message:', err);
      }
    });

    ws.on('close', () => {
      connectedClients.delete(ws);
    });

    ws.on('error', (err) => {
      console.warn('[PRANTIK CHAT WS] Socket error:', err);
      connectedClients.delete(ws);
    });
  });

  console.log('[PRANTIK CHAT] Real-time WebSocket engine mounted on path /ws/chat');
}
