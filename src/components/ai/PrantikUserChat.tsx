import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCw,
  Square,
  Mic,
  MicOff,
  Paperclip,
  Code2,
  Calculator,
  BookOpen,
  Search,
  PenTool,
  Music,
  Lightbulb,
  Sparkles,
  Bot,
  User as UserIcon,
  X,
  FileText,
  CornerDownLeft,
  ChevronRight,
  ShieldAlert,
  Edit2,
} from 'lucide-react';
import { UserChatMessage, UserChatConversation } from '../../types';

interface PrantikUserChatProps {
  onBackToSite?: () => void;
}

const STORAGE_CHATS_KEY = 'prantik_user_conversations_v1';
const STORAGE_MSGS_KEY = 'prantik_user_messages_v1';

const QUICK_ACTIONS = [
  {
    label: 'Maths',
    icon: Calculator,
    category: 'maths',
    prompt: 'Help me solve and explain this calculation step-by-step: calculate the compound growth of $5,000 at 8% annual yield over 7 years.',
  },
  {
    label: 'Coding',
    icon: Code2,
    category: 'coding',
    prompt: 'Write a TypeScript React hook for debouncing search input with error handling and unit test structure.',
  },
  {
    label: 'Explain a Topic',
    icon: BookOpen,
    category: 'general',
    prompt: 'Explain the difference between analog harmonic distortion and digital clipping in music mastering.',
  },
  {
    label: 'Research',
    icon: Search,
    category: 'research',
    prompt: 'Provide a structured research breakdown on the architectural evolution of UK drill and its migration into global hip hop.',
  },
  {
    label: 'Writing',
    icon: PenTool,
    category: 'writing',
    prompt: 'Draft an evocative 3-paragraph artist statement and EP release announcement for a cinematic dark hip hop album.',
  },
  {
    label: 'Music',
    icon: Music,
    category: 'music',
    prompt: 'Write an intricate 16-bar verse with multisyllabic rhymes and internal cadence variations about overcoming odds.',
  },
  {
    label: 'Creative Ideas',
    icon: Lightbulb,
    category: 'creative',
    prompt: 'Pitch 3 high-concept, cinematic music video treatments set in an underground cyberpunk cityscape.',
  },
];

export const PrantikUserChat: React.FC<PrantikUserChatProps> = ({ onBackToSite }) => {
  // Conversations State
  const [conversations, setConversations] = useState<UserChatConversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHATS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeConvId, setActiveConvId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHATS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0].id;
      }
    } catch {
      // fallback
    }
    return 'conv_' + Date.now();
  });

  // Messages State
  const [messages, setMessages] = useState<UserChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MSGS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: number; type: string }[]>([]);

  // Speech Recognition (Web Speech API)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.warn('Failed to save conversations to localStorage', e);
    }
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MSGS_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save messages to localStorage', e);
    }
  }, [messages]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Current active conversation's messages
  const activeMessages = messages.filter((m) => m.conversation_id === activeConvId);

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleSpeech = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Start new chat
  const handleNewChat = () => {
    const newId = 'conv_' + Date.now();
    setActiveConvId(newId);
    setInputText('');
    setAttachedFiles([]);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  // Delete conversation
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setMessages((prev) => prev.filter((m) => m.conversation_id !== id));
    if (activeConvId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        setActiveConvId(remaining[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  // File Upload Handling (Safe client simulation)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type || 'text/plain',
      }));
      setAttachedFiles((prev) => [...prev, ...files]);
    }
  };

  // Send message
  const handleSendMessage = async (customPrompt?: string, category?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() && attachedFiles.length === 0) return;
    if (isGenerating) return;

    // Ensure conversation exists in list
    if (!conversations.some((c) => c.id === activeConvId)) {
      const newConv: UserChatConversation = {
        id: activeConvId,
        title: textToSend.slice(0, 32) || 'New Conversation',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages_count: 1,
      };
      setConversations((prev) => [newConv, ...prev]);
    } else {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConvId ? { ...c, updated_at: new Date().toISOString() } : c))
      );
    }

    const userMsgId = 'msg_' + Date.now() + '_user';
    const userMessage: UserChatMessage = {
      id: userMsgId,
      conversation_id: activeConvId,
      role: 'user',
      content: textToSend,
      created_at: new Date().toISOString(),
      attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
      category: (category as any) || 'general',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setAttachedFiles([]);
    setIsGenerating(true);

    abortControllerRef.current = new AbortController();

    try {
      // Call isolated server backend
      const convHistory = [...activeMessages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: convHistory,
          category,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const assistantReply = data.content || 'I processed your request, but no response was returned.';

      const assistantMsgId = 'msg_' + Date.now() + '_assistant';
      const assistantMessage: UserChatMessage = {
        id: assistantMsgId,
        conversation_id: activeConvId,
        role: 'assistant',
        content: assistantReply,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Generation stopped by user
        return;
      }

      console.error('Chat API request error:', err);
      // Safe fallback response if offline or backend error
      const assistantMsgId = 'msg_' + Date.now() + '_assistant_err';
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          conversation_id: activeConvId,
          role: 'assistant',
          content:
            'I encountered a temporary connection glitch. Please check your network or try asking again.',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleRegenerate = () => {
    if (activeMessages.length === 0 || isGenerating) return;
    const lastUserMsg = [...activeMessages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content, lastUserMsg.category);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#050505] text-zinc-100 overflow-hidden font-sans relative">
      {/* Sidebar: History */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-[#0a0a0f] border-r border-white/10 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
            <span className="font-display font-black text-sm uppercase tracking-wider text-white">
              PRANTIK AI
            </span>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-rose-900/60 to-zinc-900 border border-rose-500/40 hover:border-rose-400 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between cursor-pointer transition-all shadow"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-400" />
              <span>New Chat</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-400">Ctrl+K</span>
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-none py-2">
          <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider px-2 font-bold block mb-1">
            Recent Conversations
          </span>
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-zinc-600 text-xs font-mono">
              No previous chats saved.
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  setActiveConvId(conv.id);
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className={`group flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  activeConvId === conv.id
                    ? 'bg-rose-950/40 text-white border border-rose-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="truncate pr-2 flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">{conv.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3 border-t border-white/10 text-[10px] text-zinc-500 space-y-1 font-mono">
          <div className="flex items-center justify-between text-zinc-400">
            <span>Isolation</span>
            <span className="text-emerald-400">Public User Gate</span>
          </div>
          <div>All queries verified against security boundary.</div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-[#050505] relative">
        {/* Top Navbar */}
        <div className="h-14 border-b border-white/10 bg-[#07070b]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-900 border border-white/10"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-sm uppercase tracking-wider text-white">
                  PRANTIK AI
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-light hidden sm:block">
                Music · Coding · Maths · Research · Creative Work
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              + New Chat
            </button>
            {onBackToSite && (
              <button
                onClick={onBackToSite}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                Back to Site
              </button>
            )}
          </div>
        </div>

        {/* Message Stream Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {activeMessages.length === 0 ? (
            /* Welcome / Zero State matching prompt */
            <div className="max-w-2xl mx-auto py-8 sm:py-12 space-y-8 text-center animate-in fade-in">
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 via-rose-900 to-amber-600 p-[1px] mx-auto shadow-xl">
                  <div className="w-full h-full bg-[#08080c] rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
                  </div>
                </div>

                <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
                  PRANTIK AI
                </h2>

                <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-md mx-auto leading-relaxed">
                  Your dedicated AI assistant for{' '}
                  <strong className="text-zinc-200 font-semibold">
                    Music • Coding • Maths • Research • Creative Work
                  </strong>
                  .
                </p>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="space-y-4">
                <span className="text-xs uppercase font-mono tracking-widest text-zinc-400 font-bold block">
                  What can I help with?
                </span>

                {/* Quick Action Pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
                  {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        onClick={() => handleSendMessage(action.prompt, action.category)}
                        className="px-3.5 py-2 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 border border-white/10 hover:border-rose-500/50 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-2 transition-all shadow hover:scale-102 active:scale-98 cursor-pointer"
                      >
                        <Icon className="w-3.5 h-3.5 text-rose-400" />
                        <span>[ {action.label} ]</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Message Thread */
            <div className="max-w-3xl mx-auto space-y-6">
              {activeMessages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        isUser
                          ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                          : 'bg-zinc-900 border-white/10 text-amber-400'
                      }`}
                    >
                      {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Bubble Content */}
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 sm:p-5 space-y-2 border text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-zinc-900/90 border-white/15 text-white'
                          : 'bg-[#0a0a10] border-white/10 text-zinc-200 shadow-xl'
                      }`}
                    >
                      {/* Attachments if any */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 pb-2">
                          {msg.attachments.map((file, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded bg-black/40 border border-white/10 text-[11px] font-mono flex items-center gap-1.5 text-zinc-300"
                            >
                              <FileText className="w-3 h-3 text-rose-400" />
                              <span className="truncate max-w-[120px]">{file.name}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Message Body with Markdown formatting */}
                      <div className="prose prose-invert prose-xs sm:prose-sm max-w-none space-y-3 font-normal leading-relaxed whitespace-pre-wrap">
                        {renderMarkdown(msg.content)}
                      </div>

                      {/* Assistant Actions Bar */}
                      {!isUser ? (
                        <div className="pt-2 border-t border-white/5 flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                            title="Copy reply"
                          >
                            {copiedMsgId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={handleRegenerate}
                            disabled={isGenerating}
                            className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-30"
                            title="Regenerate reply"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>Regenerate</span>
                          </button>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-white/5 flex items-center justify-end gap-3 text-[11px] text-zinc-400 font-mono">
                          <button
                            onClick={() => setInputText(msg.content)}
                            className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                            title="Edit message into input box"
                          >
                            <Edit2 className="w-3 h-3 text-rose-400" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                            title="Copy message"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Streaming / Loading Indicator */}
              {isGenerating && (
                <div className="flex items-start gap-3.5 animate-in fade-in">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="bg-[#0a0a10] border border-white/10 rounded-2xl p-4 text-xs text-zinc-400 flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span>PRANTIK AI is thinking...</span>
                    <button
                      onClick={handleStopGeneration}
                      className="ml-4 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Square className="w-2.5 h-2.5" />
                      <span>Stop</span>
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#07070b]/95 backdrop-blur-md">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* File attachment preview badge */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-1">
                {attachedFiles.map((f, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-zinc-900 border border-white/15 text-xs text-zinc-300 flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-rose-400" />
                    <span>{f.name}</span>
                    <button
                      onClick={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-zinc-500 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative rounded-2xl bg-zinc-950 border border-white/15 focus-within:border-rose-500/70 shadow-2xl transition-all p-2 flex items-end gap-2">
              {/* File upload hidden input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />

              {/* Action buttons: New Chat + Attach + Voice */}
              <div className="flex items-center gap-1 pb-1 pl-1">
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="New chat (＋)"
                >
                  <Plus className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Attach file / image (📎)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={toggleSpeech}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                  title={isListening ? 'Listening...' : 'Voice Input (Microphone)'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              {/* Main text area */}
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder="Ask anything... Maths, Coding, Research, Writing, Music"
                className="flex-1 max-h-32 min-h-[44px] py-2.5 px-2 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none resize-none"
              />

              {/* Send or Stop */}
              {isGenerating ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-transform active:scale-95 cursor-pointer shrink-0"
                  title="Stop generation"
                >
                  <Square className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() && attachedFiles.length === 0}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-30 disabled:hover:scale-100 text-white shadow-lg transition-transform active:scale-95 cursor-pointer shrink-0"
                  title="Send message (Enter)"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 px-2 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Isolated Server-Side AI Gateway</span>
              </span>
              <span>Shift+Enter for new line</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple clean markdown parser for code blocks, bold, headers
function renderMarkdown(content: string) {
  // Check for code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex, match.index),
      });
    }

    parts.push({
      type: 'code',
      language: match[1] || 'text',
      code: match[2],
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.substring(lastIndex),
    });
  }

  return (
    <>
      {parts.map((part, idx) => {
        if (part.type === 'code') {
          return (
            <div key={idx} className="my-3 rounded-xl bg-[#030305] border border-white/10 overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#0e0e14] border-b border-white/5 text-[11px] text-zinc-400">
                <span className="uppercase">{part.language}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(part.code || '')}
                  className="hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Code</span>
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto text-rose-200 scrollbar-thin">
                <code>{part.code}</code>
              </pre>
            </div>
          );
        }

        return <span key={idx}>{part.content}</span>;
      })}
    </>
  );
}
