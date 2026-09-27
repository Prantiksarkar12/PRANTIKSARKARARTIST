import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Code2,
  CheckCircle2,
  ExternalLink,
  Plus,
  Music,
  Radio,
  FolderKanban,
  Flame,
  FileCode,
  Eye,
  X,
} from 'lucide-react';
import { SYSTEM_TEMPLATES } from '../../../services/siteTemplates';
import { ProjectTemplate } from '../../../types';

interface TemplatesCatalogProps {
  onUseTemplate: (template: ProjectTemplate) => void;
  onBack: () => void;
}

export const TemplatesCatalog: React.FC<TemplatesCatalogProps> = ({ onUseTemplate, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [inspectingTemplate, setInspectingTemplate] = useState<ProjectTemplate | null>(null);

  const categories = ['ALL', 'Artist', 'Record Label', 'Portfolio', 'Landing Page', 'Custom'];

  const filteredTemplates = SYSTEM_TEMPLATES.filter(
    (t) => selectedCategory === 'ALL' || t.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/80 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-amber-400" />
            <h2 className="font-display font-black text-xl uppercase tracking-tight text-white">
              Official Project Templates
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            Pre-scaffolded, production-ready architectures designed for music artists, labels, drops, and creative portfolios.
          </p>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-300 rounded-lg transition"
        >
          Back to Sites
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition ${
              selectedCategory === cat
                ? 'bg-rose-950 border border-rose-500 text-white'
                : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="bg-zinc-950/80 hover:bg-zinc-900/90 border border-white/10 hover:border-amber-500/50 rounded-2xl p-5 flex flex-col justify-between transition shadow-lg"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-amber-400">
                  {tmpl.icon === 'Music' ? (
                    <Music className="w-5 h-5" />
                  ) : tmpl.icon === 'Radio' ? (
                    <Radio className="w-5 h-5" />
                  ) : tmpl.icon === 'FolderKanban' ? (
                    <FolderKanban className="w-5 h-5" />
                  ) : tmpl.icon === 'Flame' ? (
                    <Flame className="w-5 h-5" />
                  ) : (
                    <Code2 className="w-5 h-5" />
                  )}
                </div>
                {tmpl.badge && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-700/50 text-amber-300">
                    {tmpl.badge}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white mb-1.5">{tmpl.name}</h3>
              <p className="text-xs text-zinc-400 mb-4 line-clamp-3">{tmpl.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {tmpl.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-white/5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
              <button
                onClick={() => setInspectingTemplate(tmpl)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg border border-white/5 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                Inspect Files
              </button>

              <button
                onClick={() => onUseTemplate(tmpl)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inspect Template Modal */}
      {inspectingTemplate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Template Source: {inspectingTemplate.name}
                </h3>
                <p className="text-xs text-zinc-500 font-mono">
                  {inspectingTemplate.default_files.length} bundled files
                </p>
              </div>
              <button
                onClick={() => setInspectingTemplate(null)}
                className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-4 font-mono text-xs">
              {inspectingTemplate.default_files.map((file) => (
                <div key={file.path} className="space-y-1 bg-zinc-900/60 p-3 rounded-xl border border-white/5">
                  <div className="text-rose-400 font-bold flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5" />
                    {file.path}
                  </div>
                  <pre className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-zinc-300 text-[11px] overflow-x-auto max-h-48">
                    {file.content}
                  </pre>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/10 flex justify-end gap-2">
              <button
                onClick={() => setInspectingTemplate(null)}
                className="px-4 py-2 bg-zinc-900 text-zinc-300 text-xs rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const tmpl = inspectingTemplate;
                  setInspectingTemplate(null);
                  onUseTemplate(tmpl);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg"
              >
                Instantiate Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
