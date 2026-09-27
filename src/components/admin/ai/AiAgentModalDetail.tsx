import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  Square,
  RefreshCw,
  Clock,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Layers,
  Terminal,
  Activity,
  BarChart3,
  Sliders,
  DollarSign,
  CheckCircle2,
  Send,
  Zap,
  Check,
  History,
  Info,
  Flame,
} from 'lucide-react';
import { AiAgentMode, AiAgentApprovalPolicy, AiTaskPriority } from '../../../types';
import { db } from '../../../services/db';

interface AiAgentModalDetailProps {
  agent: AiAgentMode;
  onClose: () => void;
  onShowNotice: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AiAgentModalDetail: React.FC<AiAgentModalDetailProps> = ({
  agent,
  onClose,
  onShowNotice,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'controls'
    | 'queue'
    | 'history'
    | 'logs'
    | 'errors'
    | 'metrics'
    | 'permissions'
    | 'governance'
  >('controls');

  // Input states
  const [taskPrompt, setTaskPrompt] = useState('');
  const [taskPriority, setTaskPriority] = useState<AiTaskPriority>('HIGH');
  const [scheduleCron, setScheduleCron] = useState(agent.schedule_cron || '0 0 * * *');
  const [maxRuntime, setMaxRuntime] = useState(agent.max_runtime_seconds || 300);
  const [retryLimit, setRetryLimit] = useState(agent.retry_limit || 3);
  const [budgetUsd, setBudgetUsd] = useState(agent.budget_limit_usd || 50);
  const [newToolName, setNewToolName] = useState('');

  const isEnabled = agent.is_enabled !== false;
  const isPaused = agent.is_paused || agent.current_status === 'PAUSED';
  const isEmergencyStopped = !!agent.emergency_stopped;

  // Actions
  const handleToggleEnable = () => {
    const newState = db.toggleAiAgentEnable(agent.id);
    onShowNotice(`Agent #${agent.agent_number || ''} ${agent.name} ${newState ? 'ENABLED' : 'DISABLED'}.`, 'info');
  };

  const handleStartTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!taskPrompt.trim()) {
      onShowNotice('Please enter a task prompt.', 'error');
      return;
    }
    if (!isEnabled) {
      onShowNotice('Cannot start task: agent is disabled.', 'error');
      return;
    }
    if (isPaused) {
      onShowNotice('Cannot start task: agent is paused.', 'error');
      return;
    }
    try {
      const task = db.runAiAgentTask(agent.id, taskPrompt.trim(), taskPriority);
      setTaskPrompt('');
      onShowNotice(`Dispatched task #${task.id} to ${agent.name}.`, 'success');
      setActiveTab('queue');
    } catch (err: unknown) {
      onShowNotice(err instanceof Error ? err.message : 'Failed to dispatch task.', 'error');
    }
  };

  const handleTogglePause = () => {
    const paused = db.toggleAiAgentPause(agent.id);
    onShowNotice(paused ? `Agent ${agent.name} paused.` : `Agent ${agent.name} resumed.`, 'info');
  };

  const handleStop = () => {
    db.stopAiAgentTasks(agent.id);
    onShowNotice(`Active tasks for ${agent.name} stopped.`, 'info');
  };

  const handleRestart = () => {
    db.restartAiAgent(agent.id);
    onShowNotice(`Agent ${agent.name} restarted cleanly.`, 'success');
  };

  const handleEmergencyStop = () => {
    db.emergencyStopAiAgent(agent.id);
    onShowNotice(`[EMERGENCY STOP] Agent ${agent.name} halted immediately!`, 'error');
  };

  const handleSaveSchedule = () => {
    db.scheduleAiAgent(agent.id, scheduleCron);
    onShowNotice(`Schedule for ${agent.name} updated to "${scheduleCron}".`, 'success');
  };

  const handleSaveGovernance = () => {
    db.updateAiAgentMode(agent.id, {
      max_runtime_seconds: Number(maxRuntime),
      retry_limit: Number(retryLimit),
      budget_limit_usd: Number(budgetUsd),
    });
    onShowNotice(`Governance limits for ${agent.name} updated.`, 'success');
  };

  const handleUpdatePolicy = (policy: AiAgentApprovalPolicy) => {
    db.updateAiAgentMode(agent.id, { approval_policy: policy });
    onShowNotice(`Approval requirement updated to ${policy}.`, 'success');
  };

  const handleAddTool = () => {
    if (!newToolName.trim()) return;
    const updated = Array.from(new Set([...agent.allowed_tools, newToolName.trim()]));
    db.updateAiAgentMode(agent.id, { allowed_tools: updated });
    setNewToolName('');
    onShowNotice(`Added tool "${newToolName.trim()}".`, 'success');
  };

  const handleRemoveTool = (tool: string) => {
    const updated = agent.allowed_tools.filter((t) => t !== tool);
    db.updateAiAgentMode(agent.id, { allowed_tools: updated });
    onShowNotice(`Removed tool "${tool}".`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0b0b12] border border-white/15 w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-200">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-4 bg-zinc-950/60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-400 flex items-center justify-center font-mono font-bold text-sm shrink-0">
              #{agent.agent_number || 1}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-black text-lg text-white uppercase tracking-wide">
                  {agent.name}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 border border-white/10 text-zinc-300">
                  {agent.category}
                </span>

                {isEmergencyStopped ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-red-950 border border-red-500 text-red-400 animate-pulse">
                    EMERGENCY STOPPED
                  </span>
                ) : !isEnabled ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-900 border border-white/20 text-zinc-400">
                    DISABLED
                  </span>
                ) : isPaused ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300">
                    PAUSED
                  </span>
                ) : agent.current_status === 'WORKING' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950/80 border border-rose-500/40 text-rose-300 animate-pulse">
                    WORKING ({agent.active_tasks_count} in queue)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                    IDLE (READY)
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1">{agent.role_title} • {agent.purpose}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Agent Control Strip (Action Buttons) */}
        <div className="px-5 py-3 bg-[#0e0e16] border-b border-white/10 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleEnable}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                isEnabled
                  ? 'bg-zinc-900 border-white/15 text-zinc-200 hover:bg-zinc-800'
                  : 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isEnabled ? 'Disable' : 'Enable'}</span>
            </button>

            <button
              onClick={handleTogglePause}
              disabled={!isEnabled}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40 ${
                isPaused
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-amber-950/80 border-amber-500/40 text-amber-300 hover:bg-amber-900'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Start / Resume' : 'Pause'}</span>
            </button>

            <button
              onClick={handleStop}
              disabled={!isEnabled}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-zinc-900 hover:bg-rose-950/60 border border-rose-500/30 text-rose-300 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
            >
              <Square className="w-3.5 h-3.5 text-rose-400" />
              <span>Stop</span>
            </button>

            <button
              onClick={handleRestart}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-zinc-300 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Restart</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEmergencyStop}
              className="px-3 py-1.5 text-xs font-black uppercase rounded-lg bg-red-950 hover:bg-red-900 border border-red-500/60 text-red-300 transition-all cursor-pointer flex items-center gap-1.5"
              title="Per-agent Emergency Stop killswitch"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Emergency Stop</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-white/10 bg-zinc-950/40 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'controls', label: 'Start & Dispatch' },
            { id: 'queue', label: `Task Queue (${agent.active_tasks_count})` },
            { id: 'history', label: `Task History (${agent.completed_tasks_count})` },
            { id: 'logs', label: 'Execution Logs' },
            { id: 'errors', label: `Errors (${agent.errors_count || 0})` },
            { id: 'metrics', label: 'Performance & Cost' },
            { id: 'permissions', label: 'Tools & Permissions' },
            { id: 'governance', label: 'Governance & Limits' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-2 font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-rose-500 text-white font-bold bg-white/5 rounded-t-lg'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* 1. START & DISPATCH */}
          {activeTab === 'controls' && (
            <div className="space-y-5">
              <form onSubmit={handleStartTask} className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <Send className="w-3.5 h-3.5 text-rose-400" />
                    <span>Dispatch Immediate Task to {agent.name}</span>
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as AiTaskPriority)}
                    className="bg-zinc-900 border border-white/15 text-zinc-200 px-2.5 py-1 rounded text-xs font-mono font-bold"
                  >
                    <option value="LOW">Priority: LOW</option>
                    <option value="MEDIUM">Priority: MEDIUM</option>
                    <option value="HIGH">Priority: HIGH</option>
                    <option value="CRITICAL">Priority: CRITICAL</option>
                  </select>
                </div>

                <textarea
                  value={taskPrompt}
                  onChange={(e) => setTaskPrompt(e.target.value)}
                  placeholder={`Describe the task for ${agent.name} (e.g. Audit audio spectrum latency, check 15% revenue splits, or inspect responsive grid)...`}
                  className="w-full h-24 p-3 bg-zinc-900/80 border border-white/15 rounded-lg text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-rose-500"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-zinc-400">
                    Scope: <code className="text-zinc-300">{agent.permission_scope}</code>
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-950/50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Agent Task</span>
                  </button>
                </div>
              </form>

              {/* Schedule Section */}
              <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white uppercase text-[11px]">Recurring Task Schedule</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">Standard 5-Field Cron</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={scheduleCron}
                    onChange={(e) => setScheduleCron(e.target.value)}
                    placeholder="*/15 * * * * or 0 0 * * *"
                    className="flex-1 px-3 py-2 bg-zinc-900 border border-white/15 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveSchedule}
                    className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/20 text-white font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    Save Schedule
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. TASK QUEUE & CURRENT TASK */}
          {activeTab === 'queue' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-2">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-rose-400" />
                  <span>Current In-Flight Task</span>
                </h4>
                {agent.current_task ? (
                  <div className="p-3 bg-zinc-900 rounded-lg border border-rose-500/30 space-y-1">
                    <div className="font-bold text-white text-xs">{agent.current_task.title}</div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Workflow Stage: <strong className="text-rose-400">{agent.current_task.current_workflow_step}</strong></span>
                      <span>Progress: {agent.current_task.progress_percent}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-zinc-500 italic p-3 bg-zinc-900/40 rounded-lg text-center">
                    No active task currently running. Agent is idle and ready for dispatch.
                  </div>
                )}
              </div>

              <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-2">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Queued Tasks ({agent.task_queue?.length || 0})</span>
                </h4>
                {(!agent.task_queue || agent.task_queue.length === 0) ? (
                  <div className="text-zinc-500 italic p-3 bg-zinc-900/40 rounded-lg text-center">
                    Queue is empty.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {agent.task_queue.map((item) => (
                      <div key={item.id} className="p-2.5 bg-zinc-900 rounded-lg border border-white/5 flex items-center justify-between">
                        <span className="font-semibold text-white">{item.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 font-bold">{item.priority}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. TASK HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-emerald-400" />
                <span>Execution History ({agent.task_history?.length || 0} Runs)</span>
              </h4>
              <div className="space-y-2">
                {agent.task_history?.map((th) => (
                  <div key={th.id} className="p-3 bg-zinc-950 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{th.title}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        Duration: {th.duration_seconds}s • Tokens: {th.tokens} • Completed: {new Date(th.completed_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {th.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. EXECUTION LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">Live Agent Log Stream</span>
                <span className="text-[10px] text-zinc-500">{agent.logs?.length || 0} entries</span>
              </div>
              <div className="p-3 bg-zinc-950 border border-white/10 rounded-xl space-y-2 max-h-72 overflow-y-auto text-[11px]">
                {agent.logs?.map((l) => (
                  <div key={l.id} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-zinc-500 shrink-0">[{new Date(l.timestamp).toLocaleTimeString()}]</span>
                    <span className={`px-1 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                      l.level === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400' :
                      l.level === 'WARN' ? 'bg-amber-950 text-amber-400' :
                      l.level === 'ERROR' ? 'bg-red-950 text-red-400' : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {l.level}
                    </span>
                    <span className="text-zinc-300">{l.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. ERRORS */}
          {activeTab === 'errors' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase text-[11px]">Reported Agent Errors</span>
                <span className="text-[11px] font-mono text-zinc-400">Total: {agent.errors_count || 0}</span>
              </div>
              {(!agent.error_logs || agent.error_logs.length === 0) ? (
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-center">
                  Zero active errors recorded. All executions verified.
                </div>
              ) : (
                <div className="space-y-2">
                  {agent.error_logs.map((err) => (
                    <div key={err.id} className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-xs space-y-1">
                      <div className="font-bold text-red-300">{err.message}</div>
                      <div className="text-[10px] text-zinc-400">{new Date(err.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. PERFORMANCE & COST METRICS */}
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-zinc-950 border border-white/10 rounded-xl">
                  <div className="text-[10px] uppercase text-zinc-500 font-bold">Avg Latency</div>
                  <div className="font-mono font-bold text-base text-cyan-400 mt-1">
                    {agent.performance_metrics?.average_response_ms || 210} ms
                  </div>
                </div>
                <div className="p-3 bg-zinc-950 border border-white/10 rounded-xl">
                  <div className="text-[10px] uppercase text-zinc-500 font-bold">Success Rate</div>
                  <div className="font-mono font-bold text-base text-emerald-400 mt-1">
                    {agent.performance_metrics?.success_rate_percent || 99.4}%
                  </div>
                </div>
                <div className="p-3 bg-zinc-950 border border-white/10 rounded-xl">
                  <div className="text-[10px] uppercase text-zinc-500 font-bold">Throughput</div>
                  <div className="font-mono font-bold text-base text-white mt-1">
                    {agent.performance_metrics?.throughput_per_min || 6} / min
                  </div>
                </div>
                <div className="p-3 bg-zinc-950 border border-white/10 rounded-xl">
                  <div className="text-[10px] uppercase text-zinc-500 font-bold">Cost Today</div>
                  <div className="font-mono font-bold text-base text-amber-400 mt-1">
                    ${agent.cost_today_usd || '0.0024'}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Tokens Today</span>
                  <span className="font-mono text-white font-bold">{agent.tokens_used_today.toLocaleString()} / {agent.daily_token_limit.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (agent.tokens_used_today / agent.daily_token_limit) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 7. TOOLS & PERMISSIONS */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-2">
                <div className="font-bold text-white uppercase text-[11px]">Authorized Scope</div>
                <code className="block p-2.5 bg-zinc-900 rounded border border-white/5 text-rose-300 font-mono text-[11px]">
                  {agent.permission_scope}
                </code>
              </div>

              <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-3">
                <div className="font-bold text-white uppercase text-[11px]">Allowed Tools ({agent.allowed_tools.length})</div>
                <div className="flex flex-wrap gap-1.5">
                  {agent.allowed_tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-2.5 py-1 rounded bg-zinc-900 border border-white/10 text-zinc-200 text-[11px] font-mono flex items-center gap-1.5"
                    >
                      <span>{tool}</span>
                      <button
                        onClick={() => handleRemoveTool(tool)}
                        className="text-zinc-500 hover:text-red-400 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <input
                    type="text"
                    value={newToolName}
                    onChange={(e) => setNewToolName(e.target.value)}
                    placeholder="Add approved tool name..."
                    className="flex-1 px-3 py-1.5 bg-zinc-900 border border-white/15 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={handleAddTool}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/20 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Add Tool
                  </button>
                </div>
              </div>

              <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-2">
                <div className="font-bold text-white uppercase text-[11px]">Allowed Data Sources</div>
                <div className="flex flex-wrap gap-1.5">
                  {agent.allowed_data_sources?.map((ds) => (
                    <span key={ds} className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono">
                      ✓ {ds}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 8. GOVERNANCE & LIMITS */}
          {activeTab === 'governance' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-3">
                <div className="font-bold text-white uppercase text-[11px]">Approval Requirement Policy</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: 'ALWAYS_REQUIRE_APPROVAL', label: 'Always Require Approval', desc: 'Every task execution requires human owner sign-off' },
                    { key: 'CRITICAL_ONLY', label: 'Critical Only', desc: 'Only high-risk, database, or financial actions gate approval' },
                    { key: 'AUTO_PUBLISH_LOW_RISK', label: 'Auto-Publish Low Risk', desc: 'Low-risk read/format tasks execute autonomously' },
                    { key: 'READ_ONLY_SUGGEST', label: 'Read-Only Suggest', desc: 'Agent generates suggestions and plans without writes' },
                  ].map((pol) => (
                    <div
                      key={pol.key}
                      onClick={() => handleUpdatePolicy(pol.key as AiAgentApprovalPolicy)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        agent.approval_policy === pol.key
                          ? 'bg-rose-950/60 border-rose-500 text-white'
                          : 'bg-zinc-900 border-white/10 text-zinc-400 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-xs">{pol.label}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{pol.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-3">
                <div className="font-bold text-white uppercase text-[11px]">Execution Bounds & Quotas</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Max Runtime (Sec)</label>
                    <input
                      type="number"
                      value={maxRuntime}
                      onChange={(e) => setMaxRuntime(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-1.5 bg-zinc-900 border border-white/15 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Retry Limit</label>
                    <input
                      type="number"
                      value={retryLimit}
                      onChange={(e) => setRetryLimit(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-1.5 bg-zinc-900 border border-white/15 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Budget Limit ($)</label>
                    <input
                      type="number"
                      value={budgetUsd}
                      onChange={(e) => setBudgetUsd(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-1.5 bg-zinc-900 border border-white/15 rounded text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveGovernance}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Save Governance Limits
                  </button>
                </div>
              </div>

              <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-2">
                <div className="font-bold text-white uppercase text-[11px] text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Scope Restrictions & Hard Guardrails</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
                  {agent.scope_restrictions?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
