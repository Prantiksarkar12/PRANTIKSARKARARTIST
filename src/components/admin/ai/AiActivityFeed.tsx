import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Clock,
  Filter,
} from 'lucide-react';
import { useRealtimeData } from '../../../hooks/useRealtimeData';

export const AiActivityFeed: React.FC = () => {
  const { aiActivityEvents } = useRealtimeData();
  const [filter, setFilter] = useState<'ALL' | 'SUCCESS' | 'WARN' | 'ERROR' | 'INFO'>('ALL');

  const filteredEvents =
    filter === 'ALL'
      ? aiActivityEvents
      : aiActivityEvents.filter((e) => e.type === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0c0c12] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="font-display font-black text-xl text-white tracking-tight uppercase">
              AI Observability & Event Stream
            </h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">
            Real-time audit log of all model invocations, AST inspections, code synthesis runs, test passes, and approval handoffs.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(['ALL', 'SUCCESS', 'INFO', 'WARN', 'ERROR'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                filter === sev
                  ? 'bg-cyan-600 text-black shadow'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="bg-[#0c0c12] border border-white/10 rounded-2xl p-6 shadow-xl space-y-3 font-mono text-xs">
        {filteredEvents.map((act) => {
          return (
            <div
              key={act.id}
              className="p-3.5 bg-zinc-950/80 rounded-xl border border-white/5 hover:border-white/15 transition-colors flex items-start gap-3"
            >
              <div className="mt-0.5">
                {act.type === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {act.type === 'WARN' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {act.type === 'ERROR' && <XCircle className="w-4 h-4 text-rose-500" />}
                {act.type === 'INFO' && <Info className="w-4 h-4 text-cyan-400" />}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{act.event}</span>
                    {act.task_id && (
                      <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-rose-300 text-[10px]">
                        {act.task_id}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    {new Date(act.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 normal-case leading-relaxed">{act.details}</p>
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="p-8 text-center text-zinc-500 text-xs font-sans">
            No activity events recorded for filter "{filter}".
          </div>
        )}
      </div>
    </div>
  );
};
