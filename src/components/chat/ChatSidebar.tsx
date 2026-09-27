import React from 'react';
import {
  MessageSquare,
  Users,
  Shield,
  Bot,
  Search,
  Plus,
  Pin,
  Archive,
  VolumeX,
  Trash2,
  MoreVertical,
  CheckCheck,
  Disc,
  LifeBuoy,
} from 'lucide-react';
import { ChatConversation, User } from '../../types';
import { ChatFilterTab } from '../../hooks/usePrantikChat';
import { prantikChat } from '../../services/prantikChatService';

interface ChatSidebarProps {
  conversations: ChatConversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  currentUser: User;
  filterTab: ChatFilterTab;
  onFilterChange: (tab: ChatFilterTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  unreadTotal: number;
  onOpenNewChatModal: () => void;
  onTogglePin: (convId: string) => void;
  onToggleArchive: (convId: string) => void;
  onToggleMute: (convId: string) => void;
  onDeleteLocally: (convId: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentUser,
  filterTab,
  onFilterChange,
  searchQuery,
  onSearchChange,
  unreadTotal,
  onOpenNewChatModal,
  onTogglePin,
  onToggleArchive,
  onToggleMute,
  onDeleteLocally,
}) => {
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  const formatMessageTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getConversationIcon = (conv: ChatConversation) => {
    if (conv.type === 'AI') {
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-950 to-zinc-900 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
          <Bot className="w-5 h-5" />
        </div>
      );
    }
    if (conv.type === 'GROUP') {
      return (
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 shrink-0">
          <Users className="w-5 h-5" />
        </div>
      );
    }
    if (conv.type === 'TEAM') {
      return (
        <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <Disc className="w-5 h-5" />
        </div>
      );
    }
    if (conv.type === 'LABEL_SUPPORT') {
      return (
        <div className="w-10 h-10 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
          <Shield className="w-5 h-5" />
        </div>
      );
    }
    if (conv.type === 'USER_SUPPORT') {
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
          <LifeBuoy className="w-5 h-5" />
        </div>
      );
    }

    // Direct Conversation: Get other participant
    const otherParticipant = conv.participants.find((p) => p.user_id !== currentUser.id);
    const initial = otherParticipant?.user_name?.charAt(0).toUpperCase() || 'U';

    // Check presence
    const presence = otherParticipant ? prantikChat.getUserPresence(otherParticipant.user_id, currentUser.id) : null;
    const isOnline = presence?.status === 'ONLINE';

    return (
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-sm font-bold text-rose-400">
          {initial}
        </div>
        {isOnline && (
          <span
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#070709]"
            title="Online"
          />
        )}
      </div>
    );
  };

  const getConversationTitle = (conv: ChatConversation) => {
    if (conv.type === 'DIRECT') {
      const other = conv.participants.find((p) => p.user_id !== currentUser.id);
      return other?.user_name || conv.title;
    }
    return conv.title;
  };

  const getParticipantRoleBadge = (conv: ChatConversation) => {
    if (conv.type === 'DIRECT') {
      const other = conv.participants.find((p) => p.user_id !== currentUser.id);
      if (!other) return null;
      return (
        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-zinc-800 text-zinc-400 border border-white/5">
          {other.user_role}
        </span>
      );
    }
    if (conv.type === 'LABEL_SUPPORT' && conv.topic) {
      return (
        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-rose-950/50 text-rose-300 border border-rose-500/30">
          {conv.topic}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col bg-[#09090d] border-r border-white/10 select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-900/30">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-sm text-white tracking-wider uppercase">
              PRANTIK CHAT
            </h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
              Secure Label Comms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadTotal > 0 && (
            <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-mono font-bold rounded-full animate-pulse">
              {unreadTotal}
            </span>
          )}
          <button
            onClick={onOpenNewChatModal}
            className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors shadow cursor-pointer"
            title="Start New Conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-white/5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search conversations & contacts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-white/10 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5 overflow-x-auto text-[11px] font-bold uppercase tracking-wider scrollbar-none">
        <button
          onClick={() => onFilterChange('all')}
          className={`px-2.5 py-1 rounded-md shrink-0 transition-colors cursor-pointer ${
            filterTab === 'all'
              ? 'bg-rose-600 text-white shadow'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          All
        </button>
        <button
          onClick={() => onFilterChange('direct')}
          className={`px-2.5 py-1 rounded-md shrink-0 transition-colors cursor-pointer ${
            filterTab === 'direct'
              ? 'bg-rose-600 text-white shadow'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Direct
        </button>
        <button
          onClick={() => onFilterChange('group')}
          className={`px-2.5 py-1 rounded-md shrink-0 transition-colors cursor-pointer ${
            filterTab === 'group'
              ? 'bg-rose-600 text-white shadow'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Groups
        </button>
        <button
          onClick={() => onFilterChange('label')}
          className={`px-2.5 py-1 rounded-md shrink-0 transition-colors cursor-pointer ${
            filterTab === 'label'
              ? 'bg-rose-600 text-white shadow'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Label / Team
        </button>
        <button
          onClick={() => onFilterChange('ai')}
          className={`px-2.5 py-1 rounded-md shrink-0 transition-colors cursor-pointer ${
            filterTab === 'ai'
              ? 'bg-rose-600 text-white shadow'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          AI
        </button>
        <button
          onClick={() => onFilterChange('unread')}
          className={`px-2.5 py-1 rounded-md shrink-0 transition-colors cursor-pointer ${
            filterTab === 'unread'
              ? 'bg-rose-600 text-white shadow'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => onFilterChange('archived')}
          className={`px-2.5 py-1 rounded-md shrink-0 transition-colors cursor-pointer ${
            filterTab === 'archived'
              ? 'bg-rose-600 text-white shadow'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Archived
        </button>
      </div>

      {/* Conversation Cards List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500 space-y-2">
            <MessageSquare className="w-8 h-8 text-zinc-700 mx-auto" />
            <p className="font-semibold text-zinc-400">No conversations in this view.</p>
            <p className="text-[11px] text-zinc-600">Start a new thread or adjust filters above.</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = selectedConversationId === conv.id;
            const uState = conv.user_states?.[currentUser.id];
            const unreadCount = uState?.unread_count || 0;
            const isPinned = Boolean(uState?.is_pinned);
            const isMuted = Boolean(uState?.is_muted);
            const isArchived = Boolean(uState?.is_archived);

            return (
              <div
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv.id);
                  setActiveMenuId(null);
                }}
                className={`relative group p-3 rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-zinc-800/80 border border-white/10 shadow-lg'
                    : 'hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                {/* Avatar */}
                {getConversationIcon(conv)}

                {/* Info Center */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold text-xs text-white truncate">
                        {getConversationTitle(conv)}
                      </span>
                      {getParticipantRoleBadge(conv)}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                      {formatMessageTime(conv.last_message?.created_at || conv.updated_at)}
                    </span>
                  </div>

                  {/* Last Message Preview */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-zinc-400 truncate font-light">
                      {conv.last_message ? (
                        <>
                          <span className="font-medium text-zinc-300">
                            {conv.last_message.sender_id === currentUser.id ? 'You: ' : ''}
                          </span>
                          {conv.last_message.text}
                        </>
                      ) : (
                        <span className="italic text-zinc-500">No messages yet</span>
                      )}
                    </p>

                    {/* Status & Badges */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isPinned && <Pin className="w-3 h-3 text-rose-400 fill-current" />}
                      {isMuted && <VolumeX className="w-3 h-3 text-zinc-500" />}
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* More Options Menu Button */}
                <div className="relative shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === conv.id ? null : conv.id);
                    }}
                    className="p-1 text-zinc-500 hover:text-white rounded hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* Popover Action Menu */}
                  {activeMenuId === conv.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-6 z-30 w-44 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl p-1.5 text-xs space-y-0.5"
                    >
                      <button
                        onClick={() => {
                          onTogglePin(conv.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                      >
                        <Pin className="w-3.5 h-3.5" />
                        <span>{isPinned ? 'Unpin Chat' : 'Pin to Top'}</span>
                      </button>

                      <button
                        onClick={() => {
                          onToggleMute(conv.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>{isMuted ? 'Unmute' : 'Mute Notifications'}</span>
                      </button>

                      <button
                        onClick={() => {
                          onToggleArchive(conv.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>{isArchived ? 'Unarchive' : 'Archive Chat'}</span>
                      </button>

                      <div className="border-t border-white/5 my-1" />

                      <button
                        onClick={() => {
                          onDeleteLocally(conv.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Locally</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
