import React, { useState } from 'react';
import {
  Globe,
  Plus,
  ExternalLink,
  Code2,
  Rocket,
  Shield,
  Trash2,
  Search,
  Filter,
  Layers,
  FolderGit2,
  FileCode,
  Sparkles,
  Server,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileArchive,
  Terminal,
} from 'lucide-react';
import { SiteProject, SiteCategory, SiteEnvironment } from '../../../types';
import { db } from '../../../services/db';

interface SitesListProps {
  sites: SiteProject[];
  onOpenSite: (siteId: string, initialTab?: string) => void;
  onNewSite: () => void;
  onBrowseTemplates: () => void;
}

export const SitesList: React.FC<SitesListProps> = ({
  sites,
  onOpenSite,
  onNewSite,
  onBrowseTemplates,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [envFilter, setEnvFilter] = useState<string>('ALL');
  const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null);

  const filteredSites = sites.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || site.category === categoryFilter;
    const matchesEnv = envFilter === 'ALL' || site.environment === envFilter;
    return matchesSearch && matchesCategory && matchesEnv;
  });

  const handleDeleteSite = (siteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this site and all its project files? This action cannot be undone.')) {
      db.deleteSite(siteId);
      setDeletingSiteId(null);
    }
  };

  const categories: SiteCategory[] = [
    'Artist',
    'Music',
    'Record Label',
    'Portfolio',
    'Business',
    'Blog',
    'Landing Page',
    'E-Commerce',
    'Custom',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/80 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5 text-rose-500" />
            <h2 className="font-display font-black text-xl uppercase tracking-tight text-white">
              Sites & Project Builder
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-950 border border-rose-800/40 text-rose-300">
              {sites.length} Active Projects
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Multi-site management cockpit. Create blank Next.js/React applications, import ZIP archives or HTML files, manage code, trigger builds, and deploy to custom domains.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBrowseTemplates}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-200 rounded-lg cursor-pointer transition shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Templates
          </button>
          <button
            onClick={onNewSite}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-bold uppercase tracking-wider text-white rounded-lg cursor-pointer transition shadow-lg shadow-rose-950/50"
          >
            <Plus className="w-4 h-4" />
            New Site
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search projects by name, slug, or project ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-900/90 border border-white/10 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-rose-500 transition font-sans"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={envFilter}
            onChange={(e) => setEnvFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            <option value="ALL">All Environments</option>
            <option value="Production">Production</option>
            <option value="Staging">Staging</option>
            <option value="Development">Development</option>
          </select>
        </div>
      </div>

      {/* Projects Grid / Empty State */}
      {filteredSites.length === 0 ? (
        <div className="bg-zinc-950/60 border border-white/10 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-tight">
              {sites.length === 0 ? 'No Sites Created Yet' : 'No Sites Match Your Filter'}
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
              {sites.length === 0
                ? 'Create a blank website, unpack an existing ZIP project, or choose from our official production templates.'
                : 'Try adjusting your search criteria or resetting filters to see all managed projects.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onNewSite}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-xs font-bold uppercase tracking-wider text-white rounded-lg cursor-pointer transition shadow-md shadow-rose-950"
            >
              + Create First Site
            </button>
            <button
              onClick={onBrowseTemplates}
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-300 rounded-lg cursor-pointer transition"
            >
              Browse Templates
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSites.map((site) => {
            const isDeployed = site.status === 'deployed';
            const isBuilding = site.status === 'building';

            return (
              <div
                key={site.id}
                onClick={() => onOpenSite(site.id, 'overview')}
                className="group relative bg-zinc-950/80 hover:bg-zinc-900/90 border border-white/10 hover:border-rose-500/50 rounded-2xl p-5 transition-all duration-200 cursor-pointer shadow-lg flex flex-col justify-between"
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-rose-400 group-hover:scale-105 transition">
                        {site.source_type === 'zip_import' ? (
                          <FileArchive className="w-4 h-4 text-amber-400" />
                        ) : site.source_type === 'html_import' ? (
                          <FileCode className="w-4 h-4 text-sky-400" />
                        ) : (
                          <Globe className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white group-hover:text-rose-400 transition leading-tight">
                          {site.name}
                        </h4>
                        <div className="text-[11px] font-mono text-zinc-500">
                          {site.slug}
                        </div>
                      </div>
                    </div>

                    {/* Environment Pill */}
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        site.environment === 'Production'
                          ? 'bg-emerald-950/50 border-emerald-700/50 text-emerald-400'
                          : site.environment === 'Staging'
                          ? 'bg-amber-950/50 border-amber-700/50 text-amber-400'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                      }`}
                    >
                      {site.environment}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-400 line-clamp-2 mb-4 h-8">
                    {site.description || 'Production multi-site project instance.'}
                  </p>

                  {/* Badges & Meta */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-white/5 text-zinc-300">
                      {site.category}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-white/5 text-zinc-400">
                      {site.total_files_count} files ({(site.total_size_bytes / 1024).toFixed(1)} KB)
                    </span>
                    {site.custom_domain && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/40 border border-rose-800/30 text-rose-300 flex items-center gap-1">
                        <Globe className="w-2.5 h-2.5" />
                        {site.custom_domain}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isDeployed
                          ? 'bg-emerald-500 animate-pulse'
                          : isBuilding
                          ? 'bg-amber-500 animate-ping'
                          : 'bg-zinc-600'
                      }`}
                    />
                    <span className="text-[11px] font-mono text-zinc-400 capitalize">
                      {site.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onOpenSite(site.id, 'console')}
                      title="Open Site Console (Full IDE)"
                      className="px-2.5 py-1 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white font-mono text-[11px] font-bold flex items-center gap-1 shadow transition"
                    >
                      <Terminal className="w-3 h-3" />
                      <span>Console</span>
                    </button>
                    <button
                      onClick={() => onOpenSite(site.id, 'editor')}
                      title="Open Code Editor"
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenSite(site.id, 'preview')}
                      title="Live Preview"
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteSite(site.id, e)}
                      title="Delete Site"
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/50 text-zinc-500 hover:text-rose-400 border border-white/10 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
