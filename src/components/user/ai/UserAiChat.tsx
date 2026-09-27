import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Bot,
  Send,
  Plus,
  Trash2,
  Edit2,
  Search,
  Copy,
  Check,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Star,
  AlertTriangle,
  Clock,
  Coins,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  Info,
  LifeBuoy,
  X,
  History,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { User, AiUserConversation, AiUserMessage, AiFreeAllowance, UserWallet, AiUsageSession } from '../../../types';
import { db, DEFAULT_COIN_PACKAGES } from '../../../services/db';

interface UserAiChatProps {
  currentUser: User;
  onNavigateTab: (tab: string) => void;
  onOpenSupportModal?: (conversationId?: string) => void;
  initialUsageView?: boolean;
}

export const UserAiChat: React.FC<UserAiChatProps> = ({
  currentUser,
  onNavigateTab,
  onOpenSupportModal,
  initialUsageView = false,
}) => {
  // State
  const [conversations, setConversations] = useState<AiUserConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiUserMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'chat' | 'usage'>(initialUsageView ? 'usage' : 'chat');

  // Wallet & Allowance
  const [wallet, setWallet] = useState<UserWallet>(() => db.getUserWallet(currentUser.id));
  const [allowance, setAllowance] = useState<AiFreeAllowance>(() => db.getUserFreeAllowance(currentUser.id));
  const [usageSessions, setUsageSessions] = useState<AiUsageSession[]>(() => db.getUserAiUsageSessions(currentUser.id));

  // Modals & UI
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reportModalMessage, setReportModalMessage] = useState<AiUserMessage | null>(null);
  const [reportReason, setReportReason] = useState<'Incorrect' | 'Unclear' | 'Not relevant' | 'Technical issue' | 'Other'>('Incorrect');
  const [reportDetails, setReportDetails] = useState('');
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [newTitleInput, setNewTitleInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Session Live Timer
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0);

  // Escalate to support modal state
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateSubject, setEscalateSubject] = useState('');
  const [escalateDesc, setEscalateDesc] = useState('');
  const [escalatePriority, setEscalatePriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load conversations on mount
  const refreshData = () => {
    const userConvs = db.getUserAiConversations(currentUser.id);
    setConversations(userConvs);
    if (!activeConvId && userConvs.length > 0) {
      setActiveConvId(userConvs[0].id);
    }
    const currentAllowance = db.getUserFreeAllowance(currentUser.id);
    setAllowance(currentAllowance);
    const currentWallet = db.getUserWallet(currentUser.id);
    setWallet(currentWallet);
    setUsageSessions(db.getUserAiUsageSessions(currentUser.id));
  };

  useEffect(() => {
    refreshData();
  }, [currentUser.id]);

  // Load messages whenever active conversation changes
  useEffect(() => {
    if (activeConvId) {
      const msgs = db.getUserAiMessages(activeConvId);
      setMessages(msgs);
    }
  }, [activeConvId]);

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Real countdown to next 24h reset
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');
  useEffect(() => {
    const updateCountdown = () => {
      const nextResetMs = new Date(allowance.next_reset_at).getTime();
      const diff = Math.max(0, nextResetMs - Date.now());
      if (diff === 0) {
        // Trigger server-side refresh
        const refreshed = db.getUserFreeAllowance(currentUser.id);
        setAllowance(refreshed);
        setWallet(db.getUserWallet(currentUser.id));
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeUntilReset(
        `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [allowance.next_reset_at, currentUser.id]);

  // Active AI Session Timer tracking
  useEffect(() => {
    if (isSessionActive) {
      timerRef.current = setInterval(() => {
        setSessionElapsedSeconds((prev) => {
          const next = prev + 1;
          // Check if user has sufficient allowance or coins
          if (allowance.free_seconds_remaining <= 0 && wallet.coin_balance <= 0) {
            // Auto stop when out of free time and coins
            handleEndSession(next);
            showToast('AI session ended: Free daily allowance & coin balance depleted.');
            return 0;
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSessionActive, allowance.free_seconds_remaining, wallet.coin_balance]);

  const handleStartSession = () => {
    setIsSessionActive(true);
    setSessionElapsedSeconds(0);
  };

  const handleEndSession = (elapsed = sessionElapsedSeconds) => {
    setIsSessionActive(false);
    if (elapsed > 0 && activeConvId) {
      // Record server-side usage
      const result = db.recordAiSessionUsage(currentUser.id, elapsed, activeConvId);
      setAllowance(db.getUserFreeAllowance(currentUser.id));
      setWallet(db.getUserWallet(currentUser.id));
      setUsageSessions(db.getUserAiUsageSessions(currentUser.id));
      showToast(`AI session recorded: ${elapsed}s active time (${result.freeSecondsUsed}s free, ${result.coinsUsed} coin)`);
    }
    setSessionElapsedSeconds(0);
  };

  // Create new conversation
  const handleNewConversation = () => {
    const conv = db.createUserAiConversation(currentUser.id, 'New Conversation');
    refreshData();
    setActiveConvId(conv.id);
    showToast('Started new conversation.');
  };

  // Delete conversation
  const handleDeleteConversation = (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation history? This cannot be undone.')) {
      db.deleteUserAiConversation(convId);
      refreshData();
      if (activeConvId === convId) {
        const remaining = db.getUserAiConversations(currentUser.id);
        setActiveConvId(remaining[0]?.id || null);
      }
      showToast('Conversation deleted.');
    }
  };

  // Rename conversation
  const handleSaveRename = (convId: string) => {
    if (newTitleInput.trim()) {
      db.renameUserAiConversation(convId, newTitleInput.trim());
      setEditingConvId(null);
      refreshData();
      showToast('Conversation renamed.');
    }
  };

  // Clear conversation messages
  const handleClearConversation = () => {
    if (!activeConvId) return;
    if (window.confirm('Clear all messages in this conversation?')) {
      db.clearUserAiMessages(activeConvId);
      setMessages([]);
      showToast('Conversation messages cleared.');
    }
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConvId || isLoading) return;

    const userText = inputText.trim();
    setInputText('');
    setIsLoading(true);

    // If session not active, start active timer
    if (!isSessionActive) {
      setIsSessionActive(true);
    }

    try {
      const assistantMsg = await db.sendUserAiMessage(activeConvId, currentUser.id, userText);
      setMessages(db.getUserAiMessages(activeConvId));
      refreshData();

      // Deduct active interaction time (minimum 5 seconds per exchange)
      db.recordAiSessionUsage(currentUser.id, 5, activeConvId);
      setAllowance(db.getUserFreeAllowance(currentUser.id));
      setWallet(db.getUserWallet(currentUser.id));
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to generate AI response.');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy message text
  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Copied to clipboard.');
  };

  // Rate message
  const handleRateMessage = (msgId: string, rating: 'helpful' | 'not_helpful', stars?: number) => {
    db.rateAiMessage(msgId, rating, stars);
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, rating, star_rating: stars || m.star_rating } : m))
    );
    showToast(`Feedback recorded (${rating === 'helpful' ? 'Helpful' : 'Not Helpful'}). Thank you!`);
  };

  // Submit report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalMessage) return;
    db.reportAiMessage(
      reportModalMessage.id,
      currentUser.id,
      currentUser.email,
      reportReason,
      reportDetails
    );
    setReportModalMessage(null);
    setReportDetails('');
    setMessages((prev) =>
      prev.map((m) => (m.id === reportModalMessage.id ? { ...m, is_reported: true } : m))
    );
    showToast('Report submitted. Our moderation team will review this response.');
  };

  // Regenerate last response
  const handleRegenerate = async () => {
    if (!activeConvId || isLoading || messages.length < 2) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    setIsLoading(true);
    try {
      await db.sendUserAiMessage(activeConvId, currentUser.id, lastUserMsg.content);
      setMessages(db.getUserAiMessages(activeConvId));
      refreshData();
      showToast('Response regenerated.');
    } catch (err: unknown) {
      showToast('Regeneration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Escalated Support Ticket
  const handleSubmitEscalation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalateSubject.trim() || !escalateDesc.trim()) return;

    db.createSupportTicket(currentUser.id, {
      subject: escalateSubject,
      description: escalateDesc,
      priority: escalatePriority,
      category: 'AI_CHAT',
      conversationId: activeConvId || undefined,
    });

    setShowEscalateModal(false);
    setEscalateSubject('');
    setEscalateDesc('');
    showToast('Support ticket opened! Management will review and reply shortly.');
    onNavigateTab('support');
  };

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  // Active conversation object
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConvId);
  }, [conversations, activeConvId]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 border border-rose-500/50 text-white text-xs px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-rose-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-white uppercase tracking-tight flex items-center gap-2">
                PRANTIK AI <span className="text-[10px] bg-rose-600/30 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded font-mono font-bold">LABEL & PORTAL INTELLIGENCE</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Official assistant for PRANTIK SARKAR ARTIST RECORD (Inside Label) & General AI Knowledge (Outside Label).
              </p>
            </div>
          </div>
        </div>

        {/* Real Server-Side Allowance & Coin Meters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Free Daily Allowance Meter */}
          <div className="p-2.5 bg-zinc-950 border border-white/10 rounded-lg flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase font-bold text-emerald-400 font-mono">FREE AI AVAILABLE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-xs font-bold text-white font-mono">
                {Math.floor(allowance.free_seconds_remaining / 60)}m {allowance.free_seconds_remaining % 60}s remaining
              </div>
              <div className="text-[9px] text-zinc-500 font-mono">
                Reset: {timeUntilReset || 'Calculating...'}
              </div>
            </div>
          </div>

          {/* Virtual Coin Balance */}
          <div className="p-2.5 bg-zinc-950 border border-white/10 rounded-lg flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-amber-400 font-mono">COINS BALANCE</span>
              <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                <span>{wallet.coin_balance} Coins</span>
                <span className="text-[9px] text-zinc-400 font-normal">({wallet.coin_balance * 5}m)</span>
              </div>
              <button
                onClick={() => onNavigateTab('wallet')}
                className="text-[9px] text-rose-400 hover:text-rose-300 uppercase font-semibold cursor-pointer underline decoration-rose-500/40"
              >
                + Buy Coins
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex bg-zinc-950 border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('chat')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'chat' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setViewMode('usage')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'usage' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Usage Log</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE CHAT WORKSPACE */}
      {viewMode === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px] bg-zinc-950 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          {/* Left Sidebar: Conversations & Search */}
          <div className="lg:col-span-4 bg-[#09090d] border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  Conversations ({conversations.length})
                </h3>
                <button
                  onClick={handleNewConversation}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-105"
                  title="New Conversation"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search threads..."
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-900/90 border border-white/10 rounded-md text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50"
                />
              </div>

              {/* Conversation List */}
              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-lg">
                    No matching conversations.
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const isActive = conv.id === activeConvId;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => setActiveConvId(conv.id)}
                        className={`group p-3 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-all border ${
                          isActive
                            ? 'bg-rose-950/40 border-rose-500/40 text-white'
                            : 'bg-zinc-900/40 hover:bg-zinc-900 border-white/5 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-rose-400' : 'text-zinc-500'}`} />
                          {editingConvId === conv.id ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleSaveRename(conv.id);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1"
                            >
                              <input
                                type="text"
                                value={newTitleInput}
                                onChange={(e) => setNewTitleInput(e.target.value)}
                                className="px-1.5 py-0.5 bg-zinc-950 border border-rose-500 text-xs text-white rounded"
                                autoFocus
                              />
                              <button
                                type="submit"
                                className="p-1 bg-rose-600 text-white rounded hover:bg-rose-500"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </form>
                          ) : (
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{conv.title}</p>
                              <p className="text-[10px] text-zinc-500 font-mono">
                                {new Date(conv.updated_at).toLocaleDateString()} · {conv.messages_count} msgs
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingConvId(conv.id);
                              setNewTitleInput(conv.title);
                            }}
                            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/10"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteConversation(conv.id, e)}
                            className="p-1 text-zinc-400 hover:text-rose-400 rounded hover:bg-white/10"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Support Escalation & Quick Prompts Footer */}
            <div className="p-4 border-t border-white/10 bg-zinc-950 space-y-3">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Quick Topic Inquiries (Inside & Outside Label)</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Check my release',
                    'What is the record label policy & roster cap?',
                    'How does Ditto distribution & 85/15 split work?',
                    'Check my application status',
                    'How do I stream Night Cypher tracks?',
                    'Explain audio mastering compression techniques',
                  ].map((quickQ, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputText(quickQ);
                      }}
                      className="text-[10px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-2 py-1 rounded border border-white/5 transition-colors text-left truncate max-w-full"
                    >
                      {quickQ}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setEscalateSubject(`Inquiry regarding: ${activeConversation?.title || 'AI Chat'}`);
                    setShowEscalateModal(true);
                  }}
                  className="w-full py-2 bg-zinc-900 hover:bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <LifeBuoy className="w-4 h-4 text-rose-500" />
                  <span>Escalate to Human Support</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Main Chat Area */}
          <div className="lg:col-span-8 flex flex-col justify-between bg-[#070709]">
            {/* Chat Header Bar */}
            <div className="px-6 py-3.5 bg-[#0a0a0f] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h3 className="text-xs font-bold text-white uppercase truncate max-w-[280px]">
                    {activeConversation?.title || 'Active AI Conversation'}
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Session model: PRANTIK AI • Grounded in Official Label Records & General Intelligence
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Active Session Timer Pill */}
                {isSessionActive ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 rounded text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Active: {Math.floor(sessionElapsedSeconds / 60)}m {sessionElapsedSeconds % 60}s</span>
                    <button
                      onClick={() => handleEndSession()}
                      className="ml-1 text-[10px] text-zinc-400 hover:text-white underline cursor-pointer"
                    >
                      Stop
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleStartSession}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 rounded text-xs font-mono cursor-pointer flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>Start Session</span>
                  </button>
                )}

                <button
                  onClick={handleClearConversation}
                  className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-white/5 rounded text-xs cursor-pointer"
                  title="Clear messages"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[500px]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-500">
                    <Bot className="w-6 h-6" />
                  </div>
                  <h4 className="font-display font-bold text-white uppercase text-sm">
                    How can PRANTIK AI assist you today?
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-sm">
                    Ask about label invitations, applications, Ditto distribution, ISRCs, releases, account security, or general music & production questions.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                    >
                      {/* Sender Meta & Source Badge */}
                      <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 px-1">
                        <span className="font-bold uppercase text-zinc-400">
                          {isUser ? currentUser.name : 'PRANTIK AI'}
                        </span>
                        <span>•</span>
                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                        {!isUser && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                              msg.source_type === 'label_authorized'
                                ? 'bg-amber-950/90 text-amber-300 border border-amber-500/40 shadow-sm'
                                : msg.source_type === 'clarification'
                                ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/40'
                                : msg.source_type === 'general_ai'
                                ? 'bg-zinc-800 text-zinc-300 border border-white/20'
                                : msg.source_type === 'website_data'
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                                : msg.source_type === 'policy'
                                ? 'bg-blue-950/80 text-blue-400 border border-blue-500/30'
                                : msg.source_type === 'account'
                                ? 'bg-purple-950/80 text-purple-400 border border-purple-500/30'
                                : 'bg-zinc-800 text-zinc-400 border border-white/10'
                            }`}
                          >
                            {msg.source_type === 'label_authorized'
                              ? 'OFFICIAL LABEL DATA'
                              : msg.source_type === 'clarification'
                              ? 'CLARIFICATION'
                              : msg.source_type === 'general_ai'
                              ? 'GENERAL AI KNOWLEDGE'
                              : msg.source_type === 'website_data'
                              ? 'REAL PORTAL DATA'
                              : msg.source_type === 'policy'
                              ? 'OFFICIAL POLICY'
                              : msg.source_type === 'account'
                              ? 'VERIFIED ACCOUNT DATA'
                              : 'AI GENERATED'}
                          </span>
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`p-4 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                          isUser
                            ? 'bg-rose-950/60 border border-rose-500/30 text-white rounded-tr-none'
                            : 'bg-zinc-900/90 border border-white/10 text-zinc-100 rounded-tl-none space-y-3'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>

                        {/* Real Interactive Navigation Action Button */}
                        {msg.navigation_action && (
                          <div className="pt-2 border-t border-white/10">
                            <button
                              onClick={() => {
                                if (msg.navigation_action?.target_tab) {
                                  onNavigateTab(msg.navigation_action.target_tab);
                                }
                              }}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider rounded text-[11px] flex items-center gap-1.5 cursor-pointer shadow-md transition-transform hover:translate-x-1"
                            >
                              <span>{msg.navigation_action.label}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* AI Response Interaction Actions (Rate, Copy, Report) */}
                      {!isUser && (
                        <div className="flex items-center gap-2 px-1 text-[11px] text-zinc-500">
                          {/* Copy */}
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                            title="Copy Response"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span className="text-[10px]">{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>

                          <span>·</span>

                          {/* Rate Helpful */}
                          <button
                            onClick={() => handleRateMessage(msg.id, 'helpful', 5)}
                            className={`flex items-center gap-1 transition-colors cursor-pointer ${
                              msg.rating === 'helpful' ? 'text-emerald-400 font-bold' : 'hover:text-emerald-400'
                            }`}
                            title="Helpful"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span className="text-[10px]">Helpful</span>
                          </button>

                          {/* Rate Not Helpful */}
                          <button
                            onClick={() => handleRateMessage(msg.id, 'not_helpful', 1)}
                            className={`flex items-center gap-1 transition-colors cursor-pointer ${
                              msg.rating === 'not_helpful' ? 'text-rose-400 font-bold' : 'hover:text-rose-400'
                            }`}
                            title="Not Helpful"
                          >
                            <ThumbsDown className="w-3 h-3" />
                            <span className="text-[10px]">Not Helpful</span>
                          </button>

                          <span>·</span>

                          {/* Report */}
                          <button
                            onClick={() => setReportModalMessage(msg)}
                            className="flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Report Inaccurate AI Response"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            <span className="text-[10px]">Report</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {isLoading && (
                <div className="flex items-center gap-2.5 p-3 bg-zinc-900/60 border border-white/10 rounded-lg text-xs text-zinc-400 animate-pulse">
                  <Bot className="w-4 h-4 text-rose-500 animate-spin" />
                  <span>PRANTIK AI is consulting official records and formulating response...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar & Actions */}
            <div className="p-4 bg-[#0a0a0f] border-t border-white/10 space-y-2">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask PRANTIK AI about label invitations, applications, ISRCs, Ditto, music, or general topics..."
                  className="flex-1 px-4 py-2.5 bg-zinc-950 border border-white/15 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 text-white font-bold uppercase tracking-wider rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-all shadow-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>

              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span>Press Enter to send • Verified server-authoritative knowledge base</span>
                {messages.length > 2 && (
                  <button
                    onClick={handleRegenerate}
                    disabled={isLoading}
                    className="hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate Response</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: AI USAGE HISTORY LOG */}
      {viewMode === 'usage' && (
        <div className="p-6 bg-zinc-950 border border-white/10 rounded-xl space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-extrabold text-lg text-white uppercase">
                AI Session Usage History (/dashboard/ai/usage)
              </h3>
              <p className="text-xs text-zinc-400">
                Server-measured active AI assistant usage sessions and consumed coins.
              </p>
            </div>
            <div className="text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded border border-white/10">
              Total Logged Sessions: <strong className="text-white">{usageSessions.length}</strong>
            </div>
          </div>

          {/* Usage Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/90 text-zinc-400 uppercase font-mono text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Session Date & Time</th>
                  <th className="py-3 px-4">Usage Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Coins Consumed</th>
                  <th className="py-3 px-4">AI Model</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {usageSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500">
                      No AI usage sessions recorded yet. Start a chat above!
                    </td>
                  </tr>
                ) : (
                  usageSessions.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-zinc-400">
                        {new Date(s.start_time).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            s.type === 'free'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {s.type === 'free' ? 'Free Daily AI' : 'Coin Usage'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {Math.floor(s.duration_seconds / 60)}m {s.duration_seconds % 60}s
                      </td>
                      <td className="py-3 px-4 text-amber-400 font-bold">
                        {s.coins_consumed > 0 ? `${s.coins_consumed} Coin` : '0 Coins (Free)'}
                      </td>
                      <td className="py-3 px-4 text-zinc-400">{s.model}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT RESPONSE MODAL */}
      {reportModalMessage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-rose-500">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-display font-bold text-base text-white uppercase">Report AI Response</h3>
              </div>
              <button
                onClick={() => setReportModalMessage(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
              <div className="p-3 bg-zinc-900 rounded border border-white/5 text-zinc-300 line-clamp-3 italic">
                "{reportModalMessage.content}"
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 text-[10px] uppercase font-bold">Reason for Report</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white"
                >
                  <option value="Incorrect">Incorrect information</option>
                  <option value="Unclear">Unclear / Confusing</option>
                  <option value="Not relevant">Not relevant to my question</option>
                  <option value="Technical issue">Technical issue / Bug</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 text-[10px] uppercase font-bold">Additional Details</label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Explain why this response was problematic..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalMessage(null)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded uppercase font-bold"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ESCALATE TO HUMAN SUPPORT MODAL */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-rose-500">
                <LifeBuoy className="w-5 h-5" />
                <h3 className="font-display font-bold text-base text-white uppercase">
                  Escalate to Human Support
                </h3>
              </div>
              <button
                onClick={() => setShowEscalateModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              If PRANTIK AI could not resolve your inquiry, an official support ticket will be opened with artist management.
            </p>

            <form onSubmit={handleSubmitEscalation} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 text-[10px] uppercase font-bold">Ticket Subject</label>
                <input
                  type="text"
                  required
                  value={escalateSubject}
                  onChange={(e) => setEscalateSubject(e.target.value)}
                  placeholder="e.g. Booking inquiry clarification or Ticket assistance"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-bold">Priority</label>
                  <select
                    value={escalatePriority}
                    onChange={(e) => setEscalatePriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-bold">Linked AI Thread</label>
                  <input
                    type="text"
                    disabled
                    value={activeConversation?.title || 'Current Thread'}
                    className="w-full px-3 py-2 bg-zinc-900/50 border border-white/5 rounded text-zinc-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 text-[10px] uppercase font-bold">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  value={escalateDesc}
                  onChange={(e) => setEscalateDesc(e.target.value)}
                  placeholder="Describe what you need assistance with..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded uppercase font-bold"
                >
                  Create Support Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
