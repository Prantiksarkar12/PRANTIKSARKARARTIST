import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Radio,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Server,
  Zap,
  Activity,
  AlertTriangle,
  RefreshCw,
  X,
  Lock,
} from 'lucide-react';
import { AiProviderConfig, AiDefaultAssignments } from '../../../types';
import { DEFAULT_AI_PROVIDERS, DEFAULT_AI_ASSIGNMENTS } from '../../../services/aiProvidersData';

export const AdminAiProviderManager: React.FC = () => {
  const [providers, setProviders] = useState<AiProviderConfig[]>(() => {
    try {
      const saved = localStorage.getItem('prantik_ai_providers_v1');
      return saved ? JSON.parse(saved) : DEFAULT_AI_PROVIDERS;
    } catch {
      return DEFAULT_AI_PROVIDERS;
    }
  });

  const [assignments, setAssignments] = useState<AiDefaultAssignments>(() => {
    try {
      const saved = localStorage.getItem('prantik_ai_assignments_v1');
      return saved ? JSON.parse(saved) : DEFAULT_AI_ASSIGNMENTS;
    } catch {
      return DEFAULT_AI_ASSIGNMENTS;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AiProviderConfig | null>(null);
  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    provider_type: 'gemini' | 'custom' | 'claude' | 'openai';
    api_key: string;
    api_endpoint: string;
    model: string;
    plan: 'Free' | 'Paid';
    is_enabled: boolean;
  }>({
    name: '',
    provider_type: 'gemini',
    api_key: '',
    api_endpoint: 'https://generativelanguage.googleapis.com',
    model: 'gemini-3.8-flash',
    plan: 'Free',
    is_enabled: true,
  });

  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const persistProviders = (newProviders: AiProviderConfig[]) => {
    setProviders(newProviders);
    try {
      localStorage.setItem('prantik_ai_providers_v1', JSON.stringify(newProviders));
    } catch (e) {
      console.warn('Failed to save AI providers', e);
    }
  };

  const persistAssignments = (newAssignments: AiDefaultAssignments) => {
    setAssignments(newAssignments);
    try {
      localStorage.setItem('prantik_ai_assignments_v1', JSON.stringify(newAssignments));
    } catch (e) {
      console.warn('Failed to save AI assignments', e);
    }
  };

  const handleOpenAdd = () => {
    setEditingProvider(null);
    setTestResult(null);
    setFormData({
      name: '',
      provider_type: 'gemini',
      api_key: '',
      api_endpoint: 'https://generativelanguage.googleapis.com',
      model: 'gemini-3.8-flash',
      plan: 'Free',
      is_enabled: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: AiProviderConfig) => {
    setEditingProvider(p);
    setTestResult(null);
    setFormData({
      id: p.id,
      name: p.name,
      provider_type: p.provider_type,
      api_key: p.api_key,
      api_endpoint: p.api_endpoint || '',
      model: p.model,
      plan: p.plan,
      is_enabled: p.is_enabled,
    });
    setIsModalOpen(true);
  };

  const handleTestConnection = async (testConfig?: { provider_type: string; api_key: string; model: string }) => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const config = testConfig || formData;
      const res = await fetch('/api/ai/providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message || (data.success ? 'Connection verified successfully.' : 'Connection failed.'),
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Could not connect to provider test API.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const id = formData.id || 'prov_' + Date.now();
    const updated: AiProviderConfig = {
      id,
      name: formData.name,
      provider_type: formData.provider_type,
      api_key: formData.api_key.trim() || '••••••••••••••••••••••••',
      api_endpoint: formData.api_endpoint,
      model: formData.model,
      plan: formData.plan,
      is_enabled: formData.is_enabled,
      is_primary: providers.length === 0,
      status: 'Connected',
      last_tested_at: new Date().toISOString(),
      created_at: editingProvider ? editingProvider.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (editingProvider) {
      persistProviders(providers.map((p) => (p.id === id ? updated : p)));
      showNotification(`Updated AI Provider "${updated.name}".`);
    } else {
      persistProviders([...providers, updated]);
      showNotification(`Added new AI Provider "${updated.name}".`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete AI Provider "${name}"?`)) {
      persistProviders(providers.filter((p) => p.id !== id));
      showNotification(`Deleted provider "${name}".`);
    }
  };

  const handleToggleEnable = (id: string) => {
    const next = providers.map((p) => (p.id === id ? { ...p, is_enabled: !p.is_enabled } : p));
    persistProviders(next);
    showNotification('Toggled provider status.');
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 rounded-lg bg-zinc-900 border border-rose-500/50 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in slide-in-from-top-2">
          {notification}
        </div>
      )}

      {/* Header Card */}
      <div className="bg-[#0b0b0f] border border-white/10 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-widest mb-1 font-mono">
            <Cpu className="w-4 h-4" />
            <span>Admin → AI Providers & Models</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight">
            AI Provider Manager
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl font-light">
            Connect multiple AI providers, configure secure server-side API keys, select default models for
            User Chat and Website Builder, and enable automatic rate-limit failover.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-lg shrink-0 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Provider</span>
        </button>
      </div>

      {/* Connected AI Providers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h3 className="font-display font-bold text-lg text-white uppercase tracking-tight flex items-center gap-2">
            <span>Connected AI Providers</span>
            <span className="text-xs font-mono text-zinc-500 font-normal">({providers.length})</span>
          </h3>
          <span className="text-[11px] font-mono text-zinc-500">
            Unlimited provider registry supported
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((p) => (
            <div
              key={p.id}
              className={`p-5 rounded-xl border transition-all ${
                p.is_enabled
                  ? 'bg-zinc-950/80 border-white/10 hover:border-white/20'
                  : 'bg-zinc-950/40 border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        p.status === 'Connected' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-zinc-500'
                      }`}
                    />
                    <h4 className="font-display font-bold text-white text-base uppercase tracking-tight">
                      {p.name}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 block">
                    Type: <strong className="text-rose-400 uppercase">{p.provider_type}</strong> · Model: {p.model}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Edit provider"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="p-1.5 rounded text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete provider"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>Plan:</span>
                  <span className="font-bold text-white">{p.plan}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>API Key:</span>
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>Server-Managed</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>Status:</span>
                  <span className={p.is_enabled ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                    {p.is_enabled ? '● Enabled' : '○ Disabled'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 mt-3">
                <button
                  onClick={() => handleTestConnection(p)}
                  className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Activity className="w-3 h-3 text-amber-400" />
                  <span>Test Connection</span>
                </button>
                <button
                  onClick={() => handleToggleEnable(p.id)}
                  className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                    p.is_enabled
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900'
                  }`}
                >
                  {p.is_enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Default AI Model Assignments Grid */}
      <div className="p-6 rounded-xl bg-zinc-950 border border-white/10 space-y-6">
        <div className="border-b border-white/10 pb-3">
          <h3 className="font-display font-bold text-lg text-white uppercase tracking-tight flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Default AI Model Assignments</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Choose which AI provider and model powers each functional domain of the application.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
              Public User Chat
            </label>
            <select
              value={assignments.user_chat_provider_id}
              onChange={(e) =>
                persistAssignments({ ...assignments, user_chat_provider_id: e.target.value })
              }
              className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.model})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
              Admin Website Builder
            </label>
            <select
              value={assignments.website_builder_provider_id}
              onChange={(e) =>
                persistAssignments({ ...assignments, website_builder_provider_id: e.target.value })
              }
              className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.model})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
              Coding & STEM Logic
            </label>
            <select
              value={assignments.coding_provider_id}
              onChange={(e) => persistAssignments({ ...assignments, coding_provider_id: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.model})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
              Research & Knowledge
            </label>
            <select
              value={assignments.research_provider_id}
              onChange={(e) => persistAssignments({ ...assignments, research_provider_id: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.model})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
              Image Generation
            </label>
            <select
              value={assignments.image_provider_id}
              onChange={(e) => persistAssignments({ ...assignments, image_provider_id: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.model})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
              Voice Dictation & Audio
            </label>
            <select
              value={assignments.voice_provider_id}
              onChange={(e) => persistAssignments({ ...assignments, voice_provider_id: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.model})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Failover & Resilience Section */}
      <div className="p-6 rounded-xl bg-zinc-950 border border-white/10 space-y-4">
        <div className="border-b border-white/10 pb-3">
          <h3 className="font-display font-bold text-lg text-white uppercase tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Failover & Health Policies</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Ensure high availability when primary quotas are saturated or transient provider outages occur.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
              Backup Failover Provider
            </label>
            <select
              value={assignments.failover_backup_provider_id || ''}
              onChange={(e) =>
                persistAssignments({ ...assignments, failover_backup_provider_id: e.target.value })
              }
              className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
            >
              <option value="">No backup provider (fail closed)</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.model})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-300 select-none">
              <input
                type="checkbox"
                checked={assignments.auto_fallback_enabled}
                onChange={(e) =>
                  persistAssignments({ ...assignments, auto_fallback_enabled: e.target.checked })
                }
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <span className="font-semibold text-xs">Automatic Fallback</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-zinc-300 select-none">
              <input
                type="checkbox"
                checked={assignments.health_check_enabled}
                onChange={(e) =>
                  persistAssignments({ ...assignments, health_check_enabled: e.target.checked })
                }
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <span className="font-semibold text-xs">Connection Health Check & Auto-Ping</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-zinc-300 select-none">
              <input
                type="checkbox"
                checked={assignments.rate_limit_detection}
                onChange={(e) =>
                  persistAssignments({ ...assignments, rate_limit_detection: e.target.checked })
                }
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <span className="font-semibold text-xs">Rate-Limit & Quota Detection</span>
            </label>
          </div>
        </div>
      </div>

      {/* Add / Edit Provider Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#0e0e14] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 text-zinc-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-rose-500 uppercase tracking-widest block font-bold">
                Admin → AI Provider Manager
              </span>
              <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">
                {editingProvider ? `Edit ${editingProvider.name}` : 'Add New AI Provider'}
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                  Provider Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Google Gemini 3.8, Gemini Pro Preview, Custom LLM"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                    Provider Type *
                  </label>
                  <select
                    value={formData.provider_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        provider_type: e.target.value as any,
                        model: e.target.value === 'gemini' ? 'gemini-3.8-flash' : 'custom-model-v1',
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="gemini">Google Gemini</option>
                    <option value="custom">Custom Provider</option>
                    <option value="claude">Anthropic Claude</option>
                    <option value="openai">OpenAI Compatible</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                    Plan
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="plan"
                        checked={formData.plan === 'Free'}
                        onChange={() => setFormData({ ...formData, plan: 'Free' })}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Free</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="plan"
                        checked={formData.plan === 'Paid'}
                        onChange={() => setFormData({ ...formData, plan: 'Paid' })}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Paid</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  placeholder="••••••••••••••••••••••••••••••••••••••"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white font-mono text-[11px] focus:outline-none focus:border-rose-500"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Keys are stored securely on the server and never sent to public client browsers.
                </span>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                  API Endpoint URL
                </label>
                <input
                  type="url"
                  value={formData.api_endpoint}
                  onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
                  placeholder="https://generativelanguage.googleapis.com"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white font-mono text-[11px] focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                    Model Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="gemini-3.8-flash, gemini-3.1-pro-preview"
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white font-mono text-[11px] focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                    Status
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="is_enabled"
                        checked={formData.is_enabled}
                        onChange={() => setFormData({ ...formData, is_enabled: true })}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Enabled</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="is_enabled"
                        checked={!formData.is_enabled}
                        onChange={() => setFormData({ ...formData, is_enabled: false })}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Disabled</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Test Connection Output */}
              {testResult && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => handleTestConnection()}
                  disabled={isTesting}
                  className="px-3.5 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg transition-colors"
                  >
                    Save Provider
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
