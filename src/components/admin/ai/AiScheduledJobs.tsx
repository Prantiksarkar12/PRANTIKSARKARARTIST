import React, { useState } from 'react';
import {
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { useRealtimeData } from '../../../hooks/useRealtimeData';
import { db } from '../../../services/db';

export const AiScheduledJobs: React.FC = () => {
  const { aiScheduledJobs } = useRealtimeData();
  const [toast, setToast] = useState('');

  const handleToggle = (id: string) => {
    const isEnabled = db.toggleScheduledJob(id);
    setToast(isEnabled ? 'Monitor enabled.' : 'Monitor paused.');
    setTimeout(() => setToast(''), 3000);
  };

  const handleRunNow = (id: string, name: string) => {
    db.triggerScheduledJob(id);
    setToast(`Executing monitor "${name}" immediately...`);
    setTimeout(() => setToast(''), 3000);
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
          <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <h2 className="font-display font-black text-xl text-white tracking-tight uppercase">
            24/7 Autonomous Background Monitors
          </h2>
        </div>
        <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
          Scheduled recurring jobs that continuously evaluate runtime performance, log exceptions, audit secret isolation, and benchmark SEO health without modifying production without approval.
        </p>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aiScheduledJobs.map((job) => (
          <div
            key={job.id}
            className="bg-[#0c0c12] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase">
                      {job.interval_label}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-600">[{job.interval_cron}]</span>
                  </div>
                  <h3 className="font-display font-bold text-white text-base leading-snug">
                    {job.name}
                  </h3>
                </div>

                <button
                  onClick={() => handleToggle(job.id)}
                  className="cursor-pointer text-zinc-400 hover:text-white transition-colors"
                  title="Toggle active status"
                >
                  {job.enabled ? (
                    <ToggleRight className="w-7 h-7 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-zinc-600" />
                  )}
                </button>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">{job.description}</p>

              {/* Last Finding */}
              {job.last_finding && (
                <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-cyan-400" />
                    <span>Latest Diagnostic Finding</span>
                  </span>
                  <p className="text-zinc-300 text-xs">{job.last_finding}</p>
                </div>
              )}

              {/* Timestamp Details */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-500 pt-1">
                <div>
                  <span className="block text-[10px] text-zinc-600">Last Run</span>
                  <span className="text-zinc-300">
                    {job.last_run_at ? new Date(job.last_run_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-600">Next Scheduled</span>
                  <span className="text-emerald-400">
                    {new Date(job.next_run_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    job.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                  }`}
                />
                <span>{job.enabled ? 'RUNNING 24/7' : 'PAUSED'}</span>
              </span>

              <button
                onClick={() => handleRunNow(job.id, job.name)}
                disabled={job.last_status === 'RUNNING'}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-zinc-200 hover:text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${job.last_status === 'RUNNING' ? 'animate-spin text-rose-400' : ''}`} />
                <span>Run Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
