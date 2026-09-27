import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Layers,
  ListTodo,
  Lightbulb,
  FileCode2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Wrench,
  Activity,
  BarChart3,
  PauseCircle,
  PlayCircle,
  Square,
  Search,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { db } from '../../../services/db';
import { useRealtimeData } from '../../../hooks/useRealtimeData';
import { AiDashboardOverview } from './AiDashboardOverview';
import { AiAgentCockpit } from './AiAgentCockpit';
import { AiFeatureFactory } from './AiFeatureFactory';
import { AiTasksQueue } from './AiTasksQueue';
import { AiAuditReview } from './AiAuditReview';
import { AiDiffViewer } from './AiDiffViewer';
import { AiScheduledJobs } from './AiScheduledJobs';
import { AiApprovalsManager } from './AiApprovalsManager';
import { AiSafetyAndPolicies } from './AiSafetyAndPolicies';
import { AiModelsAndTools } from './AiModelsAndTools';
import { AiActivityFeed } from './AiActivityFeed';
import { AiUsageMetricsView } from './AiUsageMetricsView';
import { AiAgentModesManager } from './AiAgentModesManager';

export type AiTab =
  | 'overview'
  | 'agents'
  | 'agent'
  | 'features'
  | 'tasks'
  | 'suggestions'
  | 'changes'
  | 'scheduled'
  | 'approvals'
  | 'policies'
  | 'models'
  | 'tools'
  | 'activity'
  | 'usage';

interface AiControlCenterProps {
  initialTab?: AiTab;
  onNavigateToSiteWorkspace?: (siteId: string) => void;
}

export const AiControlCenter: React.FC<AiControlCenterProps> = ({
  initialTab = 'overview',
  onNavigateToSiteWorkspace,
}) => {
  const {
    aiAgentStatus,
    aiTasks,
    aiApprovals,
    aiFeatures,
    aiScheduledJobs,
    aiAuditProposals,
    aiModelConfigs,
    aiToolPermissions,
    aiPolicyConfig,
    aiActivityEvents,
    aiMemoryContext,
  } = useRealtimeData();

  const [activeTab, setActiveTab] = useState<AiTab>(initialTab);
  const [toast, setToast] = useState<string>('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const isPaused = aiPolicyConfig.is_paused;
  const isAutoDeployDisabled = !!aiPolicyConfig.auto_deploy_disabled;
  const isAutonomousChangesDisabled = !!aiPolicyConfig.autonomous_changes_disabled;
  const isEmergencyShutdown = !!aiPolicyConfig.emergency_shutdown;
  const pendingApprovalsCount = aiApprovals.filter((a) => a.status === 'PENDING').length;
  const runningTasksCount = aiTasks.filter((t) => t.status === 'RUNNING').length;

  const handleTogglePause = () => {
    const paused = db.toggleAiPause();
    showToast(paused ? 'PAUSE ALL AI: All agents paused across environments.' : 'RESUME ALL AI: Operations resumed.');
  };

  const handleStopAll = () => {
    db.stopAllAiTasks();
    showToast('STOP ALL TASKS: All running and queued tasks terminated.');
  };

  const handleToggleAutoDeploy = () => {
    const disabled = db.toggleAutoDeploy();
    showToast(disabled ? 'DISABLE AUTO-DEPLOY: Auto-deployment disabled. Manual approval required.' : 'Auto-deployment restored.');
  };

  const handleToggleAutonomousChanges = () => {
    const disabled = db.toggleAutonomousChanges();
    showToast(disabled ? 'DISABLE AUTONOMOUS CHANGES: Autonomous modifications blocked.' : 'Autonomous changes restored.');
  };

  const handleEmergencyShutdown = () => {
    if (isEmergencyShutdown) {
      db.resetEmergencyShutdown();
      showToast('EMERGENCY SHUTDOWN CLEARED: System restored to standard operation.');
    } else {
      db.emergencyAiShutdown();
      showToast('EMERGENCY AI SHUTDOWN: Entire AI system frozen immediately.');
    }
  };

  const handleRunAudit = () => {
    db.runAiWebsiteAudit();
    showToast('AI website audit completed. New proposals generated.');
    setActiveTab('suggestions');
  };

  const getStatusBadge = () => {
    if (isPaused) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/60 border border-amber-500/40 text-amber-400">
          <PauseCircle className="w-3 h-3 text-amber-400" />
          PAUSED (OWNER OVERRIDE)
        </span>
      );
    }
    switch (aiAgentStatus) {
      case 'WORKING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950/60 border border-rose-500/40 text-rose-400 animate-pulse">
            <Flame className="w-3 h-3 text-rose-400" />
            AGENT WORKING ({runningTasksCount} active)
          </span>
        );
      case 'ANALYZING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 animate-pulse">
            <Activity className="w-3 h-3 text-cyan-400" />
            ANALYZING WEBSITE
          </span>
        );
      case 'WAITING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-950/60 border border-purple-500/40 text-purple-400">
            <AlertTriangle className="w-3 h-3 text-purple-400" />
            WAITING APPROVAL ({pendingApprovalsCount})
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-950/60 border border-red-500/40 text-red-400">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            ERROR STATE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            24/7 ACTIVE & IDLE
          </span>
        );
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Sparkles, badge: null },
    { id: 'agents', label: 'AI Agent Modes', icon: Bot, badge: '210 Agents' },
    { id: 'agent', label: 'PRANTIK SITE AI', icon: Cpu, badge: 'Sandbox' },
    { id: 'features', label: 'Feature Factory', icon: Layers, badge: aiFeatures.length },
    { id: 'tasks', label: 'Task Queue', icon: ListTodo, badge: runningTasksCount > 0 ? runningTasksCount : null },
    { id: 'suggestions', label: 'Audit & Suggestions', icon: Lightbulb, badge: aiAuditProposals.length },
    { id: 'changes', label: 'Diff & Changes', icon: FileCode2, badge: null },
    { id: 'scheduled', label: '24/7 Monitors', icon: Clock, badge: 'Active' },
    { id: 'approvals', label: 'Approvals', icon: ShieldCheck, badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null, alert: pendingApprovalsCount > 0 },
    { id: 'policies', label: 'Policies & Safety', icon: ShieldAlert, badge: null },
    { id: 'models', label: 'Models', icon: Cpu, badge: null },
    { id: 'tools', label: 'Tools', icon: Wrench, badge: null },
    { id: 'activity', label: 'Activity Logs', icon: Activity, badge: null },
    { id: 'usage', label: 'Cost & Usage', icon: BarChart3, badge: null },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-zinc-900 border border-rose-500/40 text-white text-xs font-semibold rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Banner & Control Bar */}
      <div className="bg-[#0b0b10] border border-white/10 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-2xl">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-l from-rose-600/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-inner">
                <Bot className="w-4 h-4" />
              </div>
              <h1 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight uppercase">
                AI Engineering Control Center
              </h1>
              {getStatusBadge()}
            </div>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              24/7 Autonomous website development, performance diagnostics, isolated workspace testing, and human-authorized deployment.
            </p>
          </div>

          {/* Master Action Controls (5 Global Switches) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleTogglePause}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow ${
                isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                  : 'bg-zinc-900 hover:bg-amber-950/40 border border-amber-500/40 text-amber-300'
              }`}
              title="Pause all AI execution across the portal"
            >
              {isPaused ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isPaused ? 'RESUME ALL AI' : 'PAUSE ALL AI'}</span>
            </button>

            <button
              onClick={handleStopAll}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-rose-950/40 border border-rose-500/30 hover:border-rose-500/60 text-rose-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow"
              title="Immediately terminate any in-flight task"
            >
              <Square className="w-3.5 h-3.5 text-rose-400" />
              <span>STOP ALL TASKS</span>
            </button>

            <button
              onClick={handleToggleAutoDeploy}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow ${
                isAutoDeployDisabled
                  ? 'bg-amber-950/80 border border-amber-500 text-amber-300'
                  : 'bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-zinc-300'
              }`}
              title="Toggle automatic deployment without explicit approval"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAutoDeployDisabled ? 'AUTO-DEPLOY: OFF' : 'DISABLE AUTO-DEPLOY'}</span>
            </button>

            <button
              onClick={handleToggleAutonomousChanges}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow ${
                isAutonomousChangesDisabled
                  ? 'bg-amber-950/80 border border-amber-500 text-amber-300'
                  : 'bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-zinc-300'
              }`}
              title="Prevent AI from making autonomous direct code edits"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAutonomousChangesDisabled ? 'AUTO-CHANGES: OFF' : 'DISABLE AUTONOMOUS CHANGES'}</span>
            </button>

            <button
              onClick={handleEmergencyShutdown}
              className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-lg ${
                isEmergencyShutdown
                  ? 'bg-red-700 text-white animate-pulse shadow-red-950/80 border border-red-400'
                  : 'bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-200'
              }`}
              title="Immediately freeze all AI subsystems, workers, and tasks"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>{isEmergencyShutdown ? 'LOCKDOWN ACTIVE' : 'EMERGENCY AI SHUTDOWN'}</span>
            </button>
          </div>
        </div>

        {/* Zero-Leak Secrets Protection Banner */}
        <div className="mt-4 px-3.5 py-2 bg-zinc-950/80 border border-emerald-500/30 rounded-lg flex items-center justify-between gap-3 text-[11px] text-zinc-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-emerald-400 font-semibold uppercase">Zero-Leak Secrets Protection:</strong> API keys, payment secrets, database credentials, server passwords, session tokens, private keys and encryption keys must never be exposed through the UI, logs, source code or AI context.
            </span>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
            POLICY ENFORCED
          </span>
        </div>

        {/* Quick Horizontal Metrics Strip */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-2.5 bg-zinc-950/60 border border-white/5 rounded-lg">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Policy Level</div>
            <div className="font-mono font-bold text-rose-400 mt-0.5">{aiPolicyConfig.approval_level}</div>
          </div>

          <div className="p-2.5 bg-zinc-950/60 border border-white/5 rounded-lg">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Active Monitors</div>
            <div className="font-mono font-bold text-emerald-400 mt-0.5">
              {aiScheduledJobs.filter((j) => j.enabled).length} of {aiScheduledJobs.length} Active
            </div>
          </div>

          <div className="p-2.5 bg-zinc-950/60 border border-white/5 rounded-lg">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Pending Approvals</div>
            <div className={`font-mono font-bold mt-0.5 ${pendingApprovalsCount > 0 ? 'text-amber-400 font-extrabold' : 'text-zinc-300'}`}>
              {pendingApprovalsCount} Required
            </div>
          </div>

          <div className="p-2.5 bg-zinc-950/60 border border-white/5 rounded-lg">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Tasks Completed</div>
            <div className="font-mono font-bold text-white mt-0.5">
              {aiTasks.filter((t) => t.status === 'SUCCESS').length} Tasks
            </div>
          </div>

          <div className="p-2.5 bg-zinc-950/60 border border-white/5 rounded-lg">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Token Usage Today</div>
            <div className="font-mono font-bold text-zinc-200 mt-0.5">
              {(aiModelConfigs.reduce((acc, m) => acc + (m.tokens_used_today || 0), 0) / 1000).toFixed(1)}k tokens
            </div>
          </div>

          <div className="p-2.5 bg-zinc-950/60 border border-white/5 rounded-lg">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Secret Isolation</div>
            <div className="font-mono font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3" />
              <span>ENFORCED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-white/10 no-scrollbar">
        {navItems.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AiTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-white/5'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.alert ? 'text-amber-400' : 'text-zinc-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                    isActive
                      ? 'bg-black/30 text-white'
                      : tab.alert
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      <div className="pt-1">
        {activeTab === 'overview' && (
          <AiDashboardOverview
            onNavigateTab={(tab) => setActiveTab(tab)}
            onRunAudit={handleRunAudit}
          />
        )}

        {activeTab === 'agents' && <AiAgentModesManager />}

        {activeTab === 'agent' && <AiAgentCockpit />}

        {activeTab === 'features' && <AiFeatureFactory />}

        {activeTab === 'tasks' && <AiTasksQueue />}

        {activeTab === 'suggestions' && <AiAuditReview />}

        {activeTab === 'changes' && <AiDiffViewer />}

        {activeTab === 'scheduled' && <AiScheduledJobs />}

        {activeTab === 'approvals' && <AiApprovalsManager />}

        {activeTab === 'policies' && <AiSafetyAndPolicies />}

        {activeTab === 'models' && <AiModelsAndTools defaultSubTab="models" />}

        {activeTab === 'tools' && <AiModelsAndTools defaultSubTab="tools" />}

        {activeTab === 'activity' && <AiActivityFeed />}

        {activeTab === 'usage' && <AiUsageMetricsView />}
      </div>
    </div>
  );
};
