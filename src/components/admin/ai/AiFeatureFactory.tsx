import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Code2,
  Database,
  FileText,
  ShieldCheck,
  Eye,
  Play,
  X,
  Bot,
} from 'lucide-react';
import { useRealtimeData } from '../../../hooks/useRealtimeData';
import { db } from '../../../services/db';
import { AiFeatureRequest, AiTaskPriority } from '../../../types';

export const AiFeatureFactory: React.FC = () => {
  const { aiFeatures, sites } = useRealtimeData();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<AiFeatureRequest | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formProblem, setFormProblem] = useState('');
  const [formPriority, setFormPriority] = useState<AiTaskPriority>('HIGH');
  const [formSite, setFormSite] = useState('root');
  const [formEnv, setFormEnv] = useState<'Development' | 'Staging' | 'Production'>('Development');
  const [formDesign, setFormDesign] = useState('Adhere strictly to Dark Luxury aesthetic, Syne font, crimson (#e11d48) & gold accents.');
  const [formTech, setFormTech] = useState('Clean React hooks, Web Audio API, strict TypeScript, responsive CSS.');
  const [formCriteria, setFormCriteria] = useState('Pass automated unit tests, responsive at 375px mobile and 1440px desktop, sub-50ms latency.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formProblem.trim()) return;

    setIsSubmitting(true);
    const newFeat = db.createAiFeature({
      name: formName.trim(),
      description: formDesc.trim(),
      user_problem: formProblem.trim(),
      priority: formPriority,
      target_site_id: formSite,
      target_environment: formEnv,
      design_requirements: formDesign,
      technical_requirements: formTech,
      acceptance_criteria: formCriteria,
    });

    setIsSubmitting(false);
    setModalOpen(false);
    setSelectedFeature(newFeat);
    // Reset
    setFormName('');
    setFormDesc('');
    setFormProblem('');
  };

  const steps = [
    'Idea / Problem',
    'Specification',
    'Implementation',
    'Testing',
    'Preview',
    'Approval',
    'Deployment',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0c0c12] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="font-display font-black text-xl text-white tracking-tight uppercase">
              AI Feature Factory
            </h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">
            Propose high-impact product capabilities. AI synthesizes architecture specifications, UI layouts, tests, and preview sandboxes.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold uppercase tracking-wider text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Feature</span>
        </button>
      </div>

      {/* Feature Pipeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Features List */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-white text-sm uppercase flex items-center gap-2">
            <span>Feature Pipeline ({aiFeatures.length})</span>
          </h3>

          <div className="space-y-3">
            {aiFeatures.map((feat) => {
              const isSelected = selectedFeature?.id === feat.id;
              return (
                <div
                  key={feat.id}
                  onClick={() => setSelectedFeature(feat)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-zinc-950 border-rose-500/50 shadow-xl shadow-rose-950/30'
                      : 'bg-[#0c0c12] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display font-bold text-white text-base">{feat.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            feat.priority === 'HIGH' || feat.priority === 'CRITICAL'
                              ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {feat.priority}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2">{feat.description}</p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-zinc-900 border border-white/10 text-emerald-400 shrink-0">
                      {feat.status}
                    </span>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                      <span>Pipeline Progress</span>
                      <span>{feat.status === 'PREVIEW_READY' ? 'Preview Stage (80%)' : 'Specifying (25%)'}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-rose-500"
                        style={{ width: feat.status === 'PREVIEW_READY' ? '80%' : '30%' }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-white/5">
                    <span>Target: {feat.target_environment}</span>
                    <span>{new Date(feat.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Feature Specification Detail Viewer */}
        <div className="bg-[#0c0c12] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
          {selectedFeature ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">
                    Feature ID: {selectedFeature.id}
                  </span>
                  <h3 className="font-display font-black text-xl text-white mt-0.5">
                    {selectedFeature.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">{selectedFeature.description}</p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                  {selectedFeature.status}
                </span>
              </div>

              {/* Step Pipeline Graphic */}
              <div className="p-4 bg-zinc-950/60 rounded-xl border border-white/5 space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
                  Autonomous Synthesis Lifecycle
                </span>
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-mono no-scrollbar">
                  {steps.map((step, idx) => {
                    const isDone = idx < 5;
                    const isCurrent = idx === 4;
                    return (
                      <div
                        key={step}
                        className={`px-2.5 py-1 rounded flex items-center gap-1 shrink-0 ${
                          isDone
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                            : 'bg-zinc-900 text-zinc-600 border border-white/5'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-3 h-3 text-rose-400" /> : <Clock className="w-3 h-3" />}
                        <span>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Architecture Spec Details */}
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-rose-400" />
                    <span>Technical Architecture Specification</span>
                  </span>
                  <p className="text-zinc-300 whitespace-pre-line text-[11px] leading-relaxed">
                    {selectedFeature.specification || 'Synthesizing technical specification via Gemini 3.1 Pro...'}
                  </p>
                </div>

                <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1.5">
                    <Eye className="w-3 h-3 text-amber-400" />
                    <span>UI/UX Proposal</span>
                  </span>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">
                    {selectedFeature.ui_proposal || 'Generating dark glassmorphic layout preview...'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1.5">
                      <Database className="w-3 h-3 text-cyan-400" />
                      <span>Database Schema</span>
                    </span>
                    <p className="text-zinc-400 text-[11px]">
                      {selectedFeature.database_requirements || 'No schema alterations required.'}
                    </p>
                  </div>

                  <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1.5">
                      <Code2 className="w-3 h-3 text-emerald-400" />
                      <span>API Endpoints</span>
                    </span>
                    <p className="text-zinc-400 text-[11px]">
                      {selectedFeature.api_requirements || 'Client state bus synchronization.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-2">
              <Layers className="w-8 h-8 text-zinc-700" />
              <p className="text-xs">Select a feature from the pipeline to inspect its AI specification and code breakdown.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Feature Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
          <div className="bg-[#0c0c12] border border-white/15 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 mb-6">
              <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">
                Feature Factory
              </span>
              <h3 className="font-display font-black text-2xl text-white tracking-tight uppercase">
                Propose New Feature
              </h3>
              <p className="text-xs text-zinc-400">
                Provide problem context and constraints. PRANTIK SITE AI will author the full technical specification.
              </p>
            </div>

            <form onSubmit={handleCreateFeature} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
                  Feature Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. VIP Backstage Audio Pass & Live Streaming Player"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded-lg text-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
                  User Problem / Motivation *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formProblem}
                  onChange={(e) => setFormProblem(e.target.value)}
                  placeholder="Describe the fan or artist problem being solved..."
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded-lg text-white focus:border-rose-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
                  Feature Description
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Detailed feature breakdown..."
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded-lg text-white focus:border-rose-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold uppercase text-[10px]">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as AiTaskPriority)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white font-mono text-xs focus:border-rose-500 focus:outline-hidden"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold uppercase text-[10px]">Target Environment</label>
                  <select
                    value={formEnv}
                    onChange={(e) => setFormEnv(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white font-mono text-xs focus:border-rose-500 focus:outline-hidden"
                  >
                    <option value="Development">Development (Isolated Branch)</option>
                    <option value="Staging">Staging</option>
                    <option value="Production">Production (Requires Approval)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !formName.trim()}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50 mt-4"
              >
                {isSubmitting ? 'Synthesizing Architecture...' : 'Generate Feature Architecture Specification →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
