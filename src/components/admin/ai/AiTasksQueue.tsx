import React, { useState } from 'react';
import {
  ListTodo,
  Terminal,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCode2,
  Cpu,
  RotateCcw,
  Square,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useRealtimeData } from '../../../hooks/useRealtimeData';
import { db } from '../../../services/db';
import { AiTask, AiTaskStatus } from '../../../types';

export const AiTasksQueue: React.FC = () => {
  const { aiTasks } = useRealtimeData();
  const [filter, setFilter] = useState<AiTaskStatus | 'ALL'>('ALL');
  const [selectedTask, setSelectedTask] = useState<AiTask | null>(aiTasks[0] || null);

  const filteredTasks =
    filter === 'ALL' ? aiTasks : aiTasks.filter((t) => t.status === filter);

  const handleCancel = (id: string) => {
    db.cancelAiTask(id);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0c0c12] border border-white/10 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-400 flex items-center justify-center">
            <ListTodo className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-base uppercase">
              AI Task Queue ({aiTasks.length})
            </h2>
            <p className="text-[11px] text-zinc-400">Isolated background execution, AST inspection, and sandbox builds</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(['ALL', 'RUNNING', 'WAITING_APPROVAL', 'SUCCESS', 'CANCELLED', 'FAILED'] as const).map(
            (st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                  filter === st
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Split: Task List & Execution Logs Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isSelected = selectedTask?.id === task.id;
            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-zinc-950 border-rose-500/50 shadow-xl'
                    : 'bg-[#0c0c12] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-rose-400 font-bold uppercase block">
                      {task.id} • {task.priority} PRIORITY
                    </span>
                    <h4 className="font-display font-bold text-white text-sm">{task.title}</h4>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
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

                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-2 border-t border-white/5">
                  <span>Scope: {task.scope}</span>
                  <span>Tokens: {task.token_usage?.toLocaleString() || '0'}</span>
                  <span>{new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })}

          {filteredTasks.length === 0 && (
            <div className="p-8 bg-[#0c0c12] border border-white/10 rounded-2xl text-center text-zinc-500 text-xs">
              No tasks matching filter "{filter}".
            </div>
          )}
        </div>

        {/* Task Terminal & Logs Viewer */}
        <div className="bg-[#0c0c12] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
          {selectedTask ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">
                    Agent: {selectedTask.agent}
                  </span>
                  <h3 className="font-display font-bold text-lg text-white mt-0.5">
                    {selectedTask.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">{selectedTask.description}</p>
                </div>

                {(selectedTask.status === 'RUNNING' || selectedTask.status === 'QUEUED') && (
                  <button
                    onClick={() => handleCancel(selectedTask.id)}
                    className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Cancel Task</span>
                  </button>
                )}
              </div>

              {/* Terminal Logs Window */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase font-bold">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-rose-400" />
                    <span>Live Sandbox Terminal Output</span>
                  </span>
                  <span>Max Runtime: {selectedTask.max_runtime_seconds}s</span>
                </div>

                <div className="p-4 bg-black rounded-xl border border-white/10 font-mono text-xs text-zinc-300 space-y-1.5 max-h-64 overflow-y-auto shadow-inner">
                  {selectedTask.logs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-zinc-600 select-none">{idx + 1}</span>
                      <span className="text-zinc-200">{log}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Build & Test Artifacts */}
              <div className="space-y-2 text-xs">
                {selectedTask.build_result && (
                  <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Build Result</span>
                    <p className="text-emerald-400 font-mono text-[11px]">{selectedTask.build_result}</p>
                  </div>
                )}

                {selectedTask.test_results && (
                  <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Automated Test Suite</span>
                    <p className="text-zinc-300 font-mono text-[11px]">{selectedTask.test_results}</p>
                  </div>
                )}

                {selectedTask.files_changed && selectedTask.files_changed.length > 0 && (
                  <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Files Staged for Sandbox</span>
                    <div className="space-y-1">
                      {selectedTask.files_changed.map((file, i) => (
                        <div key={i} className="font-mono text-[11px] text-rose-300 flex items-center gap-1.5">
                          <FileCode2 className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{file}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-center text-zinc-500 text-xs">
              Select a task from the queue to view live output logs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
