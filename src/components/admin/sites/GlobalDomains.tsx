import React, { useState } from 'react';
import {
  Globe,
  Plus,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Trash2,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { ProjectDomain } from '../../../types';
import { db } from '../../../services/db';

interface GlobalDomainsProps {
  onOpenSite?: (siteId: string, tab?: string) => void;
}

export const GlobalDomains: React.FC<GlobalDomainsProps> = ({ onOpenSite }) => {
  const sites = db.getSites();
  const domains = db.getAllDomains();

  const [newDomainName, setNewDomainName] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || '');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainName.trim() || !selectedSiteId) return;

    db.addSiteDomain(selectedSiteId, newDomainName.trim());
    setNewDomainName('');
  };

  const handleVerify = (siteId: string, domainId: string) => {
    setIsVerifying(domainId);
    setTimeout(() => {
      db.verifySiteDomain(siteId, domainId);
      setIsVerifying(null);
    }, 600);
  };

  const handleDelete = (siteId: string, domainId: string) => {
    if (confirm('Are you sure you want to disconnect this custom domain?')) {
      db.deleteSiteDomain(siteId, domainId);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/80 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5 text-sky-400" />
            <h2 className="font-display font-black text-xl uppercase tracking-tight text-white">
              Custom Domains & DNS Manager
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-950 border border-sky-800/40 text-sky-300">
              {domains.length} Registered
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Map apex and subdomains to any project with automatic Let's Encrypt SSL/TLS provisioning and DNS record verification.
          </p>
        </div>
      </div>

      {/* Add Domain Form */}
      {sites.length > 0 && (
        <form
          onSubmit={handleAddDomain}
          className="bg-zinc-950/80 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Connect New Custom Domain
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                Target Project
              </label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.slug})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  Domain Name (Apex or Subdomain)
                </label>
                <input
                  type="text"
                  placeholder="e.g. music.prantiksarkar.com or prantiklive.com"
                  value={newDomainName}
                  onChange={(e) => setNewDomainName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition shrink-0 cursor-pointer h-9"
              >
                Add Domain
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Domains List */}
      {domains.length === 0 ? (
        <div className="bg-zinc-950/60 border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <Globe className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold uppercase text-white">No Custom Domains Connected</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Add a domain above to configure DNS records and enable custom branded URLs.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {domains.map((dom) => {
            const site = db.getSite(dom.site_id);

            return (
              <div
                key={dom.id}
                className="bg-zinc-950/80 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-sky-400" />
                      <h4 className="font-bold text-sm text-white font-mono">{dom.domain_name}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        SSL Active
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Assigned to: <span className="text-white font-semibold">{site?.name || dom.site_id}</span> ({site?.slug})
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerify(dom.site_id, dom.id)}
                      disabled={isVerifying === dom.id}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-200 border border-white/10 rounded-lg flex items-center gap-1 transition"
                    >
                      <RefreshCw className={`w-3 h-3 ${isVerifying === dom.id ? 'animate-spin' : ''}`} />
                      Check DNS
                    </button>
                    <button
                      onClick={() => handleDelete(dom.site_id, dom.id)}
                      className="p-1.5 bg-zinc-900 hover:bg-rose-950/50 text-zinc-500 hover:text-rose-400 border border-white/10 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* DNS Records Configuration Table */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 font-mono">
                    Required DNS Records (Configure at your Domain Registrar)
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-zinc-900/40">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead>
                        <tr className="border-b border-white/5 bg-zinc-950 text-zinc-500 text-[10px] uppercase">
                          <th className="py-2.5 px-4">Type</th>
                          <th className="py-2.5 px-4">Name / Host</th>
                          <th className="py-2.5 px-4">Target Value</th>
                          <th className="py-2.5 px-4">Status</th>
                          <th className="py-2.5 px-4 text-right">Copy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {dom.dns_records.map((rec, i) => (
                          <tr key={i} className="hover:bg-zinc-900/60 transition">
                            <td className="py-2.5 px-4 font-bold text-rose-400">{rec.type}</td>
                            <td className="py-2.5 px-4 text-white">{rec.host}</td>
                            <td className="py-2.5 px-4 text-zinc-300 font-mono select-all">
                              {rec.value}
                            </td>
                            <td className="py-2.5 px-4">
                              <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Valid
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <button
                                onClick={() => copyToClipboard(rec.value)}
                                className="p-1 hover:text-white text-zinc-500 transition"
                                title="Copy Value"
                              >
                                {copiedText === rec.value ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
