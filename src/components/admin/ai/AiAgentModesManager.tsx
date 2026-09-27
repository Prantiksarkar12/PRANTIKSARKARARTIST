import React, { useState, useMemo } from 'react';
import {
  Bot,
  Search,
  Filter,
  Sliders,
  Play,
  Pause,
  Square,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Layers,
  Activity,
  Terminal,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  BarChart3,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { db } from '../../../services/db';
import { useRealtimeData } from '../../../hooks/useRealtimeData';
import { AiAgentMode, AiAgentApprovalPolicy } from '../../../types';
import { AiWorkflowPipeline } from './AiWorkflowPipeline';
import { AiAgentModalDetail } from './AiAgentModalDetail';

export const AI_CATEGORIES = [
  'ALL',
  'Core AI / Orchestration',
  'Website / Product',
  'Code / Development',
  'Testing / Quality',
  'Security',
  'Build / Deployment / Infrastructure',
  'Music / Artist',
  'Record Label',
  'Video / Media',
  'User Support',
  'AI / Coins / Wallet',
  'Referral / Rewards',
  'Communication',
  'Analytics',
  'Admin / Operations',
  'Legal / Policy',
  'Data',
  'Operations / Reliability',
  'Advanced Agents',
] as const;

export const AiAgentModesManager: React.FC = () => {
  const { aiAgentModes, aiPolicyConfig } = useRealtimeData();

  const [selectedAgent, setSelectedAgent] = useState<AiAgentMode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Workflow pipeline simulation state
  const [simulatingWorkflow, setSimulatingWorkflow] = useState(false);
  const [simWorkflowStep, setSimWorkflowStep] = useState<string>('MONITOR');

  const showNotice = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 4000);
  };

  const isPaused = !!aiPolicyConfig.is_paused;
  const isAutoDeployDisabled = !!aiPolicyConfig.auto_deploy_disabled;
  const isAutonomousChangesDisabled = !!aiPolicyConfig.autonomous_changes_disabled;
  const isEmergencyShutdown = !!aiPolicyConfig.emergency_shutdown;

  // Master Control Triggers
  const handleTogglePause = () => {
    const paused = db.toggleAiPause();
    showNotice(paused ? 'PAUSE ALL AI: All agent execution frozen.' : 'RESUME ALL AI: Operations resumed.', 'info');
  };

  const handleStopAll = () => {
    db.stopAllAiTasks();
    showNotice('STOP ALL TASKS: All in-flight executions terminated.', 'info');
  };

  const handleToggleAutoDeploy = () => {
    const disabled = db.toggleAutoDeploy();
    showNotice(disabled ? 'DISABLE AUTO-DEPLOY: Auto-deployment disabled.' : 'Auto-deployment restored.', 'info');
  };

  const handleToggleAutonomousChanges = () => {
    const disabled = db.toggleAutonomousChanges();
    showNotice(disabled ? 'DISABLE AUTONOMOUS CHANGES: Autonomous code edits blocked.' : 'Autonomous changes restored.', 'info');
  };

  const handleEmergencyShutdown = () => {
    if (isEmergencyShutdown) {
      db.resetEmergencyShutdown();
      showNotice('EMERGENCY SHUTDOWN CLEARED: System restored.', 'success');
    } else {
      db.emergencyAiShutdown();
      showNotice('EMERGENCY AI SHUTDOWN ACTIVATED! All agents halted.', 'error');
    }
  };

  // Run pipeline simulation across 12 controlled steps
  const handleRunSimulation = () => {
    if (simulatingWorkflow) return;
    setSimulatingWorkflow(true);
    const steps = [
      'MONITOR',
      'DETECT',
      'ANALYZE',
      'PLAN',
      'IMPLEMENT',
      'TEST',
      'BUILD',
      'PREVIEW',
      'APPROVAL',
      'DEPLOY',
      'HEALTH CHECK',
      'AUDIT',
    ];
    let currentIdx = 0;
    setSimWorkflowStep(steps[0]);

    const interval = setInterval(() => {
      currentIdx += 1;
      if (currentIdx < steps.length) {
        setSimWorkflowStep(steps[currentIdx]);
      } else {
        clearInterval(interval);
        setSimulatingWorkflow(false);
        showNotice('Workflow pipeline simulation completed through all 12 steps (MONITOR → AUDIT).', 'success');
      }
    }, 600);
  };

  // Category counts map
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: aiAgentModes.length };
    aiAgentModes.forEach((agent) => {
      counts[agent.category] = (counts[agent.category] || 0) + 1;
    });
    return counts;
  }, [aiAgentModes]);

  // Filtered agents list
  const filteredAgents = useMemo(() => {
    return aiAgentModes.filter((agent) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        agent.name.toLowerCase().includes(q) ||
        agent.role_title.toLowerCase().includes(q) ||
        agent.purpose.toLowerCase().includes(q) ||
        agent.id.toLowerCase().includes(q) ||
        (agent.agent_number && String(agent.agent_number) === q) ||
        agent.allowed_tools.some((t) => t.toLowerCase().includes(q));

      const matchesCategory = categoryFilter === 'ALL' || agent.category === categoryFilter;

      const isAgentPaused = agent.is_paused || agent.current_status === 'PAUSED';
      const isAgentEmergency = !!agent.emergency_stopped;
      const isAgentWorking = agent.current_status === 'WORKING';
      const isAgentIdle = agent.current_status === 'IDLE' && !isAgentPaused && !isAgentEmergency;

      let matchesStatus = true;
      if (statusFilter === 'WORKING') matchesStatus = isAgentWorking;
      else if (statusFilter === 'IDLE') matchesStatus = isAgentIdle;
      else if (statusFilter === 'PAUSED') matchesStatus = isAgentPaused;
      else if (statusFilter === 'EMERGENCY') matchesStatus = isAgentEmergency;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [aiAgentModes, searchQuery, categoryFilter, statusFilter]);

  const totalWorking = aiAgentModes.filter((a) => a.current_status === 'WORKING').length;
  const totalPaused = aiAgentModes.filter((a) => a.is_paused || a.current_status === 'PAUSED').length;

  return (
    <div className="space-y-6">
      {/* Notice notification */}
      {notice && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-zinc-900 border border-white/20 text-white text-xs font-semibold rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{notice.text}</span>
        </div>
      )}

      {/* Master Controls Bar (Top Level Global Switches) */}
      <div className="bg-[#0b0b12] border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="font-display font-black text-xl text-white tracking-wide uppercase">
                Global Master AI Controls
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 border border-rose-500/40 text-rose-300">
                210 AGENTS CONNECTED
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              System-wide switches override all 210 autonomous agents, stopping execution, preventing auto-deployment, and enforcing human authorization.
            </p>
          </div>

          {/* Master 5 Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleTogglePause}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 shadow ${
                isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                  : 'bg-zinc-900 hover:bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'RESUME ALL AI' : 'PAUSE ALL AI'}</span>
            </button>

            <button
              onClick={handleStopAll}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Square className="w-3.5 h-3.5 text-rose-400" />
              <span>STOP ALL TASKS</span>
            </button>

            <button
              onClick={handleToggleAutoDeploy}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 shadow ${
                isAutoDeployDisabled
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-white/15 text-zinc-300'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAutoDeployDisabled ? 'AUTO-DEPLOY: OFF' : 'DISABLE AUTO-DEPLOY'}</span>
            </button>

            <button
              onClick={handleToggleAutonomousChanges}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 shadow ${
                isAutonomousChangesDisabled
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-white/15 text-zinc-300'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAutonomousChangesDisabled ? 'AUTO-CHANGES: OFF' : 'DISABLE AUTONOMOUS CHANGES'}</span>
            </button>

            <button
              onClick={handleEmergencyShutdown}
              className={`px-3.5 py-1.5 text-xs font-black uppercase rounded-lg transition-all cursor-pointer shadow-lg flex items-center gap-1.5 ${
                isEmergencyShutdown
                  ? 'bg-red-700 text-white animate-pulse border border-red-400'
                  : 'bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>{isEmergencyShutdown ? 'LOCKDOWN ACTIVE' : 'EMERGENCY AI SHUTDOWN'}</span>
            </button>
          </div>
        </div>

        {/* Zero-Leak Secrets Protection Banner */}
        <div className="p-3 bg-zinc-950 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-3 text-[11px] text-zinc-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-emerald-400 uppercase font-semibold">Zero-Leak Secrets Protection:</strong> API keys, payment secrets, database credentials, server passwords, session tokens, private keys and encryption keys must never be exposed through the UI, logs, source code or AI context.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
            STRICT RBAC
          </span>
        </div>
      </div>

      {/* Controlled Workflow Visualizer */}
      <AiWorkflowPipeline
        currentStage={simWorkflowStep}
        activeAgentName={selectedAgent ? selectedAgent.name : 'Master AI Agent'}
        onRunSimulation={handleRunSimulation}
        isSimulating={simulatingWorkflow}
      />

      {/* Filters & Search Toolbar */}
      <div className="space-y-3">
        {/* Category Scrollable Tabs with counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar text-xs">
          {AI_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const isActive = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                    isActive ? 'bg-black/30 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Status Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-zinc-950/60 border border-white/10 rounded-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 210 agents by name, ID (#1-#210), role, category, or tool..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-900 border border-white/15 text-zinc-200 px-2.5 py-1.5 rounded-lg font-bold text-xs"
            >
              <option value="ALL">All Statuses ({aiAgentModes.length})</option>
              <option value="WORKING">Working ({totalWorking})</option>
              <option value="IDLE">Idle ({aiAgentModes.length - totalWorking - totalPaused})</option>
              <option value="PAUSED">Paused ({totalPaused})</option>
              <option value="EMERGENCY">Emergency Stopped</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => {
          const isAgentPaused = agent.is_paused || agent.current_status === 'PAUSED';
          const isAgentEmergency = !!agent.emergency_stopped;
          const isAgentEnabled = agent.is_enabled !== false;

          return (
            <div
              key={agent.id}
              className={`bg-[#0d0d14] border rounded-xl p-4 flex flex-col justify-between transition-all hover:border-white/20 shadow-lg ${
                isAgentEmergency
                  ? 'border-red-500/50 bg-red-950/10'
                  : isAgentPaused
                  ? 'border-amber-500/30'
                  : agent.current_status === 'WORKING'
                  ? 'border-rose-500/50'
                  : 'border-white/10'
              }`}
            >
              <div className="space-y-2.5">
                {/* Card Top: Number, Name, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-mono font-bold">
                      #{agent.agent_number || 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm tracking-tight leading-tight">
                        {agent.name}
                      </h4>
                      <div className="text-[10px] text-zinc-400 font-mono">{agent.category}</div>
                    </div>
                  </div>

                  {isAgentEmergency ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black bg-red-950 border border-red-500 text-red-400">
                      EMERGENCY
                    </span>
                  ) : !isAgentEnabled ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-zinc-800 text-zinc-400">
                      DISABLED
                    </span>
                  ) : isAgentPaused ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300">
                      PAUSED
                    </span>
                  ) : agent.current_status === 'WORKING' ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-950/80 border border-rose-500/40 text-rose-300 animate-pulse">
                      WORKING
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                      IDLE
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {agent.purpose}
                </p>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-3 gap-1.5 p-2 bg-zinc-950/60 rounded-lg border border-white/5 text-[10px] font-mono">
                  <div>
                    <span className="text-zinc-500 block">Tools</span>
                    <span className="text-white font-bold">{agent.allowed_tools.length}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Tokens</span>
                    <span className="text-zinc-300 font-bold">{Math.round(agent.tokens_used_today / 1000)}k</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Runs</span>
                    <span className="text-emerald-400 font-bold">{agent.completed_tasks_count}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Quick Actions */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const paused = db.toggleAiAgentPause(agent.id);
                      showNotice(paused ? `Paused ${agent.name}.` : `Resumed ${agent.name}.`, 'info');
                    }}
                    title={isAgentPaused ? 'Resume agent' : 'Pause agent'}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                  >
                    {isAgentPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                  </button>

                  <button
                    onClick={() => {
                      db.stopAiAgentTasks(agent.id);
                      showNotice(`Stopped tasks for ${agent.name}.`, 'info');
                    }}
                    title="Stop active tasks"
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/60 text-zinc-300 hover:text-rose-300 border border-white/10 transition-colors cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 text-rose-400" />
                  </button>
                </div>

                <button
                  onClick={() => setSelectedAgent(agent)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/60 border border-white/15 hover:border-rose-500/40 text-xs font-bold text-zinc-200 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>Controls & Specs</span>
                  <ArrowRight className="w-3 h-3 text-rose-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAgents.length === 0 && (
        <div className="p-8 text-center bg-zinc-950 border border-white/10 rounded-xl space-y-2">
          <Bot className="w-8 h-8 text-zinc-600 mx-auto" />
          <h4 className="font-bold text-white text-sm">No agents match your search</h4>
          <p className="text-xs text-zinc-400">Try adjusting your category filter or search keywords.</p>
        </div>
      )}

      {/* Global Agent Modal Detail */}
      {selectedAgent && (
        <AiAgentModalDetail
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onShowNotice={showNotice}
        />
      )}
    </div>
  );
};
