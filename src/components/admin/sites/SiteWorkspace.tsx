import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Globe,
  ArrowLeft,
  Code2,
  Play,
  Rocket,
  History,
  Shield,
  Layers,
  FileCode,
  FolderOpen,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  ExternalLink,
  Laptop,
  Tablet,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Copy,
  Terminal,
  Database,
  Key,
  Settings as SettingsIcon,
  FileArchive,
  Edit2,
  RotateCcw,
  Check,
  Eye,
} from 'lucide-react';
import {
  SiteProject,
  ProjectFile,
  ProjectBuild,
  ProjectDeployment,
  ProjectVersion,
  ProjectDomain,
  ProjectEnvVar,
  ProjectDatabaseConfig,
} from '../../../types';
import { db } from '../../../services/db';
import { SiteConsole } from './console/SiteConsole';

interface SiteWorkspaceProps {
  siteId: string;
  initialTab?: string;
  onBack: () => void;
}

type WorkspaceTab =
  | 'overview'
  | 'editor'
  | 'console'
  | 'preview'
  | 'builds'
  | 'deployments'
  | 'versions'
  | 'domains'
  | 'database'
  | 'env'
  | 'settings'
  | 'logs';

export const SiteWorkspace: React.FC<SiteWorkspaceProps> = ({
  siteId,
  initialTab = 'overview',
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(initialTab as WorkspaceTab);
  const site = db.getSite(siteId);

  // File Explorer & Code Editor State
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string>('');
  const [editorCode, setEditorCode] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);

  // Preview State
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewUrlPath, setPreviewUrlPath] = useState('/');
  const [previewKey, setPreviewKey] = useState(0);

  // Builds & Deployments State
  const [builds, setBuilds] = useState<ProjectBuild[]>([]);
  const [deployments, setDeployments] = useState<ProjectDeployment[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildCommitMsg, setBuildCommitMsg] = useState('');

  // Versions State
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [newVersionMsg, setNewVersionMsg] = useState('');

  // Domains & Envs State
  const [domains, setDomains] = useState<ProjectDomain[]>([]);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [envVars, setEnvVars] = useState<ProjectEnvVar[]>([]);
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvVal, setNewEnvVal] = useState('');

  // DB Config
  const [dbConfig, setDbConfig] = useState<ProjectDatabaseConfig | null>(null);

  // Settings State
  const [siteName, setSiteName] = useState(site?.name || '');
  const [siteDesc, setSiteDesc] = useState(site?.description || '');
  const [siteEnv, setSiteEnv] = useState(site?.environment || 'Production');

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const refreshWorkspaceData = () => {
    if (!siteId) return;
    const projectFiles = db.getSiteFiles(siteId);
    setFiles(projectFiles);

    if (projectFiles.length > 0 && !activeFilePath) {
      // Pick first file (e.g. index.html or package.json or page.tsx)
      const defaultFile =
        projectFiles.find((f) => f.path === 'index.html' || f.path === 'src/app/page.tsx') ||
        projectFiles[0];
      setActiveFilePath(defaultFile.path);
      setEditorCode(defaultFile.content);
    }

    setBuilds(db.getSiteBuilds(siteId));
    setDeployments(db.getSiteDeployments(siteId));
    setVersions(db.getSiteVersions(siteId));
    setDomains(db.getSiteDomains(siteId));
    setEnvVars(db.getSiteEnvVars(siteId));
    setDbConfig(db.getSiteDatabase(siteId));
  };

  useEffect(() => {
    refreshWorkspaceData();
  }, [siteId]);

  if (!site) {
    return (
      <div className="bg-zinc-950 border border-white/10 rounded-2xl p-12 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-white">Project Not Found</h3>
        <p className="text-xs text-zinc-400">The requested site ID "{siteId}" does not exist in the database.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 rounded-lg"
        >
          Back to Sites List
        </button>
      </div>
    );
  }

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Editor Actions
  const handleSelectFile = (path: string) => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Discard and switch file?')) return;
    }
    const file = db.getSiteFile(siteId, path);
    if (file) {
      setActiveFilePath(file.path);
      setEditorCode(file.content);
      setHasUnsavedChanges(false);
    }
  };

  const handleSaveFile = () => {
    if (!activeFilePath) return;
    db.saveSiteFile(siteId, activeFilePath, editorCode);
    setHasUnsavedChanges(false);
    setFiles(db.getSiteFiles(siteId));
    showNotification(`Saved ${activeFilePath}`);
  };

  const handleCreateNewFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const cleanPath = newFileName.trim().replace(/^\//, '');
    const newFile = db.saveSiteFile(siteId, cleanPath, '// New file content\n');
    setFiles(db.getSiteFiles(siteId));
    setActiveFilePath(newFile.path);
    setEditorCode(newFile.content);
    setNewFileName('');
    setIsCreatingFile(false);
    showNotification(`Created file ${cleanPath}`);
  };

  const handleDeleteFile = (path: string) => {
    if (confirm(`Delete file "${path}"?`)) {
      db.deleteSiteFile(siteId, path);
      const remaining = db.getSiteFiles(siteId);
      setFiles(remaining);
      if (activeFilePath === path) {
        if (remaining.length > 0) {
          setActiveFilePath(remaining[0].path);
          setEditorCode(remaining[0].content);
        } else {
          setActiveFilePath('');
          setEditorCode('');
        }
      }
      showNotification(`Deleted ${path}`);
    }
  };

  // Build Action
  const handleTriggerBuild = async () => {
    setIsBuilding(true);
    try {
      await db.triggerSiteBuild(siteId, 'manual', buildCommitMsg || undefined);
      setBuildCommitMsg('');
      refreshWorkspaceData();
      showNotification('Production build completed successfully!');
    } catch (err: any) {
      alert(err?.message || 'Build failed');
    } finally {
      setIsBuilding(false);
    }
  };

  // Version Snapshot Action
  const handleCreateVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionMsg.trim()) return;
    db.createSiteVersion(siteId, newVersionMsg.trim());
    setNewVersionMsg('');
    setVersions(db.getSiteVersions(siteId));
    showNotification('Created new version snapshot checkpoint');
  };

  const handleRestoreVersion = (verId: string) => {
    if (confirm('Restore all files to this version snapshot? Current uncommitted changes will be replaced.')) {
      db.restoreSiteVersion(siteId, verId);
      refreshWorkspaceData();
      showNotification('Project restored to snapshot version');
    }
  };

  // Domain Actions
  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainInput.trim()) return;
    db.addSiteDomain(siteId, newDomainInput.trim());
    setNewDomainInput('');
    setDomains(db.getSiteDomains(siteId));
    showNotification('Domain added');
  };

  // Env Var Actions
  const handleAddEnvVar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvKey.trim()) return;
    db.setSiteEnvVar(siteId, newEnvKey, newEnvVal);
    setNewEnvKey('');
    setNewEnvVal('');
    setEnvVars(db.getSiteEnvVars(siteId));
    showNotification('Environment variable saved');
  };

  const handleDeleteEnvVar = (id: string) => {
    db.deleteSiteEnvVar(siteId, id);
    setEnvVars(db.getSiteEnvVars(siteId));
  };

  // Settings Action
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateSite(siteId, {
      name: siteName,
      description: siteDesc,
      environment: siteEnv as any,
    });
    showNotification('Project settings updated');
  };

  // Generate preview content
  const previewHtmlContent = useMemo(() => {
    const indexHtml = files.find((f) => f.path === 'index.html');
    if (indexHtml) return indexHtml.content;

    const pageTsx = files.find((f) => f.path === 'src/app/page.tsx' || f.path === 'src/App.tsx');
    if (pageTsx) {
      return `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-black text-white p-8 font-sans"><h1 class="text-2xl font-bold mb-2">${site.name}</h1><p class="text-zinc-400 text-sm mb-4">React / Next.js Component Render</p><div class="p-4 bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-xs text-zinc-300"><pre>${pageTsx.content.replace(/</g, '&lt;')}</pre></div></body></html>`;
    }

    return `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-950 text-white flex flex-col items-center justify-center min-h-screen text-center p-6"><h1 class="text-3xl font-bold mb-2">${site.name}</h1><p class="text-zinc-400 text-xs">No index.html file found in project root.</p></body></html>`;
  }, [files, site.name]);

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          {notificationMsg}
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="bg-zinc-950/90 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-lg text-white tracking-tight uppercase">
                {site.name}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-zinc-300">
                {site.category}
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  site.environment === 'Production'
                    ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-400'
                    : 'bg-amber-950/60 border-amber-700/50 text-amber-400'
                }`}
              >
                {site.environment}
              </span>
            </div>
            <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2 mt-0.5">
              <span>{site.id}</span>
              <span>•</span>
              <span className="text-rose-400">/{site.slug}</span>
              {site.custom_domain && (
                <>
                  <span>•</span>
                  <span className="text-sky-400">{site.custom_domain}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'preview'
                ? 'bg-rose-950 border border-rose-500 text-white'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-rose-400" />
            Live Preview
          </button>

          <button
            onClick={handleTriggerBuild}
            disabled={isBuilding}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-rose-950 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Rocket className={`w-3.5 h-3.5 ${isBuilding ? 'animate-spin' : ''}`} />
            {isBuilding ? 'Compiling...' : 'Build & Deploy'}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 pb-2 text-xs font-mono">
        {[
          { id: 'overview', label: 'Overview', icon: Globe },
          { id: 'editor', label: `Code Editor (${files.length})`, icon: Code2 },
          { id: 'preview', label: 'Live Preview', icon: Eye },
          { id: 'builds', label: `Builds (${builds.length})`, icon: Terminal },
          { id: 'deployments', label: `Deployments (${deployments.length})`, icon: Rocket },
          { id: 'versions', label: `Versions (${versions.length})`, icon: History },
          { id: 'domains', label: `Domains (${domains.length})`, icon: Globe },
          { id: 'database', label: 'Database', icon: Database },
          { id: 'env', label: `Env Vars (${envVars.length})`, icon: Key },
          { id: 'settings', label: 'Settings', icon: SettingsIcon },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as WorkspaceTab)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition ${
                isActive
                  ? 'bg-rose-950/80 border border-rose-500/80 text-white font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-950/80 border border-white/10 rounded-2xl">
              <div className="text-[11px] font-mono uppercase text-zinc-500 mb-1">Status</div>
              <div className="text-base font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {site.status.toUpperCase()}
              </div>
              <div className="text-[10px] text-zinc-400 mt-1">Ready for traffic</div>
            </div>

            <div className="p-4 bg-zinc-950/80 border border-white/10 rounded-2xl">
              <div className="text-[11px] font-mono uppercase text-zinc-500 mb-1">Total Source Files</div>
              <div className="text-base font-bold text-white font-mono">{files.length}</div>
              <div className="text-[10px] text-zinc-400 mt-1">{(site.total_size_bytes / 1024).toFixed(1)} KB footprint</div>
            </div>

            <div className="p-4 bg-zinc-950/80 border border-white/10 rounded-2xl">
              <div className="text-[11px] font-mono uppercase text-zinc-500 mb-1">Production URL</div>
              <div className="text-xs font-mono font-bold text-rose-400 truncate">
                {site.custom_domain || `${site.slug}.prantiksarkar.studio`}
              </div>
              <div className="text-[10px] text-emerald-400 mt-1">SSL Certificate Valid</div>
            </div>

            <div className="p-4 bg-zinc-950/80 border border-white/10 rounded-2xl">
              <div className="text-[11px] font-mono uppercase text-zinc-500 mb-1">Active Version</div>
              <div className="text-base font-bold text-white font-mono">
                {versions[0]?.name || 'v1.0.0'}
              </div>
              <div className="text-[10px] text-zinc-400 mt-1">{versions.length} checkpoints</div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 bg-zinc-950/80 border border-white/10 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-rose-500" />
                Build & Deploy Pipeline
              </h3>
              <p className="text-xs text-zinc-400">
                Trigger a complete TypeScript compilation, bundle optimization, and CDN edge cache invalidation.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleTriggerBuild}
                  disabled={isBuilding}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  {isBuilding ? 'Building...' : 'Trigger Production Build'}
                </button>
                <button
                  onClick={() => setActiveTab('editor')}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl border border-white/10 transition"
                >
                  Open Code Editor
                </button>
              </div>
            </div>

            <div className="p-5 bg-zinc-950/80 border border-white/10 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                Custom Domain & Routing
              </h3>
              <p className="text-xs text-zinc-400">
                Map your custom domain (e.g. {site.slug}.com) with automatic DNS verification and instant TLS certificate.
              </p>
              <button
                onClick={() => setActiveTab('domains')}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-xl border border-white/10 transition"
              >
                Configure Custom Domains
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SITE CONSOLE (FULL IDE & CONTROL PANEL) */}
      {(activeTab === 'editor' || activeTab === 'console') && (
        <SiteConsole siteId={siteId} onBack={() => setActiveTab('overview')} />
      )}

      {/* TAB 3: LIVE PREVIEW */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          {/* Device and Controls Bar */}
          <div className="bg-zinc-950 border border-white/10 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-white/5">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded text-xs flex items-center gap-1 transition ${
                  previewDevice === 'desktop' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400'
                }`}
              >
                <Laptop className="w-4 h-4" />
                Desktop
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`p-1.5 rounded text-xs flex items-center gap-1 transition ${
                  previewDevice === 'tablet' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400'
                }`}
              >
                <Tablet className="w-4 h-4" />
                Tablet (768px)
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded text-xs flex items-center gap-1 transition ${
                  previewDevice === 'mobile' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Mobile (375px)
              </button>
            </div>

            {/* URL Display */}
            <div className="hidden md:flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-lg border border-white/5 text-xs font-mono text-zinc-400">
              <Globe className="w-3.5 h-3.5 text-rose-400" />
              <span>https://{site.slug}.prantiksarkar.studio{previewUrlPath}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewKey((k) => k + 1)}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/5 transition"
                title="Reload Frame"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Iframe Viewport Container */}
          <div className="flex justify-center bg-zinc-950/60 p-4 border border-white/10 rounded-2xl min-h-[600px] overflow-x-auto">
            <div
              className={`transition-all duration-300 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl bg-black ${
                previewDevice === 'desktop'
                  ? 'w-full max-w-full h-[650px]'
                  : previewDevice === 'tablet'
                  ? 'w-[768px] h-[650px]'
                  : 'w-[375px] h-[650px]'
              }`}
            >
              <iframe
                key={previewKey}
                title={`Preview ${site.name}`}
                srcDoc={previewHtmlContent}
                sandbox="allow-scripts allow-same-origin allow-forms"
                className="w-full h-full border-0 bg-black"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BUILDS */}
      {activeTab === 'builds' && (
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase text-white">Trigger Production Compilation</h3>
              <p className="text-xs text-zinc-400">
                Parses AST, executes bundle minification, and produces immutable deployment artifacts.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Commit message (e.g. Update hero banner styling)"
                value={buildCommitMsg}
                onChange={(e) => setBuildCommitMsg(e.target.value)}
                className="px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none w-64"
              />
              <button
                onClick={handleTriggerBuild}
                disabled={isBuilding}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                {isBuilding ? 'Building...' : 'Build Now'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {builds.map((build) => (
              <div key={build.id} className="bg-zinc-950 border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{build.id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-700/50">
                      {build.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">
                    {new Date(build.start_time).toLocaleString()} ({build.duration_seconds}s)
                  </span>
                </div>
                <div className="bg-[#050507] border border-zinc-900 rounded-xl p-3 font-mono text-[11px] text-zinc-400 space-y-1">
                  {build.logs.map((log, i) => (
                    <div key={i} className="truncate">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DEPLOYMENTS */}
      {activeTab === 'deployments' && (
        <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-zinc-900/50 font-mono text-[11px] text-zinc-400 uppercase">
                <th className="py-3 px-4">Deployment</th>
                <th className="py-3 px-4">Environment</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Rollback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {deployments.map((dep) => (
                <tr key={dep.id} className="hover:bg-zinc-900/40">
                  <td className="py-3 px-4 font-mono font-bold text-white">{dep.id}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400">{dep.environment}</td>
                  <td className="py-3 px-4 font-mono text-rose-400">{dep.domain}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-700/50">
                      {dep.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-500">{new Date(dep.created_at).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    {dep.status !== 'active' && (
                      <button
                        onClick={() => {
                          db.rollbackSiteDeployment(siteId, dep.id);
                          refreshWorkspaceData();
                          showNotification('Rolled back to previous deployment');
                        }}
                        className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-xs text-amber-400 rounded border border-white/10 flex items-center gap-1 ml-auto"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Rollback
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 6: VERSIONS */}
      {activeTab === 'versions' && (
        <div className="space-y-6">
          <form
            onSubmit={handleCreateVersion}
            className="bg-zinc-950 border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <h3 className="text-xs font-bold uppercase text-white">Create Snapshot Checkpoint</h3>
              <p className="text-xs text-zinc-400">
                Saves an immutable snapshot of all current project files for instant 1-click restore.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Commit message (e.g. Added audio player modal)"
                value={newVersionMsg}
                onChange={(e) => setNewVersionMsg(e.target.value)}
                required
                className="px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none w-64"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Create Snapshot
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {versions.map((ver) => (
              <div
                key={ver.id}
                className="p-4 bg-zinc-950 border border-white/10 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{ver.name}</span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {ver.snapshot_file_count} files
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">{ver.commit_message}</div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-1">
                    By {ver.created_by} • {new Date(ver.created_at).toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => handleRestoreVersion(ver.id)}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  Restore Files
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: DOMAINS */}
      {activeTab === 'domains' && (
        <div className="space-y-6">
          <form
            onSubmit={handleAddDomain}
            className="bg-zinc-950 border border-white/10 p-5 rounded-2xl flex gap-3 items-end"
          >
            <div className="flex-1">
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Custom Domain (Apex or Subdomain)
              </label>
              <input
                type="text"
                placeholder="e.g. music.prantiksarkar.com"
                value={newDomainInput}
                onChange={(e) => setNewDomainInput(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer h-9"
            >
              Add Domain
            </button>
          </form>

          <div className="space-y-4">
            {domains.map((dom) => (
              <div key={dom.id} className="p-5 bg-zinc-950 border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sky-400" />
                    <span className="font-bold text-sm text-white font-mono">{dom.domain_name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                      SSL Active
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      db.deleteSiteDomain(siteId, dom.id);
                      setDomains(db.getSiteDomains(siteId));
                    }}
                    className="p-1 text-zinc-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-white/5 font-mono text-xs">
                  <div className="text-[10px] text-zinc-500 mb-2">DNS TARGET:</div>
                  <div className="flex justify-between items-center text-zinc-300">
                    <span>A Record: @ → 76.76.21.21</span>
                    <span className="text-emerald-400 text-[10px]">Verified</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: DATABASE */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-white/10 p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-white uppercase">Project Relational Database</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                ONLINE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Local relational database engine. Persists records, user inputs, and submission models.
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-zinc-900 rounded-xl border border-white/5">
                <div className="text-[10px] font-mono text-zinc-500">Provider</div>
                <div className="text-xs font-bold text-white mt-0.5">SQLite / In-Memory</div>
              </div>
              <div className="p-3 bg-zinc-900 rounded-xl border border-white/5">
                <div className="text-[10px] font-mono text-zinc-500">Active Tables</div>
                <div className="text-xs font-bold text-white mt-0.5">3 Tables Defined</div>
              </div>
              <div className="p-3 bg-zinc-900 rounded-xl border border-white/5">
                <div className="text-[10px] font-mono text-zinc-500">Backup Status</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">Automatic Snapshot</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: ENV VARS */}
      {activeTab === 'env' && (
        <div className="space-y-6">
          <form
            onSubmit={handleAddEnvVar}
            className="bg-zinc-950 border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row gap-3 items-end"
          >
            <div className="flex-1">
              <label className="block text-xs font-mono text-zinc-400 mb-1">Key</label>
              <input
                type="text"
                placeholder="DATABASE_URL, API_SECRET"
                value={newEnvKey}
                onChange={(e) => setNewEnvKey(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-mono text-zinc-400 mb-1">Value</label>
              <input
                type="password"
                placeholder="Secret value"
                value={newEnvVal}
                onChange={(e) => setNewEnvVal(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer h-9"
            >
              Add Variable
            </button>
          </form>

          <div className="space-y-2">
            {envVars.map((env) => (
              <div
                key={env.id}
                className="p-3 bg-zinc-950 border border-white/10 rounded-xl flex items-center justify-between font-mono text-xs"
              >
                <div>
                  <span className="text-rose-400 font-bold">{env.key}</span> ={' '}
                  <span className="text-zinc-500">••••••••••••••••</span>
                </div>
                <button
                  onClick={() => handleDeleteEnvVar(env.id)}
                  className="p-1 text-zinc-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 10: SETTINGS */}
      {activeTab === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="bg-zinc-950 border border-white/10 p-6 rounded-2xl space-y-5"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            General Project Settings
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                Description
              </label>
              <textarea
                value={siteDesc}
                onChange={(e) => setSiteDesc(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete project "${site.name}"? This cannot be undone.`)) {
                    db.deleteSite(siteId);
                    onBack();
                  }
                }}
                className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold uppercase rounded-lg transition"
              >
                Delete Project
              </button>

              <button
                type="submit"
                className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
