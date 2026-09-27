import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';
import { ChatReport } from '../../types';

interface ReportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  reportedUserId?: string;
  reportedUserName?: string;
  reportedMessageId?: string;
  onSubmitReport: (
    conversationId: string,
    reason: ChatReport['reason'],
    details: string,
    reportedUserId?: string,
    reportedMessageId?: string
  ) => void;
}

export const ReportChatModal: React.FC<ReportChatModalProps> = ({
  isOpen,
  onClose,
  conversationId,
  reportedUserId,
  reportedUserName,
  reportedMessageId,
  onSubmitReport,
}) => {
  const [reason, setReason] = useState<ChatReport['reason']>('SPAM');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;
    onSubmitReport(conversationId, reason, details, reportedUserId, reportedMessageId);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDetails('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h3 className="font-display font-extrabold text-base text-white uppercase tracking-tight">
              Report Communication
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              ✓
            </div>
            <p className="font-bold text-white text-sm">Report Received</p>
            <p className="text-xs text-zinc-400">
              Our moderation team has been notified and will review this thread promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {reportedUserName && (
              <p className="text-zinc-400">
                Reporting communication involving <span className="text-white font-bold">{reportedUserName}</span>.
              </p>
            )}

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Violation Category *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ChatReport['reason'])}
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-rose-500"
              >
                <option value="SPAM">Spam, unsolicited promotion or bot</option>
                <option value="HARASSMENT">Harassment or abusive language</option>
                <option value="INAPPROPRIATE">Inappropriate or prohibited media</option>
                <option value="INTELLECTUAL_PROPERTY">Unauthorized music or IP theft</option>
                <option value="FRAUD">Impersonation, scam or financial fraud</option>
                <option value="OTHER">Other platform violation</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Incident Details *
              </label>
              <textarea
                rows={3}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain the specific issue with timestamps or context..."
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white resize-none focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 font-bold text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!details.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
