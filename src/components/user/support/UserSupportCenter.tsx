import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Send,
  X,
  Search,
  Filter,
  ShieldCheck,
  Bot,
} from 'lucide-react';
import { User, SupportTicket, SupportTicketMessage, SupportTicketPriority, SupportTicketStatus } from '../../../types';
import { db } from '../../../services/db';

interface UserSupportCenterProps {
  currentUser: User;
  onNavigateTab: (tab: string) => void;
}

export const UserSupportCenter: React.FC<UserSupportCenterProps> = ({
  currentUser,
  onNavigateTab,
}) => {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => db.getUserSupportTickets(currentUser.id));
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<SupportTicketPriority>('MEDIUM');
  const [newCategory, setNewCategory] = useState<SupportTicket['category']>('AI_CHAT');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshTickets = () => {
    const list = db.getUserSupportTickets(currentUser.id);
    setTickets(list);
    if (selectedTicketId) {
      setMessages(db.getSupportTicketMessages(selectedTicketId));
    }
  };

  useEffect(() => {
    refreshTickets();
  }, [currentUser.id]);

  useEffect(() => {
    if (selectedTicketId) {
      setMessages(db.getSupportTicketMessages(selectedTicketId));
    } else {
      setMessages([]);
    }
  }, [selectedTicketId]);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  // Create ticket
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDesc.trim()) return;

    const t = db.createSupportTicket(currentUser.id, {
      subject: newSubject,
      description: newDesc,
      priority: newPriority,
      category: newCategory,
    });

    setShowNewModal(false);
    setNewSubject('');
    setNewDesc('');
    refreshTickets();
    setSelectedTicketId(t.id);
    showToast('Support ticket created successfully.');
  };

  // Reply to ticket
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyText.trim()) return;

    db.sendSupportTicketMessage(selectedTicketId, currentUser.id, 'user', replyText);
    setReplyText('');
    refreshTickets();
    showToast('Reply transmitted to support team.');
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 border border-rose-500/50 text-white text-xs px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <LifeBuoy className="w-4 h-4 text-rose-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-white uppercase tracking-tight">
                SUPPORT ESCALATION DESK (/dashboard/support)
              </h2>
              <p className="text-xs text-zinc-400">
                Official management assistance for complex inquiries, billing adjustments, and verified bookings.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Create Support Ticket</span>
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Left Ticket List */}
        <div className="lg:col-span-4 bg-zinc-950 border border-white/10 rounded-xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
              My Support Tickets ({tickets.length})
            </h3>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto">
            {tickets.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-lg space-y-2">
                <p>No support tickets opened.</p>
                <p className="text-[11px] text-zinc-600">
                  If PRANTIK AI cannot answer a question, you can open a direct inquiry with human staff here.
                </p>
              </div>
            ) : (
              tickets.map((t) => {
                const isSelected = t.id === selectedTicketId;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all space-y-1.5 ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-500/40 text-white'
                        : 'bg-zinc-900/40 hover:bg-zinc-900 border-white/5 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                        {t.id}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase font-mono ${
                          t.status === 'OPEN'
                            ? 'bg-blue-950 text-blue-400 border border-blue-500/30'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            : t.status === 'WAITING_FOR_USER'
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-white uppercase truncate">{t.subject}</h4>
                    <p className="text-zinc-400 text-[11px] line-clamp-1">{t.description}</p>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1">
                      <span>Cat: {t.category}</span>
                      <span>{new Date(t.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Ticket Thread View */}
        <div className="lg:col-span-8 bg-zinc-950 border border-white/10 rounded-xl p-6 flex flex-col justify-between shadow-xl">
          {selectedTicket ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              {/* Ticket Details Header */}
              <div className="space-y-3 pb-4 border-b border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-display font-extrabold text-base text-white uppercase">
                    {selectedTicket.subject}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-mono">Priority:</span>
                    <span className="text-xs font-bold text-amber-400 font-mono uppercase">
                      {selectedTicket.priority}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
                  <span>Ticket ID: {selectedTicket.id}</span>
                  <span>•</span>
                  <span>Category: {selectedTicket.category}</span>
                  <span>•</span>
                  <span>Status: <strong className="text-white">{selectedTicket.status}</strong></span>
                </div>
              </div>

              {/* Message Thread */}
              <div className="space-y-3 max-h-[320px] overflow-y-auto p-4 bg-zinc-900/60 rounded-xl">
                {messages.map((m) => {
                  const isUser = m.sender_role === 'user';
                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-lg max-w-[85%] text-xs space-y-1 ${
                        isUser
                          ? 'ml-auto bg-rose-950/60 border border-rose-500/30 text-white'
                          : 'mr-auto bg-zinc-900 border border-white/10 text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span className="font-bold">{m.sender_name}</span>
                        <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="flex gap-2 pt-4">
                <input
                  type="text"
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a response to support..."
                  className="flex-1 px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-lg text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-zinc-500">
              <LifeBuoy className="w-10 h-10 text-zinc-600" />
              <p className="text-xs">Select a ticket from the left panel to inspect updates or send a reply.</p>
            </div>
          )}
        </div>
      </div>

      {/* NEW TICKET MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-rose-500">
                <LifeBuoy className="w-5 h-5" />
                <h3 className="font-display font-bold text-base text-white uppercase">
                  Open Support Ticket
                </h3>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 text-[10px] uppercase font-bold">Subject</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Summary of issue or question..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-bold">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white"
                  >
                    <option value="AI_CHAT">AI Assistant & Chat</option>
                    <option value="BILLING">Billing & Virtual Coins</option>
                    <option value="BOOKINGS">Tour & Booking Inquiries</option>
                    <option value="ACCOUNT">Account & Authentication</option>
                    <option value="TECHNICAL">Technical Bug / Issue</option>
                    <option value="GENERAL">General Management</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-bold">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 text-[10px] uppercase font-bold">Description</label>
                <textarea
                  rows={4}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Provide all necessary details..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded uppercase font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded uppercase font-bold text-xs"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
