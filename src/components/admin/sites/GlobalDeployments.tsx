import React, { useState } from 'react';
import {
  Rocket,
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Shield,
  Search,
  Lock,
} from 'lucide-react';
import { ProjectDeployment } from '../../../types';
import { db } from '../../../services/db';

interface GlobalDeploymentsProps {
  onOpenSite?: (siteId: string, tab?: string) => void;
}

export const GlobalDeployments: React.FC<GlobalDeploymentsProps> = ({ onOpenSite }) => {
  const deployments = db.getAllDeployments();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRollingBack, setIsRollingBack] = useState<string | null>(null);

  const filteredDeployments = deployments.filter(
    (d) =>
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.site_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRollback = (siteId: string, depId: string) => {
    if (confirm('Are you sure you want to rollback to this previous deployment?')) {
      setIsRollingBack(depId);
      db.rollbackSiteDeployment(siteId, depId);
      setTimeout(() => setIsRollingBack(null), 600);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/80 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Rocket className="w-5 h-5 text-rose-500" />
            <h2 className="font-display font-black text-xl uppercase tracking-tight text-white">
              Global Deployments
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-950 border border-rose-800/40 text-rose-300">
              {deployments.length} Active & Superseded
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Immutable production, staging, and preview deployments with automatic SSL certificates and 1-click rollback history.
          </p>
        </div>
      </div>

      {deployments.length === 0 ? (
        <div className="bg-zinc-950/60 border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <Rocket className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold uppercase text-white">No Deployments Yet</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Deployments are automatically created when a site build succeeds or when manually promoted.
          </p>
        </div>
      ) : (
        <div className="bg-zinc-950/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/10 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search deployments by URL or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-zinc-200 focus:outline-none"
              />
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {filteredDeployments.length} deployments listed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-zinc-900/50 font-mono text-[11px] text-zinc-400 uppercase">
                  <th className="py-3 px-4">Deployment</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Environment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SSL</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredDeployments.map((dep) => {
                  const site = db.getSite(dep.site_id);
                  const isActive = dep.status === 'active';

                  return (
                    <tr key={dep.id} className="hover:bg-zinc-900/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white font-mono">{dep.id}</div>
                        <a
                          href={dep.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-rose-400 hover:underline text-[11px] font-mono flex items-center gap-1 mt-0.5"
                        >
                          {dep.domain}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-zinc-200">{site?.name || dep.site_id}</div>
                        <div className="text-[10px] font-mono text-zinc-500">{site?.slug}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            dep.environment === 'Production'
                              ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-400'
                              : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                          }`}
                        >
                          {dep.environment}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            isActive
                              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                          }`}
                        >
                          {dep.status}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                          <Lock className="w-3 h-3 text-emerald-400" />
                          TLS 1.3 Active
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-400 text-[11px]">
                        {new Date(dep.created_at).toLocaleDateString()} {new Date(dep.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isActive && (
                            <button
                              onClick={() => handleRollback(dep.site_id, dep.id)}
                              disabled={isRollingBack === dep.id}
                              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                            >
                              <RotateCcw className="w-3 h-3 text-amber-400" />
                              Rollback
                            </button>
                          )}
                          {onOpenSite && (
                            <button
                              onClick={() => onOpenSite(dep.site_id, 'overview')}
                              className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                              title="Open Workspace"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
