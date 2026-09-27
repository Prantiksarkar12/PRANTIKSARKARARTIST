import React, { useState, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  ShieldCheck,
  Globe,
  Radio,
  SlidersHorizontal,
  X,
  Music2,
  CheckCircle2,
  Headphones,
  Sparkles,
} from 'lucide-react';
import { MusicPlatform, PlatformCategory, PlatformRegion } from '../../types';

interface ListenEverywhereProps {
  platforms: MusicPlatform[];
  allPlatforms?: MusicPlatform[];
  onNavigateToAdmin?: () => void;
  isAdmin?: boolean;
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'All Categories', value: 'ALL' },
  { label: 'Major Streaming', value: 'Major streaming' },
  { label: 'India / South Asia', value: 'India / South Asia' },
  { label: 'Asia', value: 'Asia' },
  { label: 'Europe', value: 'Europe' },
  { label: 'Latin America', value: 'Latin America' },
  { label: 'Africa', value: 'Africa' },
  { label: 'Classical & Specialist', value: 'Classical / specialist' },
  { label: 'DJ & Electronic', value: 'DJ / electronic' },
  { label: 'Independent & Creators', value: 'Independent / creator platforms' },
  { label: 'Radio & Discovery', value: 'Radio / discovery' },
];

const REGIONS: { label: string; value: string }[] = [
  { label: 'All Regions', value: 'ALL' },
  { label: 'Global', value: 'Global' },
  { label: 'India / South Asia', value: 'India / South Asia' },
  { label: 'Asia', value: 'Asia' },
  { label: 'Europe', value: 'Europe' },
  { label: 'Latin America', value: 'Latin America' },
  { label: 'Africa', value: 'Africa' },
  { label: 'North America', value: 'North America' },
];

const FEATURED_NAMES = [
  'Spotify',
  'Apple Music',
  'YouTube Music',
  'Amazon Music',
  'JioSaavn',
  'TIDAL',
  'Deezer',
  'SoundCloud',
];

export const ListenEverywhere: React.FC<ListenEverywhereProps> = ({
  platforms,
  allPlatforms = [],
  onNavigateToAdmin,
  isAdmin = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [showAllDirectory, setShowAllDirectory] = useState<boolean>(false);

  // Determine active dataset
  // By default, only Active + Verified platforms with real profile URLs are displayed.
  // Users can toggle "Show full 150+ platform directory" to see global delivery coverage.
  const sourceList = showAllDirectory && allPlatforms.length > 0 ? allPlatforms : platforms;

  // Filter logic
  const filtered = useMemo(() => {
    return sourceList.filter((p) => {
      // Must be active unless directory mode is on
      if (!showAllDirectory && (!p.is_active || !p.is_verified || !p.artist_profile_url?.trim())) {
        return false;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.platform_name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesReg = selectedRegion === 'ALL' || p.region === selectedRegion;

      return matchesSearch && matchesCat && matchesReg;
    });
  }, [sourceList, showAllDirectory, searchQuery, selectedCategory, selectedRegion]);

  // Featured platforms that are verified
  const featuredPlatforms = useMemo(() => {
    return platforms
      .filter((p) => p.is_active && p.is_verified && Boolean(p.artist_profile_url?.trim()))
      .filter((p) => FEATURED_NAMES.some((name) => p.platform_name.toLowerCase().includes(name.toLowerCase())))
      .sort((a, b) => {
        const idxA = FEATURED_NAMES.findIndex((n) => a.platform_name.toLowerCase().includes(n.toLowerCase()));
        const idxB = FEATURED_NAMES.findIndex((n) => b.platform_name.toLowerCase().includes(n.toLowerCase()));
        return (idxA >= 0 ? idxA : 99) - (idxB >= 0 ? idxB : 99);
      });
  }, [platforms]);

  // Group by first letter (A-Z)
  const groupedByLetter = useMemo(() => {
    const map = new Map<string, MusicPlatform[]>();
    // Sort alphabetically by platform name
    const sorted = [...filtered].sort((a, b) => a.platform_name.localeCompare(b.platform_name));

    sorted.forEach((item) => {
      const letter = item.platform_name.charAt(0).toUpperCase();
      const key = /[A-Z]/.test(letter) ? letter : '#';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(item);
    });

    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="space-y-12">
      {/* Top Hero / Intro Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs font-mono font-semibold uppercase tracking-widest">
          <Headphones className="w-3.5 h-3.5" />
          <span>Global Music Streaming Directory</span>
        </div>

        <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-white uppercase tracking-tight">
          Listen Everywhere
        </h1>

        <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto font-light leading-relaxed">
          <strong className="text-white font-semibold">Prantik Sarkar Artist</strong> is available across
          major streaming, music discovery, and digital music platforms worldwide.
        </p>

        {isAdmin && onNavigateToAdmin && (
          <div className="pt-2">
            <button
              onClick={onNavigateToAdmin}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
            >
              ✦ Admin: Manage 150+ Platforms
            </button>
          </div>
        )}
      </div>

      {/* FEATURED QUICK BAR */}
      {featuredPlatforms.length > 0 && !searchQuery && (
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Featured Streaming Destinations</span>
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">Instant Verified Access</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {featuredPlatforms.slice(0, 8).map((plat) => (
              <a
                key={plat.id}
                href={plat.artist_profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3.5 rounded-xl bg-gradient-to-b from-[#14141d] to-[#0c0c12] border border-white/10 hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-950/20 transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="truncate pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white group-hover:text-rose-400 transition-colors text-sm truncate">
                      {plat.platform_name}
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono block truncate">
                    {plat.category}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-rose-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH AND FILTER CONSOLE */}
      <div className="max-w-5xl mx-auto bg-[#0c0c12] border border-white/10 rounded-2xl p-5 sm:p-7 space-y-5 shadow-2xl">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search platform (e.g., Spotify, Apple, JioSaavn, Beatport, KKBOX, Bandcamp)..."
            className="w-full pl-11 pr-10 py-3 bg-zinc-900/90 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block font-bold">
            Filter by Category:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.value
                    ? 'bg-rose-600 text-white font-bold shadow'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Region Filter Pills & Directory Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 shrink-0 font-bold">
              Region:
            </span>
            {REGIONS.map((reg) => (
              <button
                key={reg.value}
                onClick={() => setSelectedRegion(reg.value)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedRegion === reg.value
                    ? 'bg-white/20 text-white font-semibold'
                    : 'bg-transparent text-zinc-400 hover:text-white'
                }`}
              >
                {reg.label}
              </button>
            ))}
          </div>

          {/* Directory toggle */}
          {allPlatforms.length > 0 && (
            <label className="flex items-center gap-2 cursor-pointer select-none shrink-0 text-zinc-400 hover:text-zinc-200">
              <input
                type="checkbox"
                checked={showAllDirectory}
                onChange={(e) => setShowAllDirectory(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <span className="text-[11px] font-mono">Show all 150+ in registry</span>
            </label>
          )}
        </div>
      </div>

      {/* A-Z ALPHABETICAL INDEXED DIRECTORY */}
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight flex items-center gap-2">
            <span>All Platforms</span>
            <span className="text-sm font-mono text-zinc-500 font-normal">
              ({filtered.length} {filtered.length === 1 ? 'result' : 'results'})
            </span>
          </h2>

          {/* A-Z Jump Bar */}
          <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono font-bold text-zinc-500">
            {groupedByLetter.map(([letter]) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="hover:text-rose-400 px-1 py-0.5 transition-colors"
              >
                {letter}
              </a>
            ))}
          </div>
        </div>

        {groupedByLetter.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-[#0a0a0e] rounded-2xl border border-white/5">
            <Radio className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-sm text-zinc-400 font-medium">No platforms found matching your filter criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSelectedRegion('ALL');
              }}
              className="text-xs text-rose-400 hover:underline font-mono"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedByLetter.map(([letter, items]) => (
              <div key={letter} id={`letter-${letter}`} className="space-y-3 scroll-mt-28">
                {/* Letter Header */}
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/30 text-rose-400 font-display font-black text-base flex items-center justify-center">
                    {letter}
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                {/* Platforms Grid for this Letter */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((plat) => {
                    const hasRealUrl = Boolean(plat.artist_profile_url && plat.artist_profile_url.trim());
                    const isVerified = plat.is_verified && hasRealUrl;

                    return (
                      <div
                        key={plat.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isVerified
                            ? 'bg-zinc-950/90 border-white/10 hover:border-rose-500/40 hover:bg-zinc-900/90 shadow-md'
                            : 'bg-zinc-950/40 border-white/5 opacity-70'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-display font-bold text-white text-base uppercase tracking-tight">
                                {plat.platform_name}
                              </h3>
                              {isVerified ? (
                                <span title="Verified Artist Destination">
                                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded">
                                  Registry
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono block">
                              {plat.category} · {plat.region}
                            </span>
                          </div>
                        </div>

                        {plat.description && (
                          <p className="text-[11px] text-zinc-400 line-clamp-2 mb-3 font-light">
                            {plat.description}
                          </p>
                        )}

                        {/* Profile CTA */}
                        {hasRealUrl ? (
                          <a
                            href={plat.artist_profile_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-colors w-full justify-center shadow"
                          >
                            <span>Open Artist Profile</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <div className="text-[10px] font-mono text-zinc-500 italic py-1 text-center bg-white/5 rounded">
                            Artist profile link pending configuration
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
