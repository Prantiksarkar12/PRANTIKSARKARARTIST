import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Shield,
  Users,
  Pin,
  VolumeX,
  Volume2,
  Archive,
  Trash2,
  Flag,
  Lock,
  Unlock,
  Plus,
  Crown,
  FileText,
  Music,
  Film,
  Download,
  ExternalLink,
  Bot,
  Disc,
} from 'lucide-react';
import {
  ChatConversation,
  ChatMessage,
  ChatAttachment,
  User,
} from '../../types';
import { prantikChat } from '../../services/prantikChatService';
import { db } from '../../services/db';

interface ChatContextPanelProps {
  conversation: ChatConversation;
  messages: ChatMessage[];
  currentUser: User;
  onClose: () => void;
  onTogglePin: () => void;
  onToggleMute: () => void;
  onToggleArchive: () => void;
  onDeleteLocally: () => void;
  onBlockUser: (targetUserId: string) => void;
  onUnblockUser: (targetUserId: string) => void;
  onOpenReportModal: () => void;
  onOpenAttachmentViewer: (attachment: ChatAttachment) => void;
}

export const ChatContextPanel: React.FC<ChatContextPanelProps> = ({
  conversation,
  messages,
  currentUser,
  onClose,
  onTogglePin,
  onToggleMute,
  onToggleArchive,
  onDeleteLocally,
  onBlockUser,
  onUnblockUser,
  onOpenReportModal,
  onOpenAttachmentViewer,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'media' | 'members'>('info');
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedNewMemberId, setSelectedNewMemberId] = useState('');

  const isPinned = Boolean(conversation.user_states?.[currentUser.id]?.is_pinned);
  const isMuted = Boolean(conversation.user_states?.[currentUser.id]?.is_muted);
  const isArchived = Boolean(conversation.user_states?.[currentUser.id]?.is_archived);

  // Other participant in direct chat
  const otherParticipant = conversation.participants.find((p) => p.user_id !== currentUser.id);
  const otherUser = otherParticipant ? db.getUserById(otherParticipant.user_id) : null;
  const isBlocked = otherParticipant ? prantikChat.isBlocked(currentUser.id, otherParticipant.user_id) : false;

  // Extract all media/files shared in this conversation
  const allAttachments: ChatAttachment[] = [];
  messages.forEach((m) => {
    if (m.attachments) {
      allAttachments.push(...m.attachments);
    }
  });

  const isGroupAdmin = conversation.type === 'GROUP' && (
    conversation.created_by === currentUser.id ||
    conversation.participants.find((p) => p.user_id === currentUser.id)?.is_group_admin
  );

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNewMemberId) return;
    prantikChat.manageGroupParticipant(conversation.id, currentUser.id, 'add', selectedNewMemberId);
    setShowAddMember(false);
    setSelectedNewMemberId('');
  };

  const handleRemoveMember = (targetUserId: string) => {
    if (confirm('Are you sure you want to remove this member from the group?')) {
      prantikChat.manageGroupParticipant(conversation.id, currentUser.id, 'remove', targetUserId);
    }
  };

  const handlePromoteAdmin = (targetUserId: string) => {
    prantikChat.manageGroupParticipant(conversation.id, currentUser.id, 'promote_admin', targetUserId);
  };

  const handleLeaveGroup = () => {
    if (confirm('Are you sure you want to leave this group?')) {
      prantikChat.manageGroupParticipant(conversation.id, currentUser.id, 'leave', currentUser.id);
      onClose();
    }
  };

  // Potential new members to add to group
  const nonMembers = (db.state.users || []).filter(
    (u) => !conversation.participant_ids.includes(u.id)
  );

  return (
    <div className="h-full w-80 md:w-88 bg-[#09090d] border-l border-white/10 flex flex-col z-20 select-none">
      {/* Panel Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="font-display font-extrabold text-xs text-white uppercase tracking-wider">
          Thread Details & Context
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 border-b border-white/10 text-[11px] font-bold uppercase tracking-wider bg-zinc-950/40">
        <button
          onClick={() => setActiveTab('info')}
          className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'info'
              ? 'border-rose-500 text-rose-400 bg-rose-950/20'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'media'
              ? 'border-rose-500 text-rose-400 bg-rose-950/20'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Files ({allAttachments.length})
        </button>
        {conversation.type === 'GROUP' && (
          <button
            onClick={() => setActiveTab('members')}
            className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'members'
                ? 'border-rose-500 text-rose-400 bg-rose-950/20'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Members
          </button>
        )}
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* TAB 1: OVERVIEW & PROFILE */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Identity Card */}
            <div className="text-center space-y-3 p-4 bg-zinc-950 border border-white/5 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-xl font-bold text-rose-400 mx-auto shadow-xl">
                {conversation.type === 'AI' ? (
                  <Bot className="w-8 h-8" />
                ) : (
                  (otherUser?.name || conversation.title).charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white uppercase">
                  {conversation.type === 'DIRECT' ? otherUser?.name || conversation.title : conversation.title}
                </h4>
                {otherUser && (
                  <div className="mt-1 flex items-center justify-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-zinc-800 text-rose-400 border border-white/5">
                      {otherUser.role}
                    </span>
                    {otherUser.country && (
                      <span className="text-[10px] text-zinc-500 font-mono">· {otherUser.country}</span>
                    )}
                  </div>
                )}
                {conversation.description && (
                  <p className="text-xs text-zinc-400 mt-2 font-light leading-relaxed">
                    {conversation.description}
                  </p>
                )}
              </div>
            </div>

            {/* Label Channel Metadata */}
            {conversation.type === 'LABEL_SUPPORT' && (
              <div className="p-3.5 bg-rose-950/20 border border-rose-500/20 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 uppercase text-[10px] font-bold font-mono">Label Topic</span>
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-rose-900/50 text-rose-300">
                    {conversation.topic}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 uppercase text-[10px] font-bold font-mono">Status</span>
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                    {conversation.status}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 pt-1">
                  Synchronized with PRANTIK SARKAR ARTIST RECORD executive operations desk.
                </p>
              </div>
            )}

            {/* Conversation Settings / Controls */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                Preferences
              </p>

              <button
                onClick={onTogglePin}
                className="w-full p-2.5 bg-zinc-950 hover:bg-zinc-900 border border-white/5 rounded-xl flex items-center justify-between text-xs text-zinc-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Pin className="w-4 h-4 text-zinc-400" />
                  <span>Pin Conversation</span>
                </div>
                <span className={`text-[10px] font-mono font-bold ${isPinned ? 'text-rose-400' : 'text-zinc-500'}`}>
                  {isPinned ? 'PINNED' : 'OFF'}
                </span>
              </button>

              <button
                onClick={onToggleMute}
                className="w-full p-2.5 bg-zinc-950 hover:bg-zinc-900 border border-white/5 rounded-xl flex items-center justify-between text-xs text-zinc-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-zinc-400" />}
                  <span>Mute Notifications</span>
                </div>
                <span className={`text-[10px] font-mono font-bold ${isMuted ? 'text-rose-400' : 'text-zinc-500'}`}>
                  {isMuted ? 'MUTED' : 'ACTIVE'}
                </span>
              </button>

              <button
                onClick={onToggleArchive}
                className="w-full p-2.5 bg-zinc-950 hover:bg-zinc-900 border border-white/5 rounded-xl flex items-center justify-between text-xs text-zinc-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Archive className="w-4 h-4 text-zinc-400" />
                  <span>Archive Conversation</span>
                </div>
                <span className={`text-[10px] font-mono font-bold ${isArchived ? 'text-rose-400' : 'text-zinc-500'}`}>
                  {isArchived ? 'ARCHIVED' : 'ACTIVE'}
                </span>
              </button>
            </div>

            {/* Safety & Moderation Controls */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                Safety & Moderation
              </p>

              {conversation.type === 'DIRECT' && otherParticipant && (
                <button
                  onClick={() => {
                    if (isBlocked) {
                      onUnblockUser(otherParticipant.user_id);
                    } else if (confirm(`Block ${otherParticipant.user_name}? They will no longer be able to message you.`)) {
                      onBlockUser(otherParticipant.user_id);
                    }
                  }}
                  className={`w-full p-2.5 border rounded-xl flex items-center gap-2.5 text-xs font-bold transition-colors cursor-pointer ${
                    isBlocked
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/50'
                      : 'bg-zinc-950 border-white/5 text-zinc-300 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  {isBlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  <span>{isBlocked ? 'Unblock Contact' : 'Block Contact'}</span>
                </button>
              )}

              <button
                onClick={onOpenReportModal}
                className="w-full p-2.5 bg-zinc-950 hover:bg-rose-950/30 border border-white/5 hover:border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-400 transition-colors cursor-pointer"
              >
                <Flag className="w-4 h-4" />
                <span>Report Thread or User</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Delete this conversation locally from your view?')) {
                    onDeleteLocally();
                  }
                }}
                className="w-full p-2.5 bg-zinc-950 hover:bg-zinc-900 border border-white/5 rounded-xl flex items-center gap-2.5 text-xs text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Locally</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SHARED MEDIA & FILES */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            {allAttachments.length === 0 ? (
              <div className="py-16 text-center text-xs text-zinc-500 space-y-1">
                <FileText className="w-8 h-8 text-zinc-700 mx-auto" />
                <p className="font-semibold text-zinc-400">No files shared yet</p>
                <p className="text-[11px] text-zinc-600">Files and images sent in this thread will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allAttachments.map((att) => (
                  <div
                    key={att.id}
                    onClick={() => onOpenAttachmentViewer(att)}
                    className="p-3 bg-zinc-950 border border-white/5 hover:border-white/20 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {att.type === 'image' && <Film className="w-4 h-4 text-rose-400 shrink-0" />}
                      {att.type === 'audio' && <Music className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {att.type === 'document' && <FileText className="w-4 h-4 text-blue-400 shrink-0" />}
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{att.name}</p>
                        {att.size_bytes && (
                          <p className="text-[10px] text-zinc-500 font-mono">
                            {(att.size_bytes / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                    </div>
                    <Download className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GROUP MEMBERS */}
        {activeTab === 'members' && conversation.type === 'GROUP' && (
          <div className="space-y-4">
            {isGroupAdmin && (
              <div>
                {!showAddMember ? (
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Member</span>
                  </button>
                ) : (
                  <form onSubmit={handleAddMember} className="p-3 bg-zinc-950 border border-white/10 rounded-xl space-y-2 text-xs">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">
                      Select User to Add
                    </label>
                    <select
                      value={selectedNewMemberId}
                      onChange={(e) => setSelectedNewMemberId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-white"
                    >
                      <option value="">-- Choose Contact --</option>
                      {nonMembers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={!selectedNewMemberId}
                        className="px-3 py-1 bg-rose-600 disabled:opacity-50 text-white rounded text-[10px] font-bold uppercase cursor-pointer"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddMember(false)}
                        className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded text-[10px] font-bold uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Members List */}
            <div className="space-y-2">
              {conversation.participants.map((p) => {
                const isGroupCreator = conversation.created_by === p.user_id;
                return (
                  <div
                    key={p.user_id}
                    className="p-2.5 bg-zinc-950 border border-white/5 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-xs font-bold text-rose-300 shrink-0">
                        {p.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">{p.user_name}</span>
                          {p.is_group_admin && (
                            <span title="Group Admin">
                              <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">{p.user_role}</span>
                      </div>
                    </div>

                    {isGroupAdmin && p.user_id !== currentUser.id && (
                      <div className="flex items-center gap-1 shrink-0">
                        {!p.is_group_admin && (
                          <button
                            onClick={() => handlePromoteAdmin(p.user_id)}
                            className="p-1 text-zinc-400 hover:text-amber-400 rounded"
                            title="Promote to admin"
                          >
                            <Crown className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveMember(p.user_id)}
                          className="p-1 text-zinc-400 hover:text-rose-400 rounded"
                          title="Remove from group"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/5">
              <button
                onClick={handleLeaveGroup}
                className="w-full py-2 bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Leave Group
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
