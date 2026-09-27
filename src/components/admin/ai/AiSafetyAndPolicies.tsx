import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Sparkles,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  XCircle,
  Cpu,
  Database,
  Terminal,
  Key,
} from 'lucide-react';
import { useRealtimeData } from '../../../hooks/useRealtimeData';
import { db } from '../../../services/db';
import { AiApprovalLevel } from '../../../types';

export const AiSafetyAndPolicies: React.FC = () => {
  const { aiPolicyConfig } = useRealtimeData();
  const [approvalLevel, setApprovalLevel] = useState<AiApprovalLevel>(
    aiPolicyConfig.approval_level
  );
  const [maxRuntime, setMaxRuntime] = useState(
    aiPolicyConfig.max_task_duration_seconds
  );
  const [dailyBudget, setDailyBudget] = useState(
    aiPolicyConfig.daily_budget_tokens
  );
  const [toast, setToast] = useState('');

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateAiPolicyConfig({
      approval_level: approvalLevel,
      max_task_duration_seconds: maxRuntime,
      daily_budget_tokens: dailyBudget,
    });
    setToast('AI safety policies and permission boundaries updated.');
    setTimeout(() => setToast(''), 4000);
  };

  const policyDescriptions: Record<AiApprovalLevel, string> = {
    READ_ONLY: 'AI can only inspect code and analyze logs. All code modifications are strictly prohibited.',
    SUGGEST: 'AI can create proposals and architecture specs, but cannot modify the file system.',
    DEVELOPMENT: 'AI can write and edit code in isolated development sandbox branches (Default).',
    PREVIEW: 'AI can build preview bundles and host ephemeral isolated review environments.',
    AUTO_PUBLISH: 'Low-risk CSS and typo fixes can auto-publish; critical changes still require Owner approval.',
  };

  const safetyLocks = [
    { title: 'No Unrestricted Shell Access', desc: 'AI model never receives raw bash shell or OS execution privileges.', status: 'LOCKED', icon: Terminal },
    { title: 'Strict Secret & Key Isolation', desc: 'Database passwords, API keys, and .env files are stripped from AST context.', status: 'LOCKED', icon: Key },
    { title: 'Read-Only Database Default', desc: 'Direct DDL/DML execution blocked. AI can only create proposed migrations.', status: 'LOCKED', icon: Database },
    { title: 'Self-Permission Grant Prevention', desc: 'AI cannot elevate its own permissions or alter approval policies.', status: 'LOCKED', icon: Lock },
    { title: 'Permanent Audit Trail', desc: 'Every model prompt, token consumption, and code diff is immutably logged.', status: 'ENFORCED', icon: ShieldCheck },
    { title: 'Human Master Pause Authority', desc: 'Owner has immediate server-authoritative killswitch over all background jobs.', status: 'ACTIVE', icon: ShieldAlert },
  ];

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
          <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h2 className="font-display font-black text-xl text-white tracking-tight uppercase">
            AI Safety Locks & Approval Policies
          </h2>
        </div>
        <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
          Configure autonomous permission thresholds, secret isolation firewalls, and hard stop conditions. Controlled exclusively by Platform Owner & Super Admins.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Policy Level & Configuration Form */}
        <div className="lg:col-span-2 bg-[#0c0c12] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="font-display font-bold text-white text-base uppercase flex items-center gap-2">
            <Sliders className="w-4 h-4 text-rose-400" />
            <span>Operational Permission Policy</span>
          </h3>

          <form onSubmit={handleSavePolicy} className="space-y-5 text-xs">
            {/* Policy Selector Options */}
            <div className="space-y-2">
              <label className="text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
                Automation Policy Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(['READ_ONLY', 'SUGGEST', 'DEVELOPMENT', 'PREVIEW', 'AUTO_PUBLISH'] as const).map(
                  (lvl) => {
                    const isSelected = approvalLevel === lvl;
                    return (
                      <div
                        key={lvl}
                        onClick={() => setApprovalLevel(lvl)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                          isSelected
                            ? 'bg-zinc-950 border-rose-500 text-white shadow-lg'
                            : 'bg-zinc-950/60 border-white/10 text-zinc-400 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs uppercase">{lvl}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          {policyDescriptions[lvl]}
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Runtime & Budget Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
                  Maximum Task Runtime (Seconds)
                </label>
                <input
                  type="number"
                  min={30}
                  max={900}
                  value={maxRuntime}
                  onChange={(e) => setMaxRuntime(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded-lg text-white font-mono text-xs focus:border-rose-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-zinc-500 block">
                  Hard timeout to prevent infinite task loops.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
                  Daily Token Budget Limit
                </label>
                <input
                  type="number"
                  step={50000}
                  min={50000}
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded-lg text-white font-mono text-xs focus:border-rose-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-zinc-500 block">
                  AI automatically pauses when daily token limit is reached.
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Save & Enforce Safety Policy</span>
            </button>
          </form>
        </div>

        {/* Right 1 Col: Immutable Safety Locks */}
        <div className="bg-[#0c0c12] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-display font-bold text-white text-base uppercase flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Immutable Safety Locks</span>
          </h3>

          <div className="space-y-3">
            {safetyLocks.map((lock, idx) => {
              const Icon = lock.icon;
              return (
                <div
                  key={idx}
                  className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-rose-400" />
                      <span className="font-bold text-white text-xs">{lock.title}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                      {lock.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed pl-5">{lock.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
