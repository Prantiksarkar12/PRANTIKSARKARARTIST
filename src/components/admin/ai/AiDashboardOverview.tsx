import React from 'react';
import {
  Sparkles,
  Bot,
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  FileCode2,
  Cpu,
  Layers,
  Flame,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useRealtimeData } from '../../../hooks/useRealtimeData';
import { db } from '../../../services/db';
import { AiTab } from './AiControlCenter';

interface AiDashboardOverviewProps {
  onNavigateTab: (tab: AiTab) => void;
  onRunAudit: () => void;
}

export const AiDashboardOverview: React.FC<AiDashboardOverviewProps> = ({
  onNavigateTab,
  onRunAudit,
}) => {
  const {
    aiAgentStatus,
    aiTasks,
    aiApprovals,
    aiFeatures,
    aiScheduledJobs,
    aiAuditProposals,
    aiModelConfigs,
    aiPolicyConfig,
    aiActivityEvents,
  } = useRealtimeData();

  const metrics = db.getAiUsageMetrics();
  const pendingApprovals = aiApprovals.filter((a) => a.status === 'PENDING');
  const recentTasks = aiTasks.slice(0, 5);
  const activeMonitors = aiScheduledJobs.filter((j) => j.enabled);

  return (
    <div className="space-y-6">
      {/* Pending Approvals High-Priority Callout */}
      {pendingApprovals.length > 0 && (
        <div className="p-5 bg-gradient-to-r from-amber-950/40 via-zinc-950 to-zinc-950 border border-amber-500/40 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-white text-base">
                  {pendingApprovals.length} Change Approval{pendingApprovals.length > 1 ? 's' : ''} Awaiting Review
                </h3>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                  ACTION REQUIRED
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                AI synthesized isolated code changes for "{pendingApprovals[0]?.title}". Human approval is required before production merge.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('approvals')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 cursor-pointer shrink-0 shadow-lg shadow-amber-950/50"
          >
            <span>Review Diff & Approve</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: 3 Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pillar 1: PRANTIK SITE AI Status & Capabilities */}
        <div className="bg-[#0c0c12] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display font-bold text-white text-sm">PRANTIK SITE AI</h2>
                <p className="text-[11px] text-zinc-500">Autonomous Engineering Agent</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              v2.4
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-zinc-950/60 rounded-lg border border-white/5">
              <span className="text-zinc-400">Agent Status</span>
              <span className="font-mono font-bold text-emerald-400">{aiAgentStatus}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-zinc-950/60 rounded-lg border border-white/5">
              <span className="text-zinc-400">Approval Policy</span>
              <span className="font-mono font-bold text-amber-400">{aiPolicyConfig.approval_level}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-zinc-950/60 rounded-lg border border-white/5">
              <span className="text-zinc-400">Primary Reasoning Model</span>
              <span className="font-mono font-bold text-white truncate max-w-[130px]">Gemini 3.1 Pro</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-zinc-950/60 rounded-lg border border-white/5">
              <span className="text-zinc-400">Diagnostic Model</span>
              <span className="font-mono font-bold text-zinc-300">Gemini 3.8 Flash</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('agent')}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Open Agent Workbench</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onNavigateTab('policies')}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Safety Rules
            </button>
          </div>
        </div>

        {/* Pillar 2: 24/7 Scheduled Monitor Heartbeat */}
        <div className="bg-[#0c0c12] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display font-bold text-white text-sm">24/7 Monitor Loop</h2>
                <p className="text-[11px] text-zinc-500">Autonomous Health & Web Vitals</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {activeMonitors.length} Active
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {aiScheduledJobs.slice(0, 4).map((job) => (
              <div
                key={job.id}
                className="p-2.5 bg-zinc-950/60 rounded-lg border border-white/5 flex items-center justify-between"
              >
                <div className="truncate max-w-[170px]">
                  <p className="font-semibold text-zinc-200 truncate">{job.name}</p>
                  <p className="text-[10px] text-zinc-500">{job.interval_label}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[10px] text-zinc-400 uppercase">{job.last_status}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('scheduled')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Manage 24/7 Schedules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onRunAudit}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Run Full Scan
            </button>
          </div>
        </div>

        {/* Pillar 3: Resource Budgets & Safety Locks */}
        <div className="bg-[#0c0c12] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display font-bold text-white text-sm">Safety & Budget</h2>
                <p className="text-[11px] text-zinc-500">Resource Limits & Sandbox Bounds</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              STRICT
            </span>
          </div>

          {/* Token Usage Bar */}
          <div className="space-y-1.5 p-3 bg-zinc-950/60 rounded-xl border border-white/5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">Daily Token Budget</span>
              <span className="font-mono font-bold text-white">
                {(metrics.totalTokensToday / 1000).toFixed(1)}k / {(metrics.dailyBudget / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all"
                style={{ width: `${metrics.dailyUsagePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-500">
              <span>{metrics.dailyUsagePercent}% utilized</span>
              <span>Auto-pause at 100%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-zinc-950/60 border border-white/5 rounded-lg">
              <span className="text-[10px] text-zinc-500 uppercase block font-bold">Secret Isolation</span>
              <span className="text-emerald-400 font-mono font-bold text-[11px]">ACTIVE</span>
            </div>
            <div className="p-2 bg-zinc-950/60 border border-white/5 rounded-lg">
              <span className="text-[10px] text-zinc-500 uppercase block font-bold">DB Read-Only</span>
              <span className="text-emerald-400 font-mono font-bold text-[11px]">ENFORCED</span>
            </div>
            <div className="p-2 bg-zinc-950/60 border border-white/5 rounded-lg">
              <span className="text-[10px] text-zinc-500 uppercase block font-bold">Shell Lockdown</span>
              <span className="text-emerald-400 font-mono font-bold text-[11px]">SANDBOXED</span>
            </div>
            <div className="p-2 bg-zinc-950/60 border border-white/5 rounded-lg">
              <span className="text-[10px] text-zinc-500 uppercase block font-bold">Max Runtime</span>
              <span className="text-zinc-300 font-mono font-bold text-[11px]">{aiPolicyConfig.max_task_duration_seconds}s</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('usage')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View Usage & Cost Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Split Section: Recent AI Tasks + Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent AI Tasks */}
        <div className="bg-[#0c0c12] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" />
              <h3 className="font-display font-bold text-white text-sm uppercase">Recent AI Tasks</h3>
            </div>
            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
            >
              View All ({aiTasks.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-zinc-950/80 border border-white/5 hover:border-white/15 rounded-xl transition-all text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white truncate max-w-[220px]">{task.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      task.status === 'SUCCESS'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        : task.status === 'WAITING_APPROVAL'
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                        : task.status === 'RUNNING'
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30 animate-pulse'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-1">{task.description}</p>
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>Scope: {task.scope}</span>
                  <span>{new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Autonomous Activity Feed */}
        <div className="bg-[#0c0c12] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="font-display font-bold text-white text-sm uppercase">Live Activity Stream</h3>
            </div>
            <button
              onClick={() => onNavigateTab('activity')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
            >
              Full Observability →
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {aiActivityEvents.slice(0, 5).map((act) => (
              <div
                key={act.id}
                className="p-3 bg-zinc-950/80 border border-white/5 rounded-xl flex items-start gap-2.5"
              >
                <span
                  className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                    act.type === 'SUCCESS'
                      ? 'bg-emerald-400'
                      : act.type === 'WARN'
                      ? 'bg-amber-400'
                      : act.type === 'ERROR'
                      ? 'bg-rose-500'
                      : 'bg-cyan-400'
                  }`}
                />
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[11px]">{act.event}</span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 normal-case">{act.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
