import React from 'react';
import {
  BarChart3,
  Cpu,
  Flame,
  Zap,
  CheckCircle2,
  DollarSign,
  Clock,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { useRealtimeData } from '../../../hooks/useRealtimeData';
import { db } from '../../../services/db';

export const AiUsageMetricsView: React.FC = () => {
  const { aiModelConfigs, aiTasks, aiPolicyConfig } = useRealtimeData();
  const metrics = db.getAiUsageMetrics();

  const completedCount = aiTasks.filter((t) => t.status === 'SUCCESS').length;
  const failedCount = aiTasks.filter((t) => t.status === 'FAILED').length;
  const inReviewCount = aiTasks.filter((t) => t.status === 'WAITING_APPROVAL').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0c0c12] border border-white/10 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h2 className="font-display font-black text-xl text-white tracking-tight uppercase">
            AI Cost & Token Consumption Analytics
          </h2>
        </div>
        <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
          Monitor token expenditure, daily budget limits, execution duration percentiles, and provider cost allocations in real time.
        </p>
      </div>

      {/* 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#0c0c12] border border-white/10 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Daily Token Usage</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {(metrics.totalTokensToday / 1000).toFixed(1)}k
          </div>
          <div className="space-y-1">
            <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden border border-white/5">
              <div
                className="h-full bg-rose-500"
                style={{ width: `${metrics.dailyUsagePercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>{metrics.dailyUsagePercent}% of limit</span>
              <span>{(metrics.dailyBudget / 1000).toFixed(0)}k max</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-[#0c0c12] border border-white/10 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Monthly Budget</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {(metrics.monthlyBudget / 1000000).toFixed(1)}M
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">Hard limit: 10,000,000 tokens/mo</p>
        </div>

        <div className="p-5 bg-[#0c0c12] border border-white/10 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Tasks Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {aiTasks.length > 0
              ? `${Math.round((completedCount / (aiTasks.length - inReviewCount || 1)) * 100)}%`
              : '100%'}
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">
            {completedCount} succeeded • {failedCount} failed
          </p>
        </div>

        <div className="p-5 bg-[#0c0c12] border border-white/10 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Avg. Synthesis Time</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">2.4s</div>
          <p className="text-[11px] text-zinc-500 font-mono">Sub-300ms AST parsing</p>
        </div>
      </div>

      {/* Model Breakdown Table */}
      <div className="bg-[#0c0c12] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-display font-bold text-white text-sm uppercase flex items-center gap-2">
          <Cpu className="w-4 h-4 text-rose-400" />
          <span>Model Provider Token Allocation</span>
        </h3>

        <div className="space-y-3">
          {aiModelConfigs.map((m) => (
            <div
              key={m.id}
              className="p-4 bg-zinc-950/80 rounded-xl border border-white/5 space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div>
                  <h4 className="font-bold text-white text-xs">{m.model_name}</h4>
                  <p className="text-[11px] text-zinc-500">{m.provider}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-rose-400 text-xs">
                    {m.tokens_used_today.toLocaleString()} tokens
                  </span>
                  <span className="text-[10px] text-zinc-500 block">
                    Daily Cap: {m.daily_token_budget.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-rose-500"
                  style={{
                    width: `${Math.min(100, (m.tokens_used_today / m.daily_token_budget) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
