import {
  ChatConversation,
  ChatMessage,
  ConversationMode,
  HumanAvailability,
  HumanOperatorRole,
  OperatorPresence,
  PrantikChatSystemSettings,
} from '../types';

type EventCallback = (payload: any) => void;

class PrantikRealtimeChatClient {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private isConnecting: boolean = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pendingAuth: { userId: string; userName: string; userRole: string } | null = null;

  public connected: boolean = false;

  constructor() {
    // Auto-connect in browser environment
    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  public connect() {
    if (typeof window === 'undefined') return;
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.connected = true;
        this.isConnecting = false;
        console.log('[PRANTIK CHAT CLIENT] Connected to real-time server via WebSocket.');
        this.emitLocal('connection:status', { connected: true });

        if (this.pendingAuth) {
          this.authenticate(this.pendingAuth.userId, this.pendingAuth.userName, this.pendingAuth.userRole);
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const { event: eventName, payload } = parsed;
          if (eventName) {
            this.emitLocal(eventName, payload);
          }
        } catch (e) {
          console.warn('[PRANTIK CHAT CLIENT] Message parse error:', e);
        }
      };

      this.socket.onclose = () => {
        this.connected = false;
        this.isConnecting = false;
        this.emitLocal('connection:status', { connected: false });
        this.scheduleReconnect();
      };

      this.socket.onerror = (err) => {
        console.warn('[PRANTIK CHAT CLIENT] WebSocket error:', err);
        this.socket?.close();
      };
    } catch (e) {
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }

  public authenticate(userId: string, userName: string, userRole: string) {
    this.pendingAuth = { userId, userName, userRole };
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          event: 'auth',
          payload: { userId, userName, userRole },
        })
      );
    }
  }

  public on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emitLocal(event: string, payload: any) {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(payload);
        } catch (err) {
          console.error(`[PRANTIK CHAT CLIENT] Error in listener for ${event}:`, err);
        }
      });
    }
  }

  public send(event: string, payload: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event, payload }));
    }
  }

  // Real-time typing indicators
  public sendTypingStart(conversationId: string, userId: string, userName: string) {
    this.send('typing:start', { conversationId, userId, userName });
  }

  public sendTypingStop(conversationId: string, userId: string) {
    this.send('typing:stop', { conversationId, userId });
  }

  // REST + WebSocket resilient operations:
  public async sendMessage(params: {
    conversationId: string;
    senderId: string;
    senderName: string;
    senderType?: string;
    senderRole: string;
    text: string;
    attachments?: any[];
    replyToMessageId?: string;
  }): Promise<{ message: ChatMessage; conversation: ChatConversation }> {
    const res = await fetch('/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      throw new Error('Failed to deliver message to server.');
    }
    const data = await res.json();
    return data;
  }

  public async takeoverChat(params: {
    conversationId: string;
    operatorId: string;
    operatorName: string;
    operatorRole: string;
  }) {
    const res = await fetch('/api/chat/takeover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to take over chat.');
    return await res.json();
  }

  public async returnToAi(conversationId: string) {
    const res = await fetch('/api/chat/return-to-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId }),
    });
    if (!res.ok) throw new Error('Failed to return chat to AI.');
    return await res.json();
  }

  public async closeConversation(conversationId: string, operatorName: string) {
    const res = await fetch('/api/chat/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, operatorName }),
    });
    if (!res.ok) throw new Error('Failed to close conversation.');
    return await res.json();
  }

  public async updatePresence(params: {
    operatorId: string;
    operatorName: string;
    role: HumanOperatorRole;
    availability: HumanAvailability;
  }) {
    const res = await fetch('/api/chat/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to update presence.');
    return await res.json();
  }

  public async updateSettings(settings: Partial<PrantikChatSystemSettings>) {
    const res = await fetch('/api/chat/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update system settings.');
    return await res.json();
  }

  public async fetchSyncState() {
    const res = await fetch('/api/chat/sync');
    if (!res.ok) throw new Error('Failed to fetch sync state.');
    return await res.json();
  }
}

export const realtimeChatClient = new PrantikRealtimeChatClient();
