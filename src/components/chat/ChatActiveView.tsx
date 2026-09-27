import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Pin,
  VolumeX,
  Volume2,
  Archive,
  Info,
  Send,
  Paperclip,
  Smile,
  Mic,
  MicOff,
  MoreVertical,
  Reply,
  Copy,
  Edit2,
  Trash2,
  Flag,
  Check,
  CheckCheck,
  Clock,
  ArrowLeft,
  X,
  FileText,
  Music,
  Film,
  Sparkles,
  Bot,
  Shield,
  ShieldCheck,
  UserCheck,
  Disc,
  LifeBuoy,
} from 'lucide-react';
import {
  ChatConversation,
  ChatMessage,
  ChatAttachment,
  User,
  ChatReaction,
  OperatorPresence,
} from '../../types';
import { prantikChat } from '../../services/prantikChatService';

interface ChatActiveViewProps {
  conversation: ChatConversation;
  messages: ChatMessage[];
  currentUser: User;
  onBackMobile: () => void;
  onSendMessage: (text: string, attachments?: ChatAttachment[], replyToMessageId?: string) => void;
  onMarkAsRead: () => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onDeleteMessage: (messageId: string, forEveryone?: boolean) => void;
  onEditMessage: (messageId: string, newText: string) => void;
  onTogglePin: () => void;
  onToggleMute: () => void;
  onToggleArchive: () => void;
  onToggleInfoPanel: () => void;
  isInfoPanelOpen: boolean;
  onOpenReportModal: (messageId?: string, reportedUserId?: string, reportedUserName?: string) => void;
  onOpenAttachmentViewer: (attachment: ChatAttachment) => void;
  isTyping: string | null;
  isAiGenerating?: boolean;
  onTakeoverChat?: () => void;
  onReturnToAi?: () => void;
  onCloseConversation?: () => void;
  onTypingChange?: (isTyping: boolean) => void;
  operatorPresences?: OperatorPresence[];
}

export const ChatActiveView: React.FC<ChatActiveViewProps> = ({
  conversation,
  messages,
  currentUser,
  onBackMobile,
  onSendMessage,
  onMarkAsRead,
  onAddReaction,
  onDeleteMessage,
  onEditMessage,
  onTogglePin,
  onToggleMute,
  onToggleArchive,
  onToggleInfoPanel,
  isInfoPanelOpen,
  onOpenReportModal,
  onOpenAttachmentViewer,
  isTyping,
  isAiGenerating = false,
  onTakeoverChat,
  onReturnToAi,
  onCloseConversation,
  onTypingChange,
  operatorPresences = [],
}) => {
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [actionMenuMsgId, setActionMenuMsgId] = useState<string | null>(null);

  const isOperator = ['OWNER', 'SUPER_ADMIN', 'ADMIN', 'EDITOR', 'MODERATOR'].includes(currentUser.role);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  // Authoritative countdown timer derived from server human_response_deadline
  useEffect(() => {
    if (conversation.mode === 'WAITING_FOR_HUMAN' && conversation.human_response_deadline) {
      const updateCountdown = () => {
        const remaining = Math.max(
          0,
          Math.floor((new Date(conversation.human_response_deadline!).getTime() - Date.now()) / 1000)
        );
        setSecondsLeft(remaining);
      };
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    } else {
      setSecondsLeft(null);
    }
  }, [conversation.mode, conversation.human_response_deadline]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mark as read when opening or receiving messages
  useEffect(() => {
    onMarkAsRead();
  }, [conversation.id, messages.length, onMarkAsRead]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Voice recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (editingMessage) {
      if (inputText.trim()) {
        onEditMessage(editingMessage.id, inputText.trim());
        setEditingMessage(null);
        setInputText('');
      }
      return;
    }

    if (!inputText.trim() && attachments.length === 0) return;

    onSendMessage(inputText.trim(), attachments, replyingTo?.id);
    setInputText('');
    setAttachments([]);
    setReplyingTo(null);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    let type: ChatAttachment['type'] = 'document';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('audio/')) type = 'audio';
    else if (file.type.startsWith('video/')) type = 'video';

    const newAtt: ChatAttachment = {
      id: `att_${Date.now()}`,
      type,
      name: file.name,
      size_bytes: file.size,
      mime_type: file.type,
      url: URL.createObjectURL(file),
    };

    setAttachments((prev) => [...prev, newAtt]);
  };

  const handleStopAndSendVoice = () => {
    setIsRecordingVoice(false);
    const voiceAtt: ChatAttachment = {
      id: `att_voice_${Date.now()}`,
      type: 'audio',
      name: `Voice Note (${recordingSeconds}s).wav`,
      size_bytes: recordingSeconds * 16000,
      duration_seconds: recordingSeconds,
      url: '#',
    };
    onSendMessage(`🎙️ Voice Message (${recordingSeconds} seconds)`, [voiceAtt], replyingTo?.id);
    setReplyingTo(null);
  };

  const isPinned = Boolean(conversation.user_states?.[currentUser.id]?.is_pinned);
  const isMuted = Boolean(conversation.user_states?.[currentUser.id]?.is_muted);
  const isArchived = Boolean(conversation.user_states?.[currentUser.id]?.is_archived);

  // Other participant in direct conversation
  const otherParticipant = conversation.participants.find((p) => p.user_id !== currentUser.id);
  const isBlocked = otherParticipant ? prantikChat.isBlocked(currentUser.id, otherParticipant.user_id) : false;
  const presence = otherParticipant ? prantikChat.getUserPresence(otherParticipant.user_id, currentUser.id) : null;

  // Filter messages if search is active
  const displayedMessages = chatSearchQuery.trim()
    ? messages.filter((m) => m.text.toLowerCase().includes(chatSearchQuery.toLowerCase()))
    : messages;

  const quickEmojis = ['👍', '❤️', '🔥', '🎵', '👏', '🚀'];

  return (
    <div className="h-full flex flex-col bg-[#070709] relative">
      {/* Top Header */}
      <div className="px-4 py-3.5 border-b border-white/10 bg-[#09090d] flex items-center justify-between z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBackMobile}
            className="md:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Conversation Avatar */}
          <div className="relative shrink-0">
            {conversation.type === 'AI' ? (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-950 to-zinc-900 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Bot className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-xs font-bold text-rose-400">
                {(otherParticipant?.user_name || conversation.title).charAt(0).toUpperCase()}
              </div>
            )}
            {presence?.status === 'ONLINE' && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#09090d]" />
            )}
          </div>

          {/* Title & Metadata */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-sm text-white uppercase tracking-tight truncate">
                {conversation.type === 'DIRECT'
                  ? otherParticipant?.user_name || conversation.title
                  : conversation.title}
              </h3>
              {conversation.type === 'DIRECT' && otherParticipant && (
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-zinc-800 text-rose-400 border border-white/5">
                  {otherParticipant.user_role}
                </span>
              )}
              {conversation.topic && (
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-rose-950/50 text-rose-300 border border-rose-500/30">
                  {conversation.topic}
                </span>
              )}
            </div>

            <p className="text-[11px] text-zinc-400 truncate">
              {conversation.type === 'AI' ? (
                <span className="text-rose-400 flex items-center gap-1 font-mono">
                  <Sparkles className="w-3 h-3" /> Autonomous Label Assistant
                </span>
              ) : conversation.type === 'GROUP' ? (
                `${conversation.participants.length} participants`
              ) : presence?.status === 'ONLINE' ? (
                <span className="text-emerald-400 font-mono">Online</span>
              ) : presence?.last_seen ? (
                `Last seen ${new Date(presence.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              searchOpen ? 'bg-rose-950/50 text-rose-400' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            title="Search in conversation"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePin}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isPinned ? 'text-rose-400 bg-rose-950/40' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            title={isPinned ? 'Unpin thread' : 'Pin thread'}
          >
            <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={onToggleMute}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isMuted ? 'text-zinc-500 bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleInfoPanel}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isInfoPanelOpen
                ? 'bg-rose-600 text-white shadow'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            title="Conversation Details & Context"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-time Human + AI Mode Status Banner */}
      {conversation.mode === 'WAITING_FOR_HUMAN' && (
        <div className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                  Waiting for a Human Response…
                </span>
                {secondsLeft !== null && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-amber-900/60 text-amber-200 border border-amber-500/40">
                    {secondsLeft}s left in window
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-300 truncate">
                {conversation.waiting_notice ||
                  'A verified human team member has been notified. PRANTIK AI will automatically assist if no operator replies within the window.'}
              </p>
            </div>
          </div>
          {isOperator && onTakeoverChat && (
            <button
              onClick={onTakeoverChat}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Take Over Chat</span>
            </button>
          )}
        </div>
      )}

      {conversation.mode === 'HUMAN_ACTIVE' && (
        <div className="bg-emerald-950/30 border-b border-emerald-500/30 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  Human Chat Mode Active
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-900/60 text-emerald-200 border border-emerald-500/30">
                  A REAL HUMAN · {conversation.human_operator_role || 'ADMIN'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 truncate">
                Connected with {conversation.human_operator_name || 'Verified Human Operator'}. AI automatic responses are disabled.
              </p>
            </div>
          </div>
          {isOperator && (
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              {onReturnToAi && (
                <button
                  onClick={onReturnToAi}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-[10px] uppercase rounded-lg cursor-pointer transition-colors flex items-center gap-1 border border-white/10"
                  title="Return conversation to AI Assistant"
                >
                  <Bot className="w-3 h-3 text-rose-400" />
                  <span>Return to AI</span>
                </button>
              )}
              {onCloseConversation && (
                <button
                  onClick={onCloseConversation}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-red-950/60 border border-white/10 hover:border-red-500/40 text-zinc-400 hover:text-red-300 font-bold text-[10px] uppercase rounded-lg cursor-pointer transition-colors"
                  title="Close this conversation"
                >
                  Close
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {conversation.mode === 'AI_ACTIVE' && (
        <div className="bg-gradient-to-r from-rose-950/30 to-purple-950/30 border-b border-rose-500/20 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-rose-300 uppercase tracking-wide">
                  PRANTIK AI Assistant Active
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-rose-900/40 text-rose-300 border border-rose-500/30">
                  AUTONOMOUS AI
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                AI is assisting while human operators are attending other inquiries. A human operator can take over at any time.
              </p>
            </div>
          </div>
          {isOperator && onTakeoverChat && (
            <button
              onClick={onTakeoverChat}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase rounded-lg cursor-pointer transition-colors shrink-0 flex items-center gap-1 self-start sm:self-auto"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Take Over Chat</span>
            </button>
          )}
        </div>
      )}

      {conversation.mode === 'CLOSED' && (
        <div className="bg-zinc-900/80 border-b border-white/10 px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-zinc-400 font-mono">
            Thread Closed {conversation.closed_at ? `on ${new Date(conversation.closed_at).toLocaleDateString()}` : ''}
          </span>
          {isOperator && onTakeoverChat && (
            <button
              onClick={onTakeoverChat}
              className="text-[10px] px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-bold uppercase cursor-pointer"
            >
              Re-open Thread
            </button>
          )}
        </div>
      )}

      {/* In-chat Search Input (Collapsible) */}
      {searchOpen && (
        <div className="px-4 py-2 bg-zinc-950 border-b border-white/5 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              autoFocus
              placeholder="Search messages in this thread..."
              value={chatSearchQuery}
              onChange={(e) => setChatSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
            />
            {chatSearchQuery && (
              <button
                onClick={() => setChatSearchQuery('')}
                className="absolute right-2.5 top-2 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono whitespace-nowrap">
            {displayedMessages.length} match{displayedMessages.length === 1 ? '' : 'es'}
          </span>
        </div>
      )}

      {/* Messages Scroll Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayedMessages.length === 0 ? (
          <div className="py-20 text-center text-xs text-zinc-500 space-y-2">
            <Bot className="w-8 h-8 text-zinc-700 mx-auto" />
            <p className="font-semibold text-zinc-400">No messages found.</p>
            <p className="text-[11px] text-zinc-600">Send a note below to start the conversation.</p>
          </div>
        ) : (
          displayedMessages.map((msg, index) => {
            const isMe = msg.sender_id === currentUser.id;
            const isAi = msg.sender_role === 'AI';

            return (
              <div
                key={msg.id}
                className={`relative group flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Explicit Speaker Identity Badge: Real Human vs PRANTIK AI */}
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  {isAi || msg.sender_type === 'AI' || msg.ai_generated ? (
                    <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-gradient-to-r from-purple-950/80 to-rose-950/80 border border-purple-500/40 text-purple-200 shadow">
                      <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                      PRANTIK AI · Assistant
                    </span>
                  ) : ['ADMIN', 'SUPER_ADMIN', 'OWNER', 'CREATOR', 'PRESS', 'SUPPORT', 'MODERATOR'].includes(
                      msg.sender_type || msg.sender_role
                    ) ? (
                    <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 shadow">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                      A REAL HUMAN · {msg.sender_type || msg.sender_role}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-zinc-800 text-zinc-300 border border-white/5">
                      <UserCheck className="w-2.5 h-2.5 text-zinc-400" />
                      A REAL HUMAN · {isMe ? 'You' : msg.sender_name}
                    </span>
                  )}
                </div>

                {/* Quoted Reply Preview inside bubble */}
                {msg.reply_snippet && (
                  <div
                    className={`text-[10px] mb-1 p-2 rounded-t-lg border-l-2 max-w-[85%] sm:max-w-md truncate ${
                      isMe
                        ? 'bg-rose-950/40 border-rose-500 text-rose-200'
                        : 'bg-zinc-900 border-zinc-500 text-zinc-400'
                    }`}
                  >
                    <span className="font-bold">{msg.reply_snippet.sender_name}: </span>
                    <span>{msg.reply_snippet.text}</span>
                  </div>
                )}

                {/* Main Message Bubble */}
                <div
                  className={`relative p-3.5 rounded-2xl max-w-[85%] sm:max-w-lg text-xs leading-relaxed transition-all shadow-md ${
                    isMe
                      ? 'bg-rose-600 text-white rounded-br-none shadow-rose-950/20'
                      : isAi
                      ? 'bg-gradient-to-br from-zinc-900 to-zinc-950 border border-rose-500/30 text-zinc-100 rounded-bl-none shadow-lg'
                      : 'bg-zinc-900 border border-white/10 text-zinc-200 rounded-bl-none'
                  }`}
                >
                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="space-y-2 mb-2">
                      {msg.attachments.map((att) => (
                        <div key={att.id} className="rounded-xl overflow-hidden border border-white/10">
                          {att.type === 'image' && (
                            <img
                              src={att.url}
                              alt={att.name}
                              onClick={() => onOpenAttachmentViewer(att)}
                              className="max-h-60 w-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                            />
                          )}

                          {att.type === 'audio' && (
                            <div className="p-3 bg-black/40 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <Music className="w-5 h-5 text-emerald-400 shrink-0" />
                                <div className="truncate">
                                  <p className="font-bold text-xs truncate">{att.name}</p>
                                  <p className="text-[10px] text-zinc-400">Audio Recording</p>
                                </div>
                              </div>
                              <button
                                onClick={() => onOpenAttachmentViewer(att)}
                                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-[10px] font-bold uppercase cursor-pointer"
                              >
                                Play
                              </button>
                            </div>
                          )}

                          {att.type === 'document' && (
                            <div
                              onClick={() => onOpenAttachmentViewer(att)}
                              className="p-3 bg-black/40 flex items-center justify-between gap-3 cursor-pointer hover:bg-black/60 transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                                <div className="truncate">
                                  <p className="font-bold text-xs truncate">{att.name}</p>
                                  {att.size_bytes && (
                                    <p className="text-[10px] text-zinc-400">
                                      {(att.size_bytes / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 font-bold uppercase">
                                View
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Text Content */}
                  <p
                    className={`whitespace-pre-wrap break-words ${
                      msg.is_deleted ? 'italic text-zinc-400 opacity-80' : ''
                    }`}
                  >
                    {msg.text}
                  </p>

                  {/* Metadata footer: time, edited tag, status */}
                  <div
                    className={`mt-1.5 flex items-center justify-end gap-1.5 text-[10px] font-mono ${
                      isMe ? 'text-rose-200' : 'text-zinc-500'
                    }`}
                  >
                    {msg.is_edited && <span className="text-[9px] opacity-80">(edited)</span>}
                    <span>
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {/* Delivery Status Indicator */}
                    {isMe && (
                      <span className="inline-flex items-center">
                        {msg.status === 'sending' && <Clock className="w-3 h-3 animate-spin" />}
                        {msg.status === 'sent' && <Check className="w-3 h-3 text-rose-300" />}
                        {msg.status === 'delivered' && (
                          <CheckCheck className="w-3 h-3 text-rose-300" />
                        )}
                        {msg.status === 'read' && (
                          <CheckCheck className="w-3 h-3 text-white font-bold" />
                        )}
                      </span>
                    )}
                  </div>

                  {/* Emoji Reactions Bar */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 pt-1 border-t border-white/10">
                      {Array.from(new Set(msg.reactions.map((r) => r.emoji))).map((emoji) => {
                        const count = msg.reactions.filter((r) => r.emoji === emoji).length;
                        const hasReacted = msg.reactions.some(
                          (r) => r.emoji === emoji && r.user_id === currentUser.id
                        );
                        return (
                          <button
                            key={emoji}
                            onClick={() => onAddReaction(msg.id, emoji)}
                            className={`px-1.5 py-0.5 rounded-full text-[11px] flex items-center gap-1 border transition-colors cursor-pointer ${
                              hasReacted
                                ? 'bg-rose-950 border-rose-500/50 text-white'
                                : 'bg-black/30 border-white/10 text-zinc-300 hover:border-white/30'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className="text-[9px] font-bold font-mono">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Floating Message Action Bar on Hover */}
                {!msg.is_deleted && (
                  <div
                    className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-zinc-950 border border-white/10 rounded-lg p-0.5 shadow-xl z-10 ${
                      isMe ? 'right-0 -translate-y-full mb-1' : 'left-0 -translate-y-full mb-1'
                    }`}
                  >
                    {/* Quick Reactions */}
                    {quickEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => onAddReaction(msg.id, emoji)}
                        className="p-1 hover:bg-white/10 rounded text-xs transition-transform hover:scale-125 cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}

                    <div className="w-[1px] h-3.5 bg-white/10 mx-0.5" />

                    <button
                      onClick={() => setReplyingTo(msg)}
                      className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/10 cursor-pointer"
                      title="Reply"
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => navigator.clipboard.writeText(msg.text)}
                      className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/10 cursor-pointer"
                      title="Copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {isMe && (
                      <button
                        onClick={() => {
                          setEditingMessage(msg);
                          setInputText(msg.text);
                        }}
                        className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/10 cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {(isMe || currentUser.role === 'OWNER' || currentUser.role === 'SUPER_ADMIN') && (
                      <button
                        onClick={() => onDeleteMessage(msg.id, true)}
                        className="p-1 text-rose-400 hover:bg-rose-950/40 rounded cursor-pointer"
                        title="Delete for everyone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!isMe && (
                      <button
                        onClick={() => onOpenReportModal(msg.id, msg.sender_id, msg.sender_name)}
                        className="p-1 text-amber-400 hover:bg-amber-950/40 rounded cursor-pointer"
                        title="Report message"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-rose-400 font-mono animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span>{isTyping} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Blocked Banner */}
      {isBlocked ? (
        <div className="p-4 bg-zinc-950 border-t border-rose-500/20 text-center">
          <p className="text-xs text-rose-400 font-bold">You have blocked this contact.</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Unblock via the details panel to resume messaging.
          </p>
        </div>
      ) : (
        /* Message Composer */
        <div className="p-3 bg-[#09090d] border-t border-white/10 space-y-2">
          {/* Replying Banner */}
          {replyingTo && (
            <div className="flex items-center justify-between p-2 bg-zinc-900 border border-white/10 rounded-xl text-xs">
              <div className="flex items-center gap-2 truncate pr-2">
                <Reply className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="font-bold text-white truncate">{replyingTo.sender_name}:</span>
                <span className="text-zinc-400 truncate">{replyingTo.text}</span>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Editing Banner */}
          {editingMessage && (
            <div className="flex items-center justify-between p-2 bg-zinc-900 border border-amber-500/30 rounded-xl text-xs text-amber-300">
              <div className="flex items-center gap-2 truncate pr-2">
                <Edit2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-bold uppercase text-[10px]">Editing message</span>
              </div>
              <button
                onClick={() => {
                  setEditingMessage(null);
                  setInputText('');
                }}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Staged Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 bg-zinc-950 border border-white/5 rounded-xl">
              {attachments.map((att, idx) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-white truncate max-w-[140px]">{att.name}</span>
                  <button
                    onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                    className="p-0.5 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Recording Banner */}
          {isRecordingVoice ? (
            <div className="flex items-center justify-between p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                <span className="text-xs font-mono font-bold text-rose-300">
                  Recording Audio... {recordingSeconds}s
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRecordingVoice(false)}
                  className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStopAndSendVoice}
                  className="px-3.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          ) : (
            /* Input Bar */
            <form onSubmit={handleSend} className="flex items-center gap-2">
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,audio/*,video/*,application/pdf,.zip,.doc,.docx"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                title="Attach image, audio, or document"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                  showEmojiPicker
                    ? 'text-rose-400 bg-rose-950/40'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
                title="Emoji"
              >
                <Smile className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsRecordingVoice(true)}
                className="p-2.5 text-zinc-400 hover:text-rose-400 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                title="Record voice note"
              >
                <Mic className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message... (Enter to send)"
                className="flex-1 px-4 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
              />

              <button
                type="submit"
                disabled={!inputText.trim() && attachments.length === 0}
                className="p-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-lg shadow-rose-900/30 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Emoji Popover */}
          {showEmojiPicker && (
            <div className="p-2 bg-zinc-950 border border-white/10 rounded-xl flex items-center justify-between gap-1 shadow-2xl">
              {['😀', '😂', '🔥', '🎵', '❤️', '👏', '🚀', '💯', '🎧', '⚡', '🙌', '🙏'].map(
                (emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setInputText((prev) => prev + emoji);
                    }}
                    className="p-1.5 hover:bg-white/10 rounded text-base transition-transform hover:scale-125 cursor-pointer"
                  >
                    {emoji}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
