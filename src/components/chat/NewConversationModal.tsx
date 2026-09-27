import React, { useState } from 'react';
import { X, Users, MessageSquare, Shield, Search, Check, Disc, Music, FileText, DollarSign, Send } from 'lucide-react';
import { db } from '../../services/db';
import { User, LabelTopicType } from '../../types';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onStartDirect: (targetUserId: string, initialMsg?: string) => void;
  onStartGroup: (title: string, description: string, memberIds: string[], initialMsg?: string) => void;
  onStartLabel: (topic: LabelTopicType, subject: string, initialMsg: string) => void;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onStartDirect,
  onStartGroup,
  onStartLabel,
}) => {
  const [activeTab, setActiveTab] = useState<'direct' | 'group' | 'label'>('direct');
  const [searchUser, setSearchUser] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [directMsg, setDirectMsg] = useState('');

  // Group form state
  const [groupTitle, setGroupTitle] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [groupInitialMsg, setGroupInitialMsg] = useState('');

  // Label form state
  const [labelTopic, setLabelTopic] = useState<LabelTopicType>('DISTRIBUTION');
  const [labelSubject, setLabelSubject] = useState('');
  const [labelMsg, setLabelMsg] = useState('');

  if (!isOpen) return null;

  // Available users excluding current user
  const allUsers = (db.state.users || []).filter((u) => u.id !== currentUser.id);
  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.role.toLowerCase().includes(searchUser.toLowerCase())
  );

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    onStartDirect(selectedUser.id, directMsg);
    onClose();
  };

  const handleGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupTitle.trim() || selectedMemberIds.length === 0) return;
    onStartGroup(groupTitle, groupDesc, selectedMemberIds, groupInitialMsg);
    onClose();
  };

  const handleLabelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labelSubject.trim() || !labelMsg.trim()) return;
    onStartLabel(labelTopic, labelSubject, labelMsg);
    onClose();
  };

  const toggleGroupMember = (userId: string) => {
    if (selectedMemberIds.includes(userId)) {
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== userId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/60">
          <div>
            <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-tight">
              Start Conversation
            </h3>
            <p className="text-xs text-zinc-400">PRANTIK CHAT Internal Communications Grid</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 border-b border-white/10 text-xs font-bold uppercase tracking-wider bg-zinc-900/30">
          <button
            onClick={() => setActiveTab('direct')}
            className={`py-3 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'direct'
                ? 'border-rose-500 text-rose-400 bg-rose-950/20'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Direct Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('group')}
            className={`py-3 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'group'
                ? 'border-rose-500 text-rose-400 bg-rose-950/20'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>New Group</span>
          </button>
          <button
            onClick={() => setActiveTab('label')}
            className={`py-3 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'label'
                ? 'border-rose-500 text-rose-400 bg-rose-950/20'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Artist Line</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: DIRECT CHAT */}
          {activeTab === 'direct' && (
            <form onSubmit={handleDirectSubmit} className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search user by name, role or email..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* User Selection List */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto border border-white/5 rounded-xl p-2 bg-zinc-900/40">
                {filteredUsers.length === 0 ? (
                  <p className="p-4 text-center text-xs text-zinc-500">No users found.</p>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    return (
                      <div
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-rose-950/50 border border-rose-500/40 text-white'
                            : 'hover:bg-white/5 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold text-rose-400">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{u.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-zinc-800 text-zinc-300">
                                {u.role}
                              </span>
                            </div>
                            <span className="text-[11px] text-zinc-500">{u.email}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-rose-400" />}
                      </div>
                    );
                  })
                )}
              </div>

              {selectedUser && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Initial Message (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={directMsg}
                    onChange={(e) => setDirectMsg(e.target.value)}
                    placeholder={`Write a message to ${selectedUser.name}...`}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white resize-none focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedUser}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Start Chat</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: GROUP CHAT */}
          {activeTab === 'group' && (
            <form onSubmit={handleGroupSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Music Production Team"
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Description / Topic
                </label>
                <input
                  type="text"
                  placeholder="Purpose of this group conversation..."
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Select Members ({selectedMemberIds.length} selected)
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto border border-white/5 rounded-xl p-2 bg-zinc-900/40">
                  {allUsers.map((u) => {
                    const isSelected = selectedMemberIds.includes(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => toggleGroupMember(u.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-rose-950/40 border border-rose-500/30 text-white'
                            : 'hover:bg-white/5 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-rose-300">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-medium text-white">{u.name}</span>
                            <span className="text-[10px] text-zinc-500 ml-2 font-mono">({u.role})</span>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected ? 'bg-rose-600 border-rose-500' : 'border-zinc-700'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Initial Message (Optional)
                </label>
                <textarea
                  rows={2}
                  value={groupInitialMsg}
                  onChange={(e) => setGroupInitialMsg(e.target.value)}
                  placeholder="Welcome everyone to the group..."
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white resize-none focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!groupTitle.trim() || selectedMemberIds.length === 0}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Create Group</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ARTIST-TO-LABEL HOTLINE */}
          {activeTab === 'label' && (
            <form onSubmit={handleLabelSubmit} className="space-y-4">
              <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                <p className="font-semibold uppercase tracking-wider text-[10px]">
                  PRANTIK SARKAR ARTIST RECORD Communication Line
                </p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Connects directly with authorized label executive management (Owner & Super Admin) with full topic categorization.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Select Topic *
                </label>
                <select
                  value={labelTopic}
                  onChange={(e) => setLabelTopic(e.target.value as LabelTopicType)}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="DISTRIBUTION">Distribution & DSP Deliveries</option>
                  <option value="RELEASE">Single / Album Launch</option>
                  <option value="ISRC">ISRC & UPC / EAN Codes</option>
                  <option value="METADATA">Track Metadata & Credits</option>
                  <option value="DITTO">Ditto Music Distribution Sync</option>
                  <option value="PAYMENT">Royalty & Payment Inquiries</option>
                  <option value="AGREEMENT">Artist Agreements & Contracts</option>
                  <option value="DOCUMENTS">Stems & Legal Documents</option>
                  <option value="SUPPORT">Technical & General Label Support</option>
                  <option value="COLLABORATION">Featured Artist Collaboration</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master stem delivery for upcoming EP single"
                  value={labelSubject}
                  onChange={(e) => setLabelSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Detailed Message *
                </label>
                <textarea
                  rows={3}
                  required
                  value={labelMsg}
                  onChange={(e) => setLabelMsg(e.target.value)}
                  placeholder="Please state details regarding your track release, ISRC code, distribution, or billing..."
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white resize-none focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!labelSubject.trim() || !labelMsg.trim()}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Open Label Channel</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
