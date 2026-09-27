import React, { useState } from 'react';
import {
  Activity,
  Search,
  Cpu,
  Layers,
  Wrench,
  CheckCircle2,
  Terminal,
  Play,
  ShieldCheck,
  Flame,
  HeartPulse,
  FileText,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const WORKFLOW_STAGES = [
  { id: 'MONITOR', label: 'Monitor', icon: Activity, desc: 'Realtime observability & event listeners' },
  { id: 'DETECT', label: 'Detect', icon: Search, desc: 'Anomaly, request, or trigger detection' },
  { id: 'ANALYZE', label: 'Analyze', icon: Cpu, desc: 'AST and context impact analysis' },
  { id: 'PLAN', label: 'Plan', icon: Layers, desc: 'Deterministic task plan & DAG synthesis' },
  { id: 'IMPLEMENT', label: 'Implement', icon: Wrench, desc: 'Modular code and configuration generation' },
  { id: 'TEST', label: 'Test', icon: CheckCircle2, desc: 'Unit, integration, and security test suites' },
  { id: 'BUILD', label: 'Build', icon: Terminal, desc: 'Zero-error TypeScript compilation & bundling' },
  { id: 'PREVIEW', label: 'Preview', icon: Play, desc: 'Ephemeral sandbox preview generation' },
  { id: 'APPROVAL', label: 'Approval', icon: ShieldCheck, desc: 'Explicit human owner authorization gate' },
  { id: 'DEPLOY', label: 'Deploy', icon: Flame, desc: 'Production release synchronization' },
  { id: 'HEALTH CHECK', label: 'Health Check', icon: HeartPulse, desc: 'Post-deploy heartbeat & SLA verification' },
  { id: 'AUDIT', label: 'Audit', icon: FileText, desc: 'Immutable audit ledger recording' },
] as const;

interface AiWorkflowPipelineProps {
  currentStage?: string;
  activeAgentName?: string;
  taskTitle?: string;
  onRunSimulation?: () => void;
  isSimulating?: boolean;
}

export const AiWorkflowPipeline: React.FC<AiWorkflowPipelineProps> = ({
  currentStage = 'MONITOR',
  activeAgentName = 'Master AI Agent',
  taskTitle = 'Automated system health arbitration & policy check',
  onRunSimulation,
  isSimulating = false,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const currentStageIndex = WORKFLOW_STAGES.findIndex((s) => s.id === currentStage);
  const effectiveIndex = currentStageIndex >= 0 ? currentStageIndex : activeStepIndex;

  return (
    <div className="bg-[#0e0e14] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">
              Controlled Agent Workflow Pipeline
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 border border-rose-500/40 text-rose-300">
              12 STEPS ENFORCED
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Every agent change follows the strict controlled pipeline from MONITOR to AUDIT with explicit human authorization gates.
          </p>
        </div>

        {onRunSimulation && (
          <button
            onClick={onRunSimulation}
            disabled={isSimulating}
            className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-zinc-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>{isSimulating ? 'Simulating Pipeline...' : 'Run Pipeline Simulation'}</span>
          </button>
        )}
      </div>

      {/* 12-Step Horizontal Chain */}
      <div className="overflow-x-auto pb-2 no-scrollbar">
        <div className="flex items-center gap-1 min-w-[960px]">
          {WORKFLOW_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = idx < effectiveIndex;
            const isCurrent = idx === effectiveIndex;
            const isApprovalGate = stage.id === 'APPROVAL';

            return (
              <React.Fragment key={stage.id}>
                <div
                  onClick={() => setActiveStepIndex(idx)}
                  className={`flex-1 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-rose-950/60 border-rose-500/80 ring-1 ring-rose-500/50 shadow-lg'
                      : isCompleted
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                      : isApprovalGate
                      ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                      : 'bg-zinc-950/40 border-white/5 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="font-mono font-bold opacity-60">#{idx + 1}</span>
                    {isCompleted ? (
                      <span className="text-emerald-400">✓</span>
                    ) : isCurrent ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    ) : isApprovalGate ? (
                      <ShieldAlert className="w-2.5 h-2.5 text-amber-400" />
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-rose-400' : isCompleted ? 'text-emerald-400' : isApprovalGate ? 'text-amber-400' : 'text-zinc-500'}`} />
                    <span className="text-[11px] font-bold tracking-tight uppercase truncate">{stage.label}</span>
                  </div>
                  <div className="text-[9px] text-zinc-400 truncate mt-1 leading-tight">{stage.desc}</div>
                </div>

                {idx < WORKFLOW_STAGES.length - 1 && (
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${idx < effectiveIndex ? 'text-emerald-500/60' : 'text-zinc-700'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Active Stage Context Box */}
      <div className="p-3 bg-zinc-950/80 border border-white/10 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 flex items-center justify-center shrink-0">
            {React.createElement(WORKFLOW_STAGES[effectiveIndex]?.icon || Activity, { className: 'w-3.5 h-3.5' })}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase">{WORKFLOW_STAGES[effectiveIndex]?.label} STAGE</span>
              <span className="text-[10px] font-mono text-zinc-400">Step {effectiveIndex + 1} of 12</span>
            </div>
            <div className="text-zinc-400 text-[11px]">
              Assigned Agent: <strong className="text-zinc-200">{activeAgentName}</strong> • Task: <span className="text-zinc-300">"{taskTitle}"</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-zinc-400">Stage Gate:</span>
          {WORKFLOW_STAGES[effectiveIndex]?.id === 'APPROVAL' ? (
            <span className="px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold font-mono">
              EXPLICIT HUMAN AUTHORIZATION REQUIRED
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-white/10 text-emerald-400 font-bold font-mono">
              AUTOMATED VERIFIED
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
