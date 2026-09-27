import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Globe,
  Rocket,
  Code2,
  Terminal,
  History,
  Eye,
  Search,
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Laptop,
  Tablet,
  Smartphone,
  X,
  Plus,
  Trash2,
  Key,
  Database,
  Sliders,
  Check,
} from 'lucide-react';
import {
  SiteProject,
  ProjectFile,
  ProjectBuild,
  ProjectDeployment,
  ProjectVersion,
  ProjectSearchMatch,
} from '../../../../types';
import { db } from '../../../../services/db';
import { ConsoleFileExplorer } from './ConsoleFileExplorer';
import { ConsoleCodeEditor } from './ConsoleCodeEditor';
import { ConsoleInspector } from './ConsoleInspector';
import { ConsoleBottomDrawer } from './ConsoleBottomDrawer';

interface SiteConsoleProps {
  siteId: string;
  onBack: () => void;
  initialTab?: string;
}

export const SiteConsole: React.FC<SiteConsoleProps> = ({
  siteId,
  onBack,
  initialTab = 'console',
}) => {
  const site = db.getSite(siteId);

  // Files & Tabs
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string>('');
  const [openTabs, setOpenTabs] = useState<string[]>([]);

  // Builds & Deployments
  const [builds, setBuilds] = useState<ProjectBuild[]>([]);
  const [deployments, setDeployments] = useState<ProjectDeployment[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);

  // Versions
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [newVersionMsg, setNewVersionMsg] = useState('');

  // Modals & Panels
  const [showGlobalSearchModal, setShowGlobalSearchModal] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [searchTypeFilter, setSearchTypeFilter] = useState('all');
  const [searchResults, setSearchResults] = useState<ProjectSearchMatch[]>([]);

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState(0);

  const [showEnvModal, setShowEnvModal] = useState(false);
  const [envVars, setEnvVars] = useState(db.getSiteEnvVars(siteId));
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvVal, setNewEnvVal] = useState('');

  // Bottom drawer
  const [isBottomDrawerOpen, setIsBottomDrawerOpen] = useState(false);
  const [bottomDrawerTab, setBottomDrawerTab] = useState<'terminal' | 'errors' | 'builds' | 'logs' | 'audit'>('terminal');

  // Inspector visibility
  const [showInspector, setShowInspector] = useState(true);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshAllData = () => {
    if (!siteId) return;
    const projectFiles = db.getSiteFiles(siteId);
    setFiles(projectFiles);

    if (projectFiles.length > 0 && !activeFilePath) {
      const defaultFile =
        projectFiles.find((f) => f.path === 'index.html' || f.path === 'src/App.tsx' || f.path === 'src/app/page.tsx') ||
        projectFiles[0];
      setActiveFilePath(defaultFile.path);
      setOpenTabs([defaultFile.path]);
    }

    setBuilds(db.getSiteBuilds(siteId));
    setDeployments(db.getSiteDeployments(siteId));
    setVersions(db.getSiteVersions(siteId));
    setEnvVars(db.getSiteEnvVars(siteId));
  };

  useEffect(() => {
    refreshAllData();
  }, [siteId]);

  // Global Keybindings (Cmd+P, Cmd+Shift+F, Cmd+`, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setShowGlobalSearchModal(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key === '`') {
        e.preventDefault();
        setIsBottomDrawerOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update Global Search results on query change
  useEffect(() => {
    if (globalSearchQuery.trim()) {
      const results = db.searchSiteCode(siteId, globalSearchQuery, searchTypeFilter);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [globalSearchQuery, searchTypeFilter, siteId]);

  if (!site) {
    return (
      <div className="bg-zinc-950 border border-white/10 rounded-2xl p-12 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-white">Site Console Not Found</h3>
        <p className="text-xs text-zinc-400">The requested site ID "{siteId}" was not found in the platform database.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 rounded-lg"
        >
          Back to Sites
        </button>
      </div>
    );
  }

  // Active File Object
  const activeFile = files.find((f) => f.path === activeFilePath) || null;

  // File Operations
  const handleSelectFile = (path: string) => {
    setActiveFilePath(path);
    if (!openTabs.includes(path)) {
      setOpenTabs((prev) => [...prev, path]);
    }
  };

  const handleCloseTab = (path: string) => {
    const nextTabs = openTabs.filter((t) => t !== path);
    setOpenTabs(nextTabs);
    if (activeFilePath === path) {
      if (nextTabs.length > 0) {
        setActiveFilePath(nextTabs[nextTabs.length - 1]);
      } else {
        setActiveFilePath('');
      }
    }
  };

  const handleSaveFile = (path: string, content: string) => {
    db.saveSiteFile(siteId, path, content);
    refreshAllData();
    showToast(`Saved ${path}`);
  };

  const handleNewFile = (path: string, content = '') => {
    const created = db.saveSiteFile(siteId, path, content || '// New file\n');
    refreshAllData();
    handleSelectFile(created.path);
    showToast(`Created file ${path}`);
  };

  const handleNewFolder = (folderPath: string) => {
    // Scaffold standard .gitkeep or index file inside folder
    const placeholder = `${folderPath}/index.ts`;
    db.saveSiteFile(siteId, placeholder, '// Module index\n');
    refreshAllData();
    handleSelectFile(placeholder);
    showToast(`Created folder /${folderPath}`);
  };

  const handleRenameFile = (oldPath: string, newPath: string) => {
    db.renameSiteFile(siteId, oldPath, newPath);
    refreshAllData();
    setOpenTabs((prev) => prev.map((t) => (t === oldPath ? newPath : t)));
    if (activeFilePath === oldPath) setActiveFilePath(newPath);
    showToast(`Renamed ${oldPath} → ${newPath}`);
  };

  const handleMoveFile = (oldPath: string, newPath: string) => {
    db.moveSiteFile(siteId, oldPath, newPath);
    refreshAllData();
    setOpenTabs((prev) => prev.map((t) => (t === oldPath ? newPath : t)));
    if (activeFilePath === oldPath) setActiveFilePath(newPath);
    showToast(`Moved ${oldPath} → ${newPath}`);
  };

  const handleCopyFile = (sourcePath: string, destPath: string) => {
    const copied = db.copySiteFile(siteId, sourcePath, destPath);
    refreshAllData();
    handleSelectFile(copied.path);
    showToast(`Duplicated file to ${destPath}`);
  };

  const handleDeleteFile = (path: string) => {
    if (confirm(`Permanently delete file "${path}" from project?`)) {
      db.deleteSiteFile(siteId, path);
      refreshAllData();
      handleCloseTab(path);
      showToast(`Deleted ${path}`);
    }
  };

  // Build Actions
  const handleTriggerBuild = async () => {
    setIsBuilding(true);
    try {
      await db.triggerSiteBuild(siteId, 'manual', 'Admin Site Console Production Build');
      refreshAllData();
      showToast('Production Build & Bundle Optimization Completed!');
    } catch (err: any) {
      alert(err?.message || 'Build compilation failed');
    } finally {
      setIsBuilding(false);
    }
  };

  // Version Actions
  const handleCreateVersionSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionMsg.trim()) return;
    db.createSiteVersion(siteId, newVersionMsg.trim());
    setNewVersionMsg('');
    setVersions(db.getSiteVersions(siteId));
    showToast('Created Snapshot Checkpoint');
    setShowVersionModal(false);
  };

  const handleRestoreVersion = (verId: string) => {
    if (confirm('Restore all files to this version snapshot? Unsaved changes will be replaced.')) {
      db.restoreSiteVersion(siteId, verId);
      refreshAllData();
      showToast('Project files restored to checkpoint');
      setShowVersionModal(false);
    }
  };

  // Env Var Actions
  const handleAddEnvVar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvKey.trim()) return;
    db.setSiteEnvVar(siteId, newEnvKey, newEnvVal);
    setNewEnvKey('');
    setNewEnvVal('');
    setEnvVars(db.getSiteEnvVars(siteId));
    showToast('Saved environment variable');
  };

  const handleDeleteEnvVar = (id: string) => {
    db.deleteSiteEnvVar(siteId, id);
    setEnvVars(db.getSiteEnvVars(siteId));
  };

  // Generate live preview HTML for iframe
  const previewHtmlContent = useMemo(() => {
    const indexHtml = files.find((f) => f.path === 'index.html');
    if (indexHtml) return indexHtml.content;

    const pageTsx = files.find((f) => f.path === 'src/app/page.tsx' || f.path === 'src/App.tsx');
    if (pageTsx) {
      return `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-black text-white p-8 font-sans"><h1 class="text-2xl font-bold mb-2">${site.name}</h1><p class="text-zinc-400 text-sm mb-4">React / Next.js Component Render</p><div class="p-4 bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-xs text-zinc-300"><pre>${pageTsx.content.replace(/</g, '&lt;')}</pre></div></body></html>`;
    }

    return `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-950 text-white flex flex-col items-center justify-center min-h-screen text-center p-6"><h1 class="text-3xl font-bold mb-2">${site.name}</h1><p class="text-zinc-400 text-xs">No index.html found.</p></body></html>`;
  }, [files, site.name]);

  const activeDeployment = deployments.find((d) => d.status === 'active') || deployments[0];

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* TOP HEADER: Project Control Center Bar */}
      <div className="bg-zinc-950 border border-white/10 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 backdrop-blur-md shadow-2xl">
        {/* Left: Project Identity & Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 rounded-xl transition cursor-pointer"
            title="Back to Sites List"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-lg text-white tracking-tight uppercase">
                {site.name}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 font-bold">
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
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-white/5">
                {versions[0]?.name || 'v1.0.0'}
              </span>
            </div>

            <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2 mt-0.5">
              <span>{site.id}</span>
              <span>•</span>
              <span className="text-rose-400">/{site.slug}</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Build: {builds[0]?.status ? builds[0].status.toUpperCase() : 'READY'}
              </span>
              <span>•</span>
              <span className="text-sky-400 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Deploy: {activeDeployment ? activeDeployment.status.toUpperCase() : 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Console Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowGlobalSearchModal(true)}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 rounded-xl text-xs font-mono flex items-center gap-1.5 transition"
            title="Global Code Search (Cmd+P)"
          >
            <Search className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="text-[10px] bg-black/60 px-1 rounded text-zinc-500">⌘P</kbd>
          </button>

          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Eye className="w-3.5 h-3.5 text-rose-400" />
            <span>Preview</span>
          </button>

          <button
            onClick={() => {
              setIsBottomDrawerOpen(true);
              setBottomDrawerTab('terminal');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition flex items-center gap-1.5 ${
              isBottomDrawerOpen && bottomDrawerTab === 'terminal'
                ? 'bg-sky-950 border-sky-600 text-white font-bold'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-white/10'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => {
              setIsBottomDrawerOpen(true);
              setBottomDrawerTab('errors');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition flex items-center gap-1.5 ${
              isBottomDrawerOpen && bottomDrawerTab === 'errors'
                ? 'bg-amber-950 border-amber-600 text-white font-bold'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-white/10'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Errors</span>
          </button>

          <button
            onClick={() => setShowVersionModal(true)}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 rounded-xl text-xs font-mono flex items-center gap-1.5 transition"
          >
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span>History</span>
          </button>

          <button
            onClick={() => setShowEnvModal(true)}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 rounded-xl text-xs font-mono flex items-center gap-1.5 transition"
            title="Environment Variables & Secrets"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Secrets</span>
          </button>

          <button
            onClick={handleTriggerBuild}
            disabled={isBuilding}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-rose-950 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Rocket className={`w-3.5 h-3.5 ${isBuilding ? 'animate-spin' : ''}`} />
            {isBuilding ? 'Compiling...' : 'Build & Deploy'}
          </button>
        </div>
      </div>

      {/* 3-COLUMN MASTER WORKSPACE: LEFT (Explorer) | CENTER (Editor) | RIGHT (Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-white/10 rounded-2xl overflow-hidden bg-zinc-950 shadow-2xl min-h-[620px] max-h-[calc(100vh-220px)]">
        {/* LEFT COLUMN: File Explorer (3 cols) */}
        <div className="lg:col-span-3 h-full overflow-hidden border-b lg:border-b-0">
          <ConsoleFileExplorer
            siteId={siteId}
            files={files}
            activeFilePath={activeFilePath}
            onSelectFile={handleSelectFile}
            onNewFile={handleNewFile}
            onNewFolder={handleNewFolder}
            onRenameFile={handleRenameFile}
            onMoveFile={handleMoveFile}
            onCopyFile={handleCopyFile}
            onDeleteFile={handleDeleteFile}
          />
        </div>

        {/* CENTER COLUMN: Code Editor (6 or 9 cols depending on inspector) */}
        <div className={`${showInspector ? 'lg:col-span-6' : 'lg:col-span-9'} h-full overflow-hidden border-b lg:border-b-0`}>
          <ConsoleCodeEditor
            siteId={siteId}
            files={files}
            activeFilePath={activeFilePath}
            openTabs={openTabs}
            onSelectFile={handleSelectFile}
            onCloseTab={handleCloseTab}
            onSaveFile={handleSaveFile}
            onOpenGlobalSearch={() => setShowGlobalSearchModal(true)}
            onOpenVersionHistory={() => setShowVersionModal(true)}
            onOpenEnvVars={() => setShowEnvModal(true)}
          />
        </div>

        {/* RIGHT COLUMN: Inspector & File Outline (3 cols) */}
        {showInspector && (
          <div className="lg:col-span-3 h-full overflow-hidden">
            <ConsoleInspector
              siteId={siteId}
              file={activeFile}
              onRename={(path) => {
                const newName = prompt('Enter new file path:', path);
                if (newName && newName !== path) handleRenameFile(path, newName);
              }}
              onMove={(path) => {
                const newDest = prompt('Enter target directory / path:', path);
                if (newDest && newDest !== path) handleMoveFile(path, newDest);
              }}
              onCopy={(path) => {
                const ext = path.split('.').pop() || '';
                const base = path.replace(`.${ext}`, '');
                handleCopyFile(path, `${base}_copy.${ext}`);
              }}
              onDelete={handleDeleteFile}
              onOpenVersions={() => setShowVersionModal(true)}
            />
          </div>
        )}
      </div>

      {/* BOTTOM DRAWER: Terminal / Error Center / Build Logs / Runtime Logs / Audit */}
      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <ConsoleBottomDrawer
          siteId={siteId}
          isOpen={isBottomDrawerOpen}
          onToggleOpen={() => setIsBottomDrawerOpen(!isBottomDrawerOpen)}
          initialTab={bottomDrawerTab}
          onTriggerBuild={handleTriggerBuild}
          isBuilding={isBuilding}
          builds={builds}
        />
      </div>

      {/* MODAL 1: GLOBAL CODE SEARCH (Cmd+P) */}
      {showGlobalSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Search Input Bar */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <Search className="w-5 h-5 text-rose-500" />
              <input
                type="text"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Search files, symbols, imports, routes, components, configuration..."
                autoFocus
                className="w-full bg-transparent text-white font-mono text-sm focus:outline-none placeholder-zinc-500"
              />
              <button
                onClick={() => setShowGlobalSearchModal(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type Filters */}
            <div className="px-4 py-2 bg-zinc-900/60 border-b border-white/5 flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
              <span className="text-zinc-500">Filter:</span>
              {['all', 'symbol', 'component', 'route', 'import', 'config'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSearchTypeFilter(t)}
                  className={`px-2 py-0.5 rounded capitalize transition ${
                    searchTypeFilter === t
                      ? 'bg-rose-950 border border-rose-600 text-white font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Search Results List */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1 font-mono text-xs custom-scrollbar">
              {globalSearchQuery && searchResults.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  No matching files or symbols found for "{globalSearchQuery}"
                </div>
              ) : (
                searchResults.map((match, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      handleSelectFile(match.file_path);
                      setShowGlobalSearchModal(false);
                    }}
                    className="p-2.5 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-white/5 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{match.file_path}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                          Ln {match.line_number}
                        </span>
                        <span className="text-[9px] px-1 rounded bg-rose-950 text-rose-300 uppercase font-bold">
                          {match.match_type}
                        </span>
                      </div>
                      <div className="text-zinc-400 text-[11px] mt-1 pl-2 border-l-2 border-rose-500/60 truncate max-w-lg">
                        {match.match_preview}
                      </div>
                    </div>

                    <ArrowLeft className="w-4 h-4 text-zinc-600 group-hover:text-white rotate-180 transition" />
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-zinc-950 border-t border-white/5 text-[11px] font-mono text-zinc-500 flex justify-between">
              <span>{searchResults.length} matches found</span>
              <span>Press ESC to close</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VERSION SNAPSHOT HISTORY */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold uppercase text-white font-mono">
                  Version History & Snapshots
                </h3>
              </div>
              <button
                onClick={() => setShowVersionModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Create Snapshot Form */}
            <form onSubmit={handleCreateVersionSnapshot} className="space-y-2">
              <label className="block text-xs font-mono text-zinc-400">
                Create New Immutable Checkpoint:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Snapshot message (e.g. Added responsive audio player)..."
                  value={newVersionMsg}
                  onChange={(e) => setNewVersionMsg(e.target.value)}
                  required
                  className="flex-1 px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>

            {/* Snapshots List */}
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {versions.map((ver) => (
                <div
                  key={ver.id}
                  className="p-3 bg-zinc-900 border border-white/5 rounded-xl flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{ver.name}</span>
                      <span className="text-[10px] text-zinc-500">
                        {ver.snapshot_file_count} files
                      </span>
                    </div>
                    <div className="text-zinc-400 text-[11px] mt-0.5">{ver.commit_message}</div>
                    <div className="text-[10px] text-zinc-600 mt-1">
                      {new Date(ver.created_at).toLocaleString()} by {ver.created_by}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestoreVersion(ver.id)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-lg text-xs font-semibold border border-amber-900/50 transition"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: LIVE PREVIEW VIEWER */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4">
          {/* Preview Controls Bar */}
          <div className="bg-zinc-950 border border-white/10 rounded-xl p-3 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold uppercase text-white font-mono">
                Live Preview Sandbox
              </span>
            </div>

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

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewKey((k) => k + 1)}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/5"
                title="Reload Preview"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Preview Canvas */}
          <div className="flex-1 flex items-center justify-center overflow-auto">
            <div
              className={`transition-all duration-300 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl bg-black ${
                previewDevice === 'desktop'
                  ? 'w-full h-full max-w-6xl'
                  : previewDevice === 'tablet'
                  ? 'w-[768px] h-[90%]'
                  : 'w-[375px] h-[90%]'
              }`}
            >
              <iframe
                key={previewKey}
                title={`Live Preview ${site.name}`}
                srcDoc={previewHtmlContent}
                sandbox="allow-scripts allow-same-origin allow-forms"
                className="w-full h-full border-0 bg-black"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ENVIRONMENT VARIABLES & SECRETS */}
      {showEnvModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold uppercase text-white font-mono">
                  Secure Configuration & Secrets
                </h3>
              </div>
              <button
                onClick={() => setShowEnvModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 font-mono">
              Protected secrets and environment keys are strictly isolated and never exposed in public client bundles.
            </p>

            <form onSubmit={handleAddEnvVar} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Key</label>
                <input
                  type="text"
                  placeholder="DATABASE_URL"
                  value={newEnvKey}
                  onChange={(e) => setNewEnvKey(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Secret Value</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={newEnvVal}
                  onChange={(e) => setNewEnvVal(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer h-9"
              >
                Save Secret
              </button>
            </form>

            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {envVars.map((env) => (
                <div
                  key={env.id}
                  className="p-2.5 bg-zinc-900 border border-white/5 rounded-xl flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <span className="text-amber-400 font-bold">{env.key}</span> ={' '}
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
        </div>
      )}
    </div>
  );
};
