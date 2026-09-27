import React, { useState } from 'react';
import {
  Bot,
  Send,
  Terminal,
  Code2,
  Cpu,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FolderTree,
  FileCode,
  Flame,
  ArrowRight,
  Database,
  Layers,
} from 'lucide-react';
import { db } from '../../../services/db';
import { useRealtimeData } from '../../../hooks/useRealtimeData';
import { AiTaskPriority } from '../../../types';

export const AiAgentCockpit: React.FC = () => {
  const { aiAgentStatus, aiMemoryContext, aiPolicyConfig } = useRealtimeData();
  const [prompt, setPrompt] = useState('');
  const [scope, setScope] = useState('components/home/');
  const [priority, setPriority] = useState<AiTaskPriority>('HIGH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  const capabilities = [
    'READ PROJECT',
    'ANALYZE PROJECT',
    'SEARCH CODE',
    'READ LOGS',
    'READ ERRORS',
    'CREATE CODE',
    'EDIT CODE',
    'CREATE COMPONENTS',
    'CREATE PAGES',
    'MODIFY STYLES',
    'CREATE TESTS',
    'RUN TESTS',
    'BUILD PROJECT',
    'CREATE PREVIEW',
    'ANALYZE PERFORMANCE',
    'ANALYZE SEO',
    'ANALYZE ACCESSIBILITY',
    'CREATE IMPROVEMENT PROPOSALS',
  ];

  const handleLaunchTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (aiPolicyConfig.is_paused) {
      setNotice('Cannot launch task: AI Agent is paused by Owner policy.');
      return;
    }

    setIsSubmitting(true);
    try {
      const task = db.createAiTask({
        title: prompt.trim().split('\n')[0].substring(0, 70),
        description: prompt.trim(),
        scope,
        priority,
      });
      setPrompt('');
      setNotice(`Task #${task.id} started in isolated development sandbox.`);
      setTimeout(() => setNotice(''), 5000);
    } catch (err: unknown) {
      setNotice(err instanceof Error ? err.message : 'Failed to launch task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const samplePrompts = [
    'Create an interactive lossless audio waveform spectrum analyzer for the player',
    'Improve mobile viewport drawer transitions and contrast ratios for accessibility',
    'Add MusicRecording Schema.org JSON-LD microdata to single release modal',
    'Implement automatic image prefetch and WebP srcset optimization on hero banner',
  ];

  return (
    <div className="space-y-6">
      {/* Notice */}
      {notice && (
        <div className="p-4 bg-zinc-900 border border-rose-500/40 rounded-xl text-xs font-semibold text-rose-300 flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-rose-400" />
          <span>{notice}</span>
        </div>
      )}

      {/* Main Hero Card */}
      <div className="bg-[#0b0b10] border border-white/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-rose-400 font-bold uppercase">
              Core Engineering Agent
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase">
              PRANTIK SITE AI
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl">
              Autonomous website development, code refactoring, performance optimization, and preview synthesis agent operating under strict RBAC safety boundaries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-zinc-950/80 border border-white/10 rounded-xl text-center">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Status</span>
              <span className="font-mono font-bold text-emerald-400 text-xs">{aiAgentStatus}</span>
            </div>
            <div className="p-3 bg-zinc-950/80 border border-white/10 rounded-xl text-center">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Safety Lock</span>
              <span className="font-mono font-bold text-rose-400 text-xs">ENFORCED</span>
            </div>
          </div>
        </div>

        {/* Capabilities Badges */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
            Authorized Agent Capabilities
          </label>
          <div className="flex flex-wrap gap-1.5">
            {capabilities.map((cap) => (
              <span
                key={cap}
                className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-zinc-900 border border-white/10 text-zinc-300 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3 h-3 text-rose-400" />
                <span>{cap}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Task Launcher Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Prompt Workbench */}
        <div className="lg:col-span-2 bg-[#0c0c12] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-rose-400" />
              <h3 className="font-display font-bold text-white text-sm uppercase">
                AI Engineering Task Terminal
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">Sandbox Execution</span>
          </div>

          <form onSubmit={handleLaunchTask} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-bold uppercase tracking-wider text-[10px] flex items-center justify-between">
                <span>Task Instruction / Feature Prompt</span>
                <span className="text-zinc-500 text-[10px] normal-case">Be specific with requirements</span>
              </label>
              <textarea
                required
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Create a new music release carousel component with smooth touch-drag and lossless audio preview buttons..."
                className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl focus:border-rose-500 focus:outline-hidden text-white placeholder:text-zinc-600 text-xs font-sans leading-relaxed transition-colors resize-none"
              />
            </div>

            {/* Config Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                  Target Scope / File
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white focus:border-rose-500 focus:outline-hidden font-mono text-xs cursor-pointer"
                >
                  <option value="components/home/">components/home/ (Homepage Sections)</option>
                  <option value="components/player/">components/player/ (Audio Player)</option>
                  <option value="components/modals/">components/modals/ (Interactive Modals)</option>
                  <option value="components/layout/">components/layout/ (Header, Footer, Nav)</option>
                  <option value="pages/">pages/ (Catalog & EPK Pages)</option>
                  <option value="styles/">styles/ (CSS & Tailwind Theme)</option>
                  <option value="src/">src/ (Global Project Scope)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as AiTaskPriority)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white focus:border-rose-500 focus:outline-hidden font-mono text-xs cursor-pointer"
                >
                  <option value="LOW">LOW (Informational / Typo / Minor CSS)</option>
                  <option value="MEDIUM">MEDIUM (Standard Component / Page Refactor)</option>
                  <option value="HIGH">HIGH (Feature Addition / Audio Engine)</option>
                  <option value="CRITICAL">CRITICAL (Requires Strict Owner Approval)</option>
                </select>
              </div>
            </div>

            {/* Quick Prompt Ideas */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Quick Templates</span>
              <div className="flex flex-wrap gap-1.5">
                {samplePrompts.map((sp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(sp)}
                    className="px-2.5 py-1 bg-zinc-900/90 hover:bg-zinc-800 border border-white/5 hover:border-white/20 rounded text-[11px] text-zinc-300 transition-colors text-left truncate max-w-full cursor-pointer"
                  >
                    + {sp}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !prompt.trim()}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 text-white font-extrabold uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Enqueuing in Isolated Sandbox...</span>
              ) : (
                <>
                  <span>Synthesize Solution in Isolated Sandbox</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right 1 Col: Agent Memory & Active Rules */}
        <div className="bg-[#0c0c12] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <h3 className="font-display font-bold text-white text-sm uppercase">Agent Memory</h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              Indexed {new Date(aiMemoryContext.last_indexed_at).toLocaleDateString()}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Architecture Context</span>
              <p className="text-zinc-300 text-[11px] leading-relaxed">{aiMemoryContext.architecture_notes}</p>
            </div>

            <div className="p-3 bg-zinc-950/60 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Design System DNA</span>
              <p className="text-zinc-300 text-[11px] leading-relaxed">{aiMemoryContext.design_system_rules}</p>
            </div>

            <div className="p-3 bg-zinc-950/60 rounded-xl border border-white/5 space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Active Safety Rules</span>
              <ul className="space-y-1 text-[11px] text-zinc-400">
                {aiMemoryContext.active_rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
