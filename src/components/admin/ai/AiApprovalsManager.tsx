import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Sparkles,
  RotateCcw,
  ArrowRight,
  FileCode2,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { useRealtimeData } from '../../../hooks/useRealtimeData';
import { db } from '../../../services/db';

export const AiApprovalsManager: React.FC = () => {
  const { aiApprovals } = useRealtimeData();
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [toast, setToast] = useState('');

  const handleApprove = (id: string, title: string) => {
    db.approveAiApproval(id);
    setToast(`Approved "${title}". Changes merged to deployment pipeline.`);
    setTimeout(() => setToast(''), 4000);
  };

  const handleReject = (id: string, title: string) => {
    db.rejectAiApproval(id, 'Prantik Sarkar (Owner)', feedbackMap[id]);
    setToast(`Rejected "${title}".`);
    setTimeout(() => setToast(''), 4000);
  };

  const handleRollback = (id: string) => {
    db.rollbackAiVersion(id);
    setToast(`Rollback executed for version snapshot.`);
    setTimeout(() => setToast(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="p-4 bg-zinc-900 border border-rose-500/40 rounded-xl text-xs font-semibold text-rose-300 flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-rose-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#0c0c12] border border-white/10 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h2 className="font-display font-black text-xl text-white tracking-tight uppercase">
            Human Approval Gate & Release Authorization
          </h2>
        </div>
        <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
          The human owner retains final authority. AI modifications exist strictly in isolated development sandboxes until reviewed and authorized by an Owner or Super Admin.
        </p>
      </div>

      {/* Approvals Cards */}
      <div className="space-y-4">
        {aiApprovals.map((appr) => (
          <div
            key={appr.id}
            className="bg-[#0c0c12] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] text-rose-400 font-bold uppercase">
                    {appr.id} • TASK: {appr.task_id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/60 text-amber-400 border border-amber-500/30">
                    Risk: {appr.risk_level}
                  </span>
                </div>
                <h3 className="font-display font-bold text-white text-lg">{appr.title}</h3>
                <p className="text-xs text-zinc-400">{appr.description}</p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold shrink-0 ${
                  appr.status === 'APPROVED'
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                    : appr.status === 'REJECTED'
                    ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                }`}
              >
                {appr.status}
              </span>
            </div>

            {/* Diff Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Files Changed</span>
                <p className="font-mono font-bold text-white">{appr.diff_summary.files_count}</p>
              </div>
              <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Additions</span>
                <p className="font-mono font-bold text-emerald-400">+{appr.diff_summary.additions}</p>
              </div>
              <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Deletions</span>
                <p className="font-mono font-bold text-rose-400">-{appr.diff_summary.deletions}</p>
              </div>
              <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Components</span>
                <p className="font-mono font-bold text-zinc-300 truncate">
                  {appr.diff_summary.components_added.join(', ') || 'Modifications only'}
                </p>
              </div>
            </div>

            {/* Actions for Pending */}
            {appr.status === 'PENDING' && (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
                <input
                  type="text"
                  placeholder="Optional review notes or feedback..."
                  value={feedbackMap[appr.id] || ''}
                  onChange={(e) =>
                    setFeedbackMap({ ...feedbackMap, [appr.id]: e.target.value })
                  }
                  className="w-full sm:w-80 px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-xs focus:border-rose-500 focus:outline-hidden"
                />

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleReject(appr.id, appr.title)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleApprove(appr.id, appr.title)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold uppercase tracking-wider text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Authorize Deployment</span>
                  </button>
                </div>
              </div>
            )}

            {/* Rollback Option for Approved */}
            {appr.status === 'APPROVED' && (
              <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
                <span className="text-zinc-400">
                  Deployed by <strong>{appr.reviewed_by}</strong> on {new Date(appr.reviewed_at || '').toLocaleDateString()}
                </span>

                <button
                  onClick={() => handleRollback(appr.id)}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-amber-400 hover:text-amber-300 font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rollback Deployed Change</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {aiApprovals.length === 0 && (
          <div className="p-8 bg-[#0c0c12] border border-white/10 rounded-2xl text-center text-zinc-500 text-xs">
            No change requests currently waiting for approval.
          </div>
        )}
      </div>
    </div>
  );
};
