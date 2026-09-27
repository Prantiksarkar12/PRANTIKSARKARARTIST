import React, { useState } from 'react';
import {
  FileCode2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Eye,
  ArrowRight,
  ShieldCheck,
  Plus,
  Minus,
  Layers,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { useRealtimeData } from '../../../hooks/useRealtimeData';
import { db } from '../../../services/db';
import { AiApproval } from '../../../types';

export const AiDiffViewer: React.FC = () => {
  const { aiApprovals } = useRealtimeData();
  const [selectedApproval, setSelectedApproval] = useState<AiApproval | null>(
    aiApprovals[0] || null
  );
  const [feedback, setFeedback] = useState('');
  const [toast, setToast] = useState('');

  const handleApprove = (id: string) => {
    db.approveAiApproval(id);
    setToast('Change approved and merged to production deployment pipeline.');
    setTimeout(() => setToast(''), 4000);
  };

  const handleReject = (id: string) => {
    db.rejectAiApproval(id, 'Prantik Sarkar (Owner)', feedback);
    setToast('Change rejected. AI task updated.');
    setTimeout(() => setToast(''), 4000);
    setFeedback('');
  };

  const handleRequestChanges = (id: string) => {
    if (!feedback.trim()) {
      setToast('Please write feedback in the notes field before requesting changes.');
      return;
    }
    db.requestChangesAiApproval(id, feedback);
    setToast('Changes requested. AI agent re-evaluating.');
    setTimeout(() => setToast(''), 4000);
    setFeedback('');
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

      {/* Main Diff Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Approvals/Diffs Selector */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-white text-sm uppercase">
            Synthesized Code Modifications ({aiApprovals.length})
          </h3>

          <div className="space-y-3">
            {aiApprovals.map((appr) => {
              const isSelected = selectedApproval?.id === appr.id;
              return (
                <div
                  key={appr.id}
                  onClick={() => setSelectedApproval(appr)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-zinc-950 border-rose-500/50 shadow-xl'
                      : 'bg-[#0c0c12] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-rose-400 font-bold uppercase block">
                        {appr.id} • {appr.risk_level} RISK
                      </span>
                      <h4 className="font-display font-bold text-white text-sm">{appr.title}</h4>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                        appr.status === 'APPROVED'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                          : appr.status === 'REJECTED'
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                          : appr.status === 'CHANGES_REQUESTED'
                          ? 'bg-purple-950/60 text-purple-400 border border-purple-500/30'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {appr.status}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2">{appr.description}</p>

                  <div className="flex items-center gap-3 text-[11px] font-mono pt-2 border-t border-white/5">
                    <span className="text-emerald-400">+{appr.diff_summary.additions} lines</span>
                    <span className="text-rose-400">-{appr.diff_summary.deletions} lines</span>
                    <span className="text-zinc-500">{appr.diff_summary.files_count} files</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Full Diff Inspector & Action Panel */}
        <div className="lg:col-span-2 bg-[#0c0c12] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          {selectedApproval ? (
            <div className="space-y-6">
              {/* Diff Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">
                    Change ID: {selectedApproval.id}
                  </span>
                  <h3 className="font-display font-black text-xl text-white mt-0.5">
                    {selectedApproval.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">{selectedApproval.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full font-mono text-xs font-bold bg-amber-950/60 text-amber-400 border border-amber-500/30">
                    Risk: {selectedApproval.risk_level}
                  </span>
                </div>
              </div>

              {/* Diff Summary Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Files Changed</span>
                  <p className="font-mono font-bold text-white">{selectedApproval.diff_summary.files_count}</p>
                </div>
                <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Lines Added</span>
                  <p className="font-mono font-bold text-emerald-400">+{selectedApproval.diff_summary.additions}</p>
                </div>
                <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Lines Removed</span>
                  <p className="font-mono font-bold text-rose-400">-{selectedApproval.diff_summary.deletions}</p>
                </div>
                <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Components Added</span>
                  <p className="font-mono font-bold text-zinc-200">
                    {selectedApproval.diff_summary.components_added.join(', ') || 'None'}
                  </p>
                </div>
              </div>

              {/* Code Diff Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5 font-bold">
                    <FileCode2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Isolated Code Diff</span>
                  </span>
                  <span>Unified Format</span>
                </div>

                <div className="p-4 bg-black rounded-xl border border-white/10 font-mono text-xs overflow-x-auto max-h-80 shadow-inner">
                  <pre className="text-zinc-300 leading-relaxed">
                    {(selectedApproval.diff_raw || 'No raw diff content available.').split('\n').map((line, i) => {
                      const isAdd = line.startsWith('+');
                      const isDel = line.startsWith('-');
                      const isHunk = line.startsWith('@@');
                      return (
                        <div
                          key={i}
                          className={`${
                            isAdd
                              ? 'bg-emerald-950/40 text-emerald-300 px-1 rounded'
                              : isDel
                              ? 'bg-rose-950/40 text-rose-300 px-1 rounded'
                              : isHunk
                              ? 'text-cyan-400 font-bold'
                              : 'text-zinc-400'
                          }`}
                        >
                          {line}
                        </div>
                      );
                    })}
                  </pre>
                </div>
              </div>

              {/* Feedback Input & Review Actions */}
              {selectedApproval.status === 'PENDING' && (
                <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 space-y-3">
                  <label className="text-zinc-300 font-bold uppercase tracking-wider text-[10px] flex items-center justify-between">
                    <span>Human Review Notes & Feedback</span>
                    <span className="text-zinc-500 text-[10px] normal-case">Optional for approval; required for change requests</span>
                  </label>
                  <textarea
                    rows={2}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="e.g. Please adjust the waveform bar height and add a volume attenuation multiplier..."
                    className="w-full px-3.5 py-2.5 bg-black border border-white/10 rounded-lg text-white placeholder:text-zinc-600 text-xs focus:border-rose-500 focus:outline-hidden resize-none"
                  />

                  <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                    <button
                      onClick={() => handleRequestChanges(selectedApproval.id)}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-zinc-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                      <span>Request Changes</span>
                    </button>

                    <button
                      onClick={() => handleReject(selectedApproval.id)}
                      className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject Modification</span>
                    </button>

                    <button
                      onClick={() => handleApprove(selectedApproval.id)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold uppercase tracking-wider text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Deploy to Production</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedApproval.status === 'APPROVED' && (
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Approved by <strong>{selectedApproval.reviewed_by}</strong></span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {new Date(selectedApproval.reviewed_at || '').toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-center text-zinc-500 text-xs">
              Select a code modification from the list to inspect diff.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
