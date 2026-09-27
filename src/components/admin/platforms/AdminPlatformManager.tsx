import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Headphones,
  SlidersHorizontal,
  X,
  Radio,
  Filter,
} from 'lucide-react';
import { MusicPlatform, PlatformCategory, PlatformRegion } from '../../../types';
import { db } from '../../../services/db';

interface AdminPlatformManagerProps {
  platforms: MusicPlatform[];
}

const CATEGORIES: PlatformCategory[] = [
  'Major streaming',
  'India / South Asia',
  'Asia',
  'Africa',
  'Latin America',
  'Europe',
  'Classical / specialist',
  'DJ / electronic',
  'Independent / creator platforms',
  'Radio / discovery',
];

const REGIONS: PlatformRegion[] = [
  'Global',
  'India / South Asia',
  'Asia',
  'Africa',
  'Latin America',
  'Europe',
  'North America',
  'Worldwide',
];

export const AdminPlatformManager: React.FC<AdminPlatformManagerProps> = ({ platforms }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE_VERIFIED' | 'VERIFIED' | 'UNVERIFIED' | 'HIDDEN'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<MusicPlatform | null>(null);
  const [formData, setFormData] = useState<{
    id?: string;
    platform_name: string;
    category: PlatformCategory;
    region: PlatformRegion;
    artist_name: string;
    artist_profile_url: string;
    logo_url: string;
    description: string;
    display_order: number;
    is_verified: boolean;
    is_active: boolean;
  }>({
    platform_name: '',
    category: 'Major streaming',
    region: 'Global',
    artist_name: 'Prantik Sarkar',
    artist_profile_url: '',
    logo_url: '',
    description: '',
    display_order: 1,
    is_verified: false,
    is_active: true,
  });

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingPlatform(null);
    setFormData({
      platform_name: '',
      category: 'Major streaming',
      region: 'Global',
      artist_name: 'Prantik Sarkar',
      artist_profile_url: '',
      logo_url: '',
      description: '',
      display_order: platforms.length + 1,
      is_verified: false,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: MusicPlatform) => {
    setEditingPlatform(p);
    setFormData({
      id: p.id,
      platform_name: p.platform_name,
      category: p.category,
      region: p.region,
      artist_name: p.artist_name || 'Prantik Sarkar',
      artist_profile_url: p.artist_profile_url || '',
      logo_url: p.logo_url || '',
      description: p.description || '',
      display_order: p.display_order ?? 1,
      is_verified: p.is_verified,
      is_active: p.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.platform_name.trim()) return;

    db.saveMusicPlatform(formData);
    setIsModalOpen(false);
    showNotification(
      editingPlatform
        ? `Updated "${formData.platform_name}" successfully.`
        : `Added new platform "${formData.platform_name}".`
    );
  };

  const handleToggleVerify = (id: string, name: string) => {
    const res = db.togglePlatformVerification(id);
    if (res) {
      showNotification(`${res.is_verified ? 'Verified' : 'Unverified'} ${name}`);
    }
  };

  const handleToggleActive = (id: string, name: string) => {
    const res = db.togglePlatformActive(id);
    if (res) {
      showNotification(`${res.is_active ? 'Activated' : 'Hid'} ${name}`);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the platform database?`)) {
      db.deleteMusicPlatform(id);
      showNotification(`Deleted platform "${name}".`);
    }
  };

  // Filtered platforms
  const filteredPlatforms = platforms.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.platform_name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.region.toLowerCase().includes(q) ||
      (p.artist_profile_url && p.artist_profile_url.toLowerCase().includes(q));

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesRegion = selectedRegion === 'ALL' || p.region === selectedRegion;

    let matchesStatus = true;
    if (statusFilter === 'ACTIVE_VERIFIED') {
      matchesStatus = p.is_active && p.is_verified && Boolean(p.artist_profile_url.trim());
    } else if (statusFilter === 'VERIFIED') {
      matchesStatus = p.is_verified;
    } else if (statusFilter === 'UNVERIFIED') {
      matchesStatus = !p.is_verified;
    } else if (statusFilter === 'HIDDEN') {
      matchesStatus = !p.is_active;
    }

    return matchesSearch && matchesCategory && matchesRegion && matchesStatus;
  });

  const activeVerifiedCount = platforms.filter((p) => p.is_active && p.is_verified && p.artist_profile_url.trim()).length;
  const unverifiedCount = platforms.filter((p) => !p.is_verified || !p.artist_profile_url.trim()).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 rounded-lg bg-zinc-900 border border-rose-500/50 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in slide-in-from-top-2">
          {notification}
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-[#0b0b0f] border border-white/10 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-widest mb-1 font-mono">
            <Radio className="w-4 h-4" />
            <span>Official Streaming Distribution & Catalog</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight">
            Platform Manager
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl font-light">
            Manage 150+ music streaming platforms, digital stores, DJ pools, and regional networks.
            Only platforms marked <strong className="text-emerald-400 font-semibold">Active + Verified</strong> with real artist URLs appear on the public website.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-lg shrink-0 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Platform</span>
        </button>
      </div>

      {/* Stat Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">Total in Registry</span>
          <span className="text-2xl font-extrabold text-white font-display">{platforms.length}</span>
          <span className="text-[10px] text-zinc-500 block">150+ catalogued</span>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-emerald-500/20">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block font-mono">Live on Website</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-display">{activeVerifiedCount}</span>
          <span className="text-[10px] text-zinc-500 block">Active + Verified</span>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-amber-500/20">
          <span className="text-[10px] uppercase font-bold text-amber-400 block font-mono">Pending URL / Unverified</span>
          <span className="text-2xl font-extrabold text-amber-400 font-display">{unverifiedCount}</span>
          <span className="text-[10px] text-zinc-500 block">Awaiting URL link</span>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">Categories</span>
          <span className="text-2xl font-extrabold text-zinc-200 font-display">{CATEGORIES.length}</span>
          <span className="text-[10px] text-zinc-500 block">Streaming, Asia, DJ, Radio</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by platform name, category, region, or URL..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-white/10 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              All ({platforms.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE_VERIFIED')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                statusFilter === 'ACTIVE_VERIFIED'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800'
              }`}
            >
              Live ({activeVerifiedCount})
            </button>
            <button
              onClick={() => setStatusFilter('UNVERIFIED')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                statusFilter === 'UNVERIFIED'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800'
              }`}
            >
              Unverified ({unverifiedCount})
            </button>
            <button
              onClick={() => setStatusFilter('HIDDEN')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                statusFilter === 'HIDDEN'
                  ? 'bg-zinc-700 text-white font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Hidden
            </button>
          </div>
        </div>

        {/* Category & Region dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-mono text-[11px] uppercase">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-mono text-[11px] uppercase">Region:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Regions</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <span className="text-zinc-500 ml-auto font-mono text-[11px]">
            Showing {filteredPlatforms.length} of {platforms.length} platforms
          </span>
        </div>
      </div>

      {/* Platforms Table */}
      <div className="rounded-xl bg-zinc-950 border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#121218] border-b border-white/10 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Platform Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Artist / Profile URL</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Verified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPlatforms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    No platforms match your search or filter.
                  </td>
                </tr>
              ) : (
                filteredPlatforms.map((plat) => {
                  const hasUrl = Boolean(plat.artist_profile_url && plat.artist_profile_url.trim());
                  const isLive = plat.is_active && plat.is_verified && hasUrl;

                  return (
                    <tr
                      key={plat.id}
                      className={`hover:bg-zinc-900/50 transition-colors ${
                        !plat.is_active ? 'opacity-60' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-zinc-500 text-[11px]">
                        {plat.display_order ?? '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{plat.platform_name}</span>
                          {isLive && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                              LIVE
                            </span>
                          )}
                        </div>
                        {plat.description && (
                          <p className="text-[11px] text-zinc-500 line-clamp-1 max-w-xs">
                            {plat.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-zinc-300 border border-white/10 font-medium">
                          {plat.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                          <Globe className="w-3 h-3 text-zinc-500" />
                          {plat.region}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate">
                        {hasUrl ? (
                          <a
                            href={plat.artist_profile_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 truncate font-mono text-[11px]"
                          >
                            <span className="truncate">{plat.artist_profile_url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-zinc-600 font-mono text-[11px] italic">
                            No profile link set
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(plat.id, plat.platform_name)}
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                            plat.is_active
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60'
                              : 'bg-zinc-800 text-zinc-400 border border-white/10 hover:bg-zinc-700'
                          }`}
                          title="Click to toggle Active/Hidden"
                        >
                          {plat.is_active ? 'Active' : 'Hidden'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleVerify(plat.id, plat.platform_name)}
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase cursor-pointer transition-colors flex items-center gap-1 mx-auto ${
                            plat.is_verified
                              ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30 hover:bg-rose-900/60'
                              : 'bg-zinc-800 text-zinc-500 border border-white/10 hover:bg-zinc-700'
                          }`}
                          title="Click to toggle Verified"
                        >
                          {plat.is_verified ? (
                            <>
                              <ShieldCheck className="w-3 h-3 text-rose-400" />
                              <span>Verified</span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3 h-3 text-zinc-500" />
                              <span>Unverified</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(plat)}
                            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Edit Platform"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(plat.id, plat.platform_name)}
                            className="p-1.5 rounded text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete Platform"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Platform Modal */}
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
                Platform Manager
              </span>
              <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">
                {editingPlatform ? `Edit ${editingPlatform.platform_name}` : 'Add New Platform'}
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                  Platform Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.platform_name}
                  onChange={(e) => setFormData({ ...formData, platform_name: e.target.value })}
                  placeholder="Example: Spotify, Apple Music, Beatport"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                    Platform Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as PlatformCategory })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                    Platform Region *
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value as PlatformRegion })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
                  >
                    {REGIONS.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                  Artist / Profile URL *
                </label>
                <input
                  type="url"
                  value={formData.artist_profile_url}
                  onChange={(e) => setFormData({ ...formData, artist_profile_url: e.target.value })}
                  placeholder="https://open.spotify.com/artist/..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white font-mono text-[11px] focus:outline-none focus:border-rose-500"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Do not invent fake links. If unavailable, leave empty and uncheck Verified.
                </span>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                  Platform Logo / Icon URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white font-mono text-[11px] focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                  Platform Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional brief notes or catalog details..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white font-mono"
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
                        name="is_active"
                        checked={formData.is_active}
                        onChange={() => setFormData({ ...formData, is_active: true })}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Active</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="is_active"
                        checked={!formData.is_active}
                        onChange={() => setFormData({ ...formData, is_active: false })}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Hidden</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Verified Toggle */}
              <div className="p-3 rounded-lg bg-zinc-900/80 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block text-xs">Verified URL</span>
                  <span className="text-[10px] text-zinc-400">
                    Only platforms marked Active + Verified appear publicly on the website.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_verified}
                  onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider cursor-pointer shadow-lg transition-colors"
                >
                  Save Platform
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
