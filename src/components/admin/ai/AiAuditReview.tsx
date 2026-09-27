import React, { useState } from 'react';
import {
  Lightbulb,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Gauge,
  Eye,
  FileCode2,
  Wrench,
} from 'lucide-react';
import { useRealtimeData } from '../../../hooks/useRealtimeData';
import { db } from '../../../services/db';
import { AiAuditProposal } from '../../../types';

export const AiAuditReview: React.FC = () => {
  const { aiAuditProposals } = useRealtimeData();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAuditing, setIsAuditing] = useState(false);
  const [toast, setToast] = useState('');

  const categories = [
    'ALL',
    'PERFORMANCE',
    'SEO',
    'ACCESSIBILITY',
    'SECURITY',
    'UI_UX',
    'RESPONSIVENESS',
  ];

  const filteredProposals =
    selectedCategory === 'ALL'
      ? aiAuditProposals
      : aiAuditProposals.filter((p) => p.category === selectedCategory);

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      db.runAiWebsiteAudit();
      setIsAuditing(false);
      setToast('AI Audit completed: Evaluated performance, accessibility, and SEO.');
      setTimeout(() => setToast(''), 4000);
    }, 600);
  };

  const handleApplyFix = (proposalId: string) => {
    db.applyAuditProposal(proposalId);
    setToast('Isolated auto-fix task dispatched to preview sandbox.');
    setTimeout(() => setToast(''), 4000);
  };

  const getSeverityBadge = (sev: AiAuditProposal['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-400 border border-rose-500/40">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 text-amber-400 border border-amber-500/40">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-950/60 text-yellow-300 border border-yellow-500/30">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">LOW</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300">INFO</span>;
    }
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

      {/* Header & Run Audit Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0c0c12] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h2 className="font-display font-black text-xl text-white tracking-tight uppercase">
              Website Audit & Improvement Proposals
            </h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">
            Automated evaluation of UI/UX, Core Web Vitals, accessibility standards, structured data SEO, and security policies.
          </p>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={isAuditing}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-extrabold uppercase tracking-wider text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-950/50 shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>{isAuditing ? 'Auditing Website...' : 'AI Audit Website'}</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-cyan-600 text-black shadow'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Proposals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProposals.map((proposal) => (
          <div
            key={proposal.id}
            className="bg-[#0c0c12] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block">
                    {proposal.category} • {proposal.id}
                  </span>
                  <h3 className="font-display font-bold text-white text-base leading-snug">
                    {proposal.title}
                  </h3>
                </div>
                {getSeverityBadge(proposal.severity)}
              </div>

              {/* Evidence */}
              <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">
                  Diagnostic Evidence
                </span>
                <p className="text-zinc-300 text-xs leading-relaxed">{proposal.evidence}</p>
              </div>

              {/* Suggested Fix */}
              <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">
                  Suggested Fix
                </span>
                <p className="text-zinc-300 text-xs leading-relaxed">{proposal.suggested_fix}</p>
              </div>

              {/* Affected Files */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">
                  Affected Source Files
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {proposal.affected_files.map((f, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-zinc-900 border border-white/10 font-mono text-[10px] text-rose-300 flex items-center gap-1"
                    >
                      <FileCode2 className="w-3 h-3 text-zinc-500" />
                      <span>{f}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500 font-mono">
                Status: <strong className="text-white">{proposal.status}</strong>
              </span>

              {proposal.status === 'PROPOSED' && proposal.auto_fixable && (
                <button
                  onClick={() => handleApplyFix(proposal.id)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider text-[11px] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-950/50"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Auto-Fix in Sandbox</span>
                </button>
              )}

              {proposal.status === 'APPLIED' && (
                <span className="text-emerald-400 font-mono text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Fix Staged in Sandbox</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
