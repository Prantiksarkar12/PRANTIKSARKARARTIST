import React from 'react';
import { ExternalLink, Radio, ShieldCheck, ArrowRight } from 'lucide-react';
import { SiteSettings, MusicPlatform } from '../../types';

interface OfficialProfilesProps {
  settings: SiteSettings;
  musicPlatforms?: MusicPlatform[];
  onExploreAll?: () => void;
}

export const OfficialProfiles: React.FC<OfficialProfilesProps> = ({
  settings,
  musicPlatforms = [],
  onExploreAll,
}) => {
  // Use verified music platforms if available, otherwise fallback to social_links
  const verifiedPlatforms = musicPlatforms
    .filter((p) => p.is_active && p.is_verified && Boolean(p.artist_profile_url?.trim()))
    .slice(0, 6);

  const displayList = verifiedPlatforms.length > 0
    ? verifiedPlatforms.map((p) => ({
        name: p.platform_name,
        key: p.id,
        url: p.artist_profile_url,
        desc: p.description || `${p.category} · ${p.region}`,
      }))
    : [
        { name: 'Spotify', key: 'spotify', url: settings.social_links.spotify, desc: 'Stream albums & singles' },
        { name: 'YouTube', key: 'youtube', url: settings.social_links.youtube, desc: 'Official music videos' },
        { name: 'Apple Music', key: 'apple_music', url: settings.social_links.apple_music, desc: 'Lossless audio' },
        { name: 'JioSaavn', key: 'jiosaavn', url: settings.social_links.jiosaavn, desc: 'Regional catalog' },
        { name: 'Amazon Music', key: 'amazon', url: 'https://music.amazon.com/artists/prantik-sarkar', desc: 'Unlimited & Prime streaming' },
        { name: 'TIDAL', key: 'tidal', url: 'https://tidal.com/artist/prantik-sarkar', desc: 'HiFi Master streaming' },
      ].filter((p) => Boolean(p.url));

  if (displayList.length === 0) return null;

  return (
    <section className="py-20 bg-[#070709] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-rose-500 text-xs font-mono font-bold uppercase tracking-widest mb-2">
              <Radio className="w-3.5 h-3.5" />
              <span>Listen Everywhere · 150+ Services</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight uppercase">
              Official Music Profiles
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-light">
              Connect directly across verified global and regional music platforms.
            </p>
          </div>

          {onExploreAll && (
            <button
              onClick={onExploreAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
            >
              <span>Explore All 150+ Platforms</span>
              <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {displayList.map((p) => (
            <a
              key={p.key}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0e0e13] border border-white/10 hover:border-rose-500/50 hover:bg-[#12121a] rounded-xl p-4 flex flex-col justify-between space-y-3 group transition-all duration-200 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-display font-bold text-sm text-white uppercase group-hover:text-rose-400 transition-colors truncate">
                    {p.name}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-rose-400 transition-colors shrink-0" />
              </div>

              <p className="text-[11px] text-zinc-400 group-hover:text-zinc-300 transition-colors font-light line-clamp-2 leading-relaxed">
                {p.desc}
              </p>

              <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 group-hover:text-rose-300 font-bold">
                Open Profile ↗
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
