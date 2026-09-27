import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { db, dbEventBus } from '../services/db';
import { prantikChat } from '../services/prantikChatService';
import { realtimeChatClient } from '../services/prantikRealtimeClient';
import {
  ChatConversation,
  ChatMessage,
  ChatAttachment,
  ChatType,
  LabelTopicType,
  User,
  ChatReport,
  ConversationMode,
  HumanAvailability,
  HumanOperatorRole,
  OperatorPresence,
  PrantikChatSystemSettings,
} from '../types';

export type ChatFilterTab = 'all' | 'waiting' | 'human' | 'ai' | 'direct' | 'group' | 'label' | 'archived' | 'unread';

export function usePrantikChat(currentUser: User | null, initialConversationId?: string) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filterTab, setFilterTab] = useState<ChatFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inChatSearchQuery, setInChatSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [operatorPresences, setOperatorPresences] = useState<OperatorPresence[]>([]);
  const [chatSettings, setChatSettings] = useState<PrantikChatSystemSettings>({
    human_response_timeout_seconds: 120,
    ai_auto_response_enabled: true,
    escalation_enabled: true,
  });

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load conversations from local DB cache
  const refreshConversations = useCallback(() => {
    if (!currentUser) {
      setConversations([]);
      return;
    }
    const list = prantikChat.getConversations(currentUser.id);
    setConversations(list);
  }, [currentUser]);

  // Load active messages
  const refreshMessages = useCallback(() => {
    if (!currentUser || !selectedConversationId) {
      setMessages([]);
      return;
    }
    const msgs = prantikChat.getMessages(selectedConversationId, currentUser.id);
    setMessages(msgs);
  }, [currentUser, selectedConversationId]);

  // Initial load
  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  useEffect(() => {
    refreshMessages();
  }, [refreshMessages]);

  // Select default conversation if none active
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      const firstActive = conversations.find(
        (c) => currentUser && !c.user_states?.[currentUser.id]?.is_archived
      );
      if (firstActive) {
        setSelectedConversationId(firstActive.id);
      } else {
        setSelectedConversationId(conversations[0].id);
      }
    }
  }, [conversations, selectedConversationId, currentUser]);

  // Authenticate socket session on user change
  useEffect(() => {
    if (currentUser) {
      realtimeChatClient.authenticate(currentUser.id, currentUser.name, currentUser.role);
    }
  }, [currentUser]);

  // Real-time WebSocket event listeners
  useEffect(() => {
    // 1. Initial State Sync
    const unsubInit = realtimeChatClient.on('init', (payload) => {
      if (payload.settings) {
        setChatSettings(payload.settings);
      }
      if (payload.operators) {
        setOperatorPresences(payload.operators);
      }
      if (Array.isArray(payload.conversations) && payload.conversations.length > 0) {
        // Merge conversations with local database
        payload.conversations.forEach((serverConv: ChatConversation) => {
          const existingIdx = (db.state.chat_conversations || []).findIndex((c) => c.id === serverConv.id);
          if (existingIdx >= 0) {
            db.state.chat_conversations[existingIdx] = {
              ...db.state.chat_conversations[existingIdx],
              mode: serverConv.mode,
              human_operator_id: serverConv.human_operator_id,
              human_operator_name: serverConv.human_operator_name,
              human_operator_role: serverConv.human_operator_role,
              human_response_deadline: serverConv.human_response_deadline,
              ai_enabled: serverConv.ai_enabled,
              waiting_notice: serverConv.waiting_notice,
              target_queue: serverConv.target_queue,
              updated_at: serverConv.updated_at,
            };
          } else {
            if (!db.state.chat_conversations) db.state.chat_conversations = [];
            db.state.chat_conversations.push(serverConv);
          }
        });
        db.saveState();
        refreshConversations();
      }

      if (Array.isArray(payload.messages) && payload.messages.length > 0) {
        payload.messages.forEach((srvMsg: ChatMessage) => {
          const exists = (db.state.chat_messages || []).some((m) => m.id === srvMsg.id);
          if (!exists) {
            if (!db.state.chat_messages) db.state.chat_messages = [];
            db.state.chat_messages.push(srvMsg);
          }
        });
        db.saveState();
        refreshMessages();
      }
    });

    // 2. New incoming real-time message
    const unsubMsg = realtimeChatClient.on('message:new', (newMsg: ChatMessage) => {
      // Avoid duplicate insertion
      const exists = (db.state.chat_messages || []).some((m) => m.id === newMsg.id);
      if (!exists) {
        if (!db.state.chat_messages) db.state.chat_messages = [];
        db.state.chat_messages.push(newMsg);
        db.saveState();
      }
      refreshConversations();
      refreshMessages();
    });

    // 3. Mode changes (WAITING_FOR_HUMAN, HUMAN_ACTIVE, AI_ACTIVE, CLOSED)
    const unsubMode = realtimeChatClient.on('conversation:mode_changed', (payload) => {
      const { conversationId, mode, human_operator_id, human_operator_name, human_operator_role, human_response_deadline, waiting_notice } = payload;
      const conv = (db.state.chat_conversations || []).find((c) => c.id === conversationId);
      if (conv) {
        conv.mode = mode;
        if (human_operator_id !== undefined) conv.human_operator_id = human_operator_id;
        if (human_operator_name !== undefined) conv.human_operator_name = human_operator_name;
        if (human_operator_role !== undefined) conv.human_operator_role = human_operator_role;
        conv.human_response_deadline = human_response_deadline || null;
        conv.waiting_notice = waiting_notice || null;
        conv.ai_enabled = mode !== 'HUMAN_ACTIVE';
        db.saveState();
      }
      refreshConversations();
    });

    // 4. AI Started / Stopped events
    const unsubAiStart = realtimeChatClient.on('ai:started', (payload) => {
      if (payload.conversationId === selectedConversationId) {
        setIsAiGenerating(true);
      }
    });

    const unsubAiStop = realtimeChatClient.on('ai:stopped', (payload) => {
      if (payload.conversationId === selectedConversationId) {
        setIsAiGenerating(false);
      }
    });

    // 5. Typing Indicators
    const unsubTypingStart = realtimeChatClient.on('typing:start', (payload) => {
      if (payload.conversationId === selectedConversationId && payload.userId !== currentUser?.id) {
        setIsTyping(payload.userName || 'Someone');
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(null), 3500);
      }
    });

    const unsubTypingStop = realtimeChatClient.on('typing:stop', (payload) => {
      if (payload.conversationId === selectedConversationId) {
        setIsTyping(null);
      }
    });

    // 6. Presence updates
    const unsubPresence = realtimeChatClient.on('presence:update', (payload: OperatorPresence) => {
      setOperatorPresences((prev) => {
        const idx = prev.findIndex((p) => p.operator_id === payload.operator_id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = payload;
          return updated;
        }
        return [...prev, payload];
      });
    });

    // 7. Settings update
    const unsubSettings = realtimeChatClient.on('settings:update', (payload: PrantikChatSystemSettings) => {
      setChatSettings(payload);
    });

    return () => {
      unsubInit();
      unsubMsg();
      unsubMode();
      unsubAiStart();
      unsubAiStop();
      unsubTypingStart();
      unsubTypingStop();
      unsubPresence();
      unsubSettings();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [selectedConversationId, currentUser, refreshConversations, refreshMessages]);

  // Local EventBus bridge
  useEffect(() => {
    const handleDbChange = (e: Event) => {
      const custom = e as CustomEvent<{ eventName: string; payload: unknown }>;
      const eventName = custom?.detail?.eventName;

      if (
        eventName?.startsWith('message.') ||
        eventName?.startsWith('conversation.') ||
        eventName?.startsWith('user.') ||
        eventName === 'conversations_updated'
      ) {
        refreshConversations();
        refreshMessages();
      }
    };

    dbEventBus.addEventListener('db_changed', handleDbChange);
    return () => {
      dbEventBus.removeEventListener('db_changed', handleDbChange);
    };
  }, [refreshConversations, refreshMessages]);

  // Active conversation object
  const activeConversation = useMemo(() => {
    if (!selectedConversationId || !currentUser) return null;
    return prantikChat.getConversation(selectedConversationId, currentUser.id);
  }, [selectedConversationId, currentUser, conversations]);

  // Filtered conversation list
  const filteredConversations = useMemo(() => {
    if (!currentUser) return [];

    return conversations.filter((conv) => {
      const uState = conv.user_states?.[currentUser.id];
      const isArchived = Boolean(uState?.is_archived);

      // Filter tab checks
      if (filterTab === 'archived') {
        if (!isArchived) return false;
      } else {
        if (isArchived) return false;
        if (filterTab === 'waiting' && conv.mode !== 'WAITING_FOR_HUMAN') return false;
        if (filterTab === 'human' && conv.mode !== 'HUMAN_ACTIVE') return false;
        if (filterTab === 'ai' && conv.mode !== 'AI_ACTIVE' && conv.type !== 'AI') return false;
        if (filterTab === 'direct' && conv.type !== 'DIRECT') return false;
        if (filterTab === 'group' && conv.type !== 'GROUP') return false;
        if (filterTab === 'label' && conv.type !== 'LABEL_SUPPORT' && conv.type !== 'TEAM') return false;
        if (filterTab === 'unread' && (!uState?.unread_count || uState.unread_count <= 0)) return false;
      }

      // Search query check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = conv.title.toLowerCase().includes(q);
        const descMatch = conv.description?.toLowerCase().includes(q);
        const participantMatch = conv.participants.some((p) => p.user_name.toLowerCase().includes(q));
        const lastMsgMatch = conv.last_message?.text.toLowerCase().includes(q);
        return titleMatch || descMatch || participantMatch || lastMsgMatch;
      }

      return true;
    });
  }, [conversations, filterTab, searchQuery, currentUser]);

  // Total unread count
  const unreadTotal = useMemo(() => {
    if (!currentUser) return 0;
    return conversations.reduce((acc, c) => acc + (c.user_states?.[currentUser.id]?.unread_count || 0), 0);
  }, [conversations, currentUser]);

  // Send message through realtime server
  const sendMessage = useCallback(
    async (text: string, attachments?: ChatAttachment[], replyToMessageId?: string) => {
      if (!currentUser || !selectedConversationId) return;

      const isHumanStaff = ['OWNER', 'SUPER_ADMIN', 'ADMIN', 'EDITOR', 'MODERATOR'].includes(currentUser.role);
      let senderType = 'USER';
      if (currentUser.role === 'OWNER') senderType = 'CREATOR';
      else if (['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) senderType = 'ADMIN';
      else if (currentUser.role === 'EDITOR') senderType = 'PRESS';
      else if (currentUser.role === 'MODERATOR') senderType = 'SUPPORT';

      try {
        // Send to backend API which broadcasts over WebSocket
        const res = await realtimeChatClient.sendMessage({
          conversationId: selectedConversationId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderType,
          senderRole: currentUser.role,
          text,
          attachments,
          replyToMessageId,
        });

        // Also update local db cache
        const exists = (db.state.chat_messages || []).some((m) => m.id === res.message.id);
        if (!exists) {
          if (!db.state.chat_messages) db.state.chat_messages = [];
          db.state.chat_messages.push(res.message);
          db.saveState();
        }

        refreshMessages();
        refreshConversations();
        return res.message;
      } catch (err) {
        console.warn('[PRANTIK CHAT] Server send failed, falling back to local DB:', err);
        const fallbackMsg = prantikChat.sendMessage({
          conversationId: selectedConversationId,
          senderId: currentUser.id,
          text,
          attachments,
          replyToMessageId,
        });
        refreshMessages();
        refreshConversations();
        return fallbackMsg;
      }
    },
    [currentUser, selectedConversationId, refreshMessages, refreshConversations]
  );

  // Human Takeover action
  const takeoverChat = useCallback(
    async (conversationId: string) => {
      if (!currentUser) return;
      let operatorRole = 'ADMIN';
      if (currentUser.role === 'OWNER') operatorRole = 'CREATOR';
      else if (currentUser.role === 'EDITOR') operatorRole = 'PRESS';
      else if (currentUser.role === 'MODERATOR') operatorRole = 'SUPPORT';

      try {
        await realtimeChatClient.takeoverChat({
          conversationId,
          operatorId: currentUser.id,
          operatorName: currentUser.name,
          operatorRole,
        });

        // Update local state
        const conv = (db.state.chat_conversations || []).find((c) => c.id === conversationId);
        if (conv) {
          conv.mode = 'HUMAN_ACTIVE';
          conv.ai_enabled = false;
          conv.human_operator_id = currentUser.id;
          conv.human_operator_name = currentUser.name;
          conv.human_operator_role = operatorRole as HumanOperatorRole;
          conv.human_response_deadline = null;
          db.saveState();
        }
        refreshConversations();
      } catch (err) {
        console.error('Takeover failed:', err);
      }
    },
    [currentUser, refreshConversations]
  );

  // Return to AI action
  const returnToAi = useCallback(
    async (conversationId: string) => {
      try {
        await realtimeChatClient.returnToAi(conversationId);
        const conv = (db.state.chat_conversations || []).find((c) => c.id === conversationId);
        if (conv) {
          conv.mode = 'AI_ACTIVE';
          conv.ai_enabled = true;
          conv.human_operator_id = null;
          conv.human_operator_name = null;
          conv.human_response_deadline = null;
          db.saveState();
        }
        refreshConversations();
      } catch (err) {
        console.error('Return to AI failed:', err);
      }
    },
    [refreshConversations]
  );

  // Close Conversation action
  const closeConversation = useCallback(
    async (conversationId: string) => {
      if (!currentUser) return;
      try {
        await realtimeChatClient.closeConversation(conversationId, currentUser.name);
        const conv = (db.state.chat_conversations || []).find((c) => c.id === conversationId);
        if (conv) {
          conv.mode = 'CLOSED';
          conv.closed_at = new Date().toISOString();
          conv.human_response_deadline = null;
          db.saveState();
        }
        refreshConversations();
      } catch (err) {
        console.error('Close conversation failed:', err);
      }
    },
    [currentUser, refreshConversations]
  );

  // Real typing broadcast
  const sendTypingIndicator = useCallback(
    (isTypingNow: boolean) => {
      if (!currentUser || !selectedConversationId) return;
      if (isTypingNow) {
        realtimeChatClient.sendTypingStart(selectedConversationId, currentUser.id, currentUser.name);
      } else {
        realtimeChatClient.sendTypingStop(selectedConversationId, currentUser.id);
      }
    },
    [currentUser, selectedConversationId]
  );

  // Update Operator availability
  const updateOperatorPresence = useCallback(
    async (role: HumanOperatorRole, availability: HumanAvailability) => {
      if (!currentUser) return;
      try {
        await realtimeChatClient.updatePresence({
          operatorId: currentUser.id,
          operatorName: currentUser.name,
          role,
          availability,
        });
      } catch (err) {
        console.error('Update presence failed:', err);
      }
    },
    [currentUser]
  );

  // Update System settings
  const updateChatSettings = useCallback(
    async (settings: Partial<PrantikChatSystemSettings>) => {
      try {
        await realtimeChatClient.updateSettings(settings);
        setChatSettings((prev) => ({ ...prev, ...settings }));
      } catch (err) {
        console.error('Update settings failed:', err);
      }
    },
    []
  );

  const markActiveAsRead = useCallback(() => {
    if (!currentUser || !selectedConversationId) return;
    prantikChat.markAsRead(selectedConversationId, currentUser.id);
    refreshConversations();
  }, [currentUser, selectedConversationId, refreshConversations]);

  const addReaction = useCallback(
    (messageId: string, emoji: string) => {
      if (!currentUser) return;
      prantikChat.addReaction(messageId, currentUser.id, emoji);
      refreshMessages();
    },
    [currentUser, refreshMessages]
  );

  const deleteMessage = useCallback(
    (messageId: string, forEveryone = true) => {
      if (!currentUser) return;
      prantikChat.deleteMessage(messageId, currentUser.id, forEveryone);
      refreshMessages();
      refreshConversations();
    },
    [currentUser, refreshMessages, refreshConversations]
  );

  const editMessage = useCallback(
    (messageId: string, newText: string) => {
      if (!currentUser) return;
      prantikChat.editMessage(messageId, currentUser.id, newText);
      refreshMessages();
      refreshConversations();
    },
    [currentUser, refreshMessages, refreshConversations]
  );

  const togglePin = useCallback(
    (convId: string) => {
      if (!currentUser) return;
      const conv = prantikChat.getConversation(convId, currentUser.id);
      if (!conv) return;
      const currentPinned = Boolean(conv.user_states?.[currentUser.id]?.is_pinned);
      prantikChat.updateConversationUserState(convId, currentUser.id, {
        is_pinned: !currentPinned,
      });
      refreshConversations();
    },
    [currentUser, refreshConversations]
  );

  const toggleArchive = useCallback(
    (convId: string) => {
      if (!currentUser) return;
      const conv = prantikChat.getConversation(convId, currentUser.id);
      if (!conv) return;
      const currentArchived = Boolean(conv.user_states?.[currentUser.id]?.is_archived);
      prantikChat.updateConversationUserState(convId, currentUser.id, {
        is_archived: !currentArchived,
      });
      refreshConversations();
    },
    [currentUser, refreshConversations]
  );

  const toggleMute = useCallback(
    (convId: string) => {
      if (!currentUser) return;
      const conv = prantikChat.getConversation(convId, currentUser.id);
      if (!conv) return;
      const currentMuted = Boolean(conv.user_states?.[currentUser.id]?.is_muted);
      prantikChat.updateConversationUserState(convId, currentUser.id, {
        is_muted: !currentMuted,
      });
      refreshConversations();
    },
    [currentUser, refreshConversations]
  );

  const deleteLocally = useCallback(
    (convId: string) => {
      if (!currentUser) return;
      prantikChat.updateConversationUserState(convId, currentUser.id, {
        is_deleted_locally: true,
      });
      if (selectedConversationId === convId) {
        setSelectedConversationId(null);
      }
      refreshConversations();
    },
    [currentUser, selectedConversationId, refreshConversations]
  );

  const startDirectChat = useCallback(
    (targetUserId: string, initialMsg?: string) => {
      if (!currentUser) return;
      const conv = prantikChat.createDirectConversation(currentUser.id, targetUserId, initialMsg);
      refreshConversations();
      setSelectedConversationId(conv.id);
      return conv;
    },
    [currentUser, refreshConversations]
  );

  const startGroupChat = useCallback(
    (title: string, description: string, memberIds: string[], initialMsg?: string) => {
      if (!currentUser) return;
      const conv = prantikChat.createGroupConversation(
        currentUser.id,
        title,
        description,
        memberIds,
        initialMsg
      );
      refreshConversations();
      setSelectedConversationId(conv.id);
      return conv;
    },
    [currentUser, refreshConversations]
  );

  const startLabelChat = useCallback(
    (topic: LabelTopicType, subject: string, initialMsg: string, relatedRecordId?: string) => {
      if (!currentUser) return;
      const conv = prantikChat.createLabelConversation(
        currentUser.id,
        topic,
        subject,
        initialMsg,
        relatedRecordId
      );
      refreshConversations();
      setSelectedConversationId(conv.id);
      return conv;
    },
    [currentUser, refreshConversations]
  );

  const blockUser = useCallback(
    (targetUserId: string) => {
      if (!currentUser) return;
      prantikChat.blockUser(currentUser.id, targetUserId);
      refreshConversations();
    },
    [currentUser, refreshConversations]
  );

  const unblockUser = useCallback(
    (targetUserId: string) => {
      if (!currentUser) return;
      prantikChat.unblockUser(currentUser.id, targetUserId);
      refreshConversations();
    },
    [currentUser, refreshConversations]
  );

  const report = useCallback(
    (
      conversationId: string,
      reason: ChatReport['reason'],
      details: string,
      reportedUserId?: string,
      reportedMessageId?: string
    ) => {
      if (!currentUser) return;
      return prantikChat.reportConversation({
        reporterId: currentUser.id,
        conversationId,
        reason,
        details,
        reportedUserId,
        reportedMessageId,
      });
    },
    [currentUser]
  );

  return {
    conversations,
    filteredConversations,
    selectedConversationId,
    setSelectedConversationId,
    activeConversation,
    messages,
    filterTab,
    setFilterTab,
    searchQuery,
    setSearchQuery,
    inChatSearchQuery,
    setInChatSearchQuery,
    isTyping,
    isAiGenerating,
    operatorPresences,
    chatSettings,
    unreadTotal,
    sendMessage,
    takeoverChat,
    returnToAi,
    closeConversation,
    sendTypingIndicator,
    updateOperatorPresence,
    updateChatSettings,
    markActiveAsRead,
    addReaction,
    deleteMessage,
    editMessage,
    togglePin,
    toggleArchive,
    toggleMute,
    deleteLocally,
    startDirectChat,
    startGroupChat,
    startLabelChat,
    blockUser,
    unblockUser,
    report,
    refreshConversations,
    refreshMessages,
  };
}
