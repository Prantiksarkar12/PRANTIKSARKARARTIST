import React, { useState } from 'react';
import {
  Cpu,
  Wrench,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Zap,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { useRealtimeData } from '../../../hooks/useRealtimeData';
import { db } from '../../../services/db';

interface AiModelsAndToolsProps {
  defaultSubTab?: 'models' | 'tools';
}

export const AiModelsAndTools: React.FC<AiModelsAndToolsProps> = ({
  defaultSubTab = 'models',
}) => {
  const { aiModelConfigs, aiToolPermissions } = useRealtimeData();
  const [subTab, setSubTab] = useState<'models' | 'tools'>(defaultSubTab);
  const [toast, setToast] = useState('');

  const handleToggleTool = (toolId: string) => {
    const isEnabled = db.toggleAiToolPermission(toolId);
    setToast(`Tool permission updated: ${isEnabled ? 'Enabled' : 'Disabled'}`);
    setTimeout(() => setToast(''), 3000);
  };

  const toolCategories = [
    'PROJECT',
    'FILE',
    'DATABASE',
    'BUILD',
    'DEPLOY',
    'OBSERVABILITY',
  ] as const;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="p-4 bg-zinc-900 border border-rose-500/40 rounded-xl text-xs font-semibold text-rose-300 flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-rose-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0c0c12] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              {subTab === 'models' ? <Cpu className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
            </div>
            <h2 className="font-display font-black text-xl text-white tracking-tight uppercase">
              {subTab === 'models' ? 'AI Models & Reasoning Engine' : 'Scoped Tool Permissions Matrix'}
            </h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">
            {subTab === 'models'
              ? 'Multi-provider LLM orchestration for coding, fast log diagnostics, and accessibility verification.'
              : 'Individual granular tool capabilities granted to PRANTIK SITE AI. API keys & secrets remain server-side.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setSubTab('models')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              subTab === 'models'
                ? 'bg-rose-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Models ({aiModelConfigs.length})</span>
          </button>

          <button
            onClick={() => setSubTab('tools')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              subTab === 'tools'
                ? 'bg-rose-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Tools ({aiToolPermissions.length})</span>
          </button>
        </div>
      </div>

      {/* Models View */}
      {subTab === 'models' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {aiModelConfigs.map((m) => (
            <div
              key={m.id}
              className="bg-[#0c0c12] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
                      {m.provider}
                    </span>
                    <h3 className="font-display font-bold text-white text-base mt-0.5">
                      {m.model_name}
                    </h3>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      m.is_active
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {m.is_fallback ? 'FALLBACK' : m.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">{m.purpose}</p>

                <div className="space-y-2 text-xs pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Context Window</span>
                    <span className="font-mono text-zinc-300 font-bold">
                      {(m.context_limit / 1000).toFixed(0)}k tokens
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Sampling Temperature</span>
                    <span className="font-mono text-zinc-300 font-bold">{m.temperature}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Tokens Used Today</span>
                    <span className="font-mono text-rose-400 font-bold">
                      {m.tokens_used_today.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 text-[11px] text-zinc-500 font-mono flex items-center justify-between">
                <span>Secret: Server-Isolated</span>
                <span className="text-emerald-400 font-bold">SECURED</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tools View */}
      {subTab === 'tools' && (
        <div className="space-y-6">
          {toolCategories.map((cat) => {
            const toolsInCat = aiToolPermissions.filter((t) => t.category === cat);
            if (toolsInCat.length === 0) return null;
            return (
              <div key={cat} className="bg-[#0c0c12] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-rose-400" />
                    <span>{cat} Tools Gateway</span>
                  </h3>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {toolsInCat.filter((t) => t.is_enabled).length} of {toolsInCat.length} Authorized
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {toolsInCat.map((tool) => (
                    <div
                      key={tool.id}
                      className="p-3.5 bg-zinc-950/80 rounded-xl border border-white/5 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-rose-300">{tool.tool_key}</span>
                          {tool.requires_approval && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-950/60 text-amber-400 border border-amber-500/30">
                              REQUIRES APPROVAL
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-200 font-medium text-xs">{tool.name}</p>
                        <p className="text-zinc-500 text-[11px] leading-relaxed">{tool.description}</p>
                      </div>

                      <button
                        onClick={() => handleToggleTool(tool.id)}
                        className="cursor-pointer text-zinc-400 hover:text-white transition-colors shrink-0"
                        title="Toggle tool permission"
                      >
                        {tool.is_enabled ? (
                          <ToggleRight className="w-7 h-7 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-7 h-7 text-zinc-600" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
