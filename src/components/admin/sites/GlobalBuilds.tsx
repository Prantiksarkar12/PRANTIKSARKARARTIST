import React, { useState } from 'react';
import {
  Terminal,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Play,
  Layers,
  Search,
  Filter,
} from 'lucide-react';
import { ProjectBuild } from '../../../types';
import { db } from '../../../services/db';

interface GlobalBuildsProps {
  onOpenSite?: (siteId: string, tab?: string) => void;
}

export const GlobalBuilds: React.FC<GlobalBuildsProps> = ({ onOpenSite }) => {
  const builds = db.getAllBuilds();
  const [selectedBuild, setSelectedBuild] = useState<ProjectBuild | null>(builds[0] || null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBuilds = builds.filter(
    (b) =>
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.site_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.commit_message || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/80 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h2 className="font-display font-black text-xl uppercase tracking-tight text-white">
              Global Project Builds
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800/40 text-emerald-300">
              {builds.length} Recorded
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Real compilation pipelines, tree-shaking logs, execution traces, and artifact bundle generation status.
          </p>
        </div>
      </div>

      {builds.length === 0 ? (
        <div className="bg-zinc-950/60 border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <Terminal className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold uppercase text-white">No Builds Triggered Yet</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Open any project workspace and click "Trigger Production Build" to execute the compilation pipeline.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Builds Ledger List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search builds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-zinc-200 focus:outline-none"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredBuilds.map((build) => {
                const isSelected = selectedBuild?.id === build.id;
                const site = db.getSite(build.site_id);

                return (
                  <div
                    key={build.id}
                    onClick={() => setSelectedBuild(build)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 border-rose-500 shadow-md'
                        : 'bg-zinc-950/80 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-white">
                        {site?.name || build.site_id}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                          build.status === 'success'
                            ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-400'
                            : build.status === 'running'
                            ? 'bg-amber-950/60 border-amber-700/50 text-amber-400 animate-pulse'
                            : 'bg-rose-950/60 border-rose-700/50 text-rose-400'
                        }`}
                      >
                        {build.status}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-400 truncate mb-2">
                      {build.commit_message || 'Manual build'}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>{build.duration_seconds ? `${build.duration_seconds}s` : 'running...'}</span>
                      <span>{new Date(build.start_time).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Terminal Log Viewer */}
          <div className="lg:col-span-2 bg-zinc-950 border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            {selectedBuild ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white font-mono">{selectedBuild.id}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400">
                        Trigger: {selectedBuild.trigger}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      By {selectedBuild.triggered_by} • {new Date(selectedBuild.start_time).toLocaleString()}
                    </div>
                  </div>

                  {onOpenSite && (
                    <button
                      onClick={() => onOpenSite(selectedBuild.site_id, 'builds')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs rounded-lg border border-white/10 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Site Workspace
                    </button>
                  )}
                </div>

                {/* Console Log Terminal */}
                <div className="bg-[#050507] border border-zinc-800/80 rounded-xl p-4 font-mono text-xs text-zinc-300 space-y-1.5 max-h-[420px] overflow-y-auto">
                  <div className="text-zinc-600 mb-2">
                    # Compilation Execution Stream output for target ID {selectedBuild.id}
                  </div>
                  {selectedBuild.logs.map((log, i) => (
                    <div
                      key={i}
                      className={`leading-relaxed ${
                        log.includes('successfully')
                          ? 'text-emerald-400 font-semibold'
                          : log.includes('Initiating')
                          ? 'text-rose-400'
                          : 'text-zinc-300'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                  {selectedBuild.status === 'success' && (
                    <div className="pt-2 text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Process exited with code 0 (Bundle verified)</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-zinc-500 text-xs">
                Select a build from the list to view stdout logs.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
