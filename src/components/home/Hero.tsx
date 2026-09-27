import React from 'react';
import { Play, Disc3, ExternalLink } from 'lucide-react';
import { SiteSettings } from '../../types';

interface HeroProps {
  settings: SiteSettings;
  onListenNow: () => void;
  onWatchVideos: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onListenNow, onWatchVideos }) => {
  const configuredSocials = [
    { key: 'spotify', label: 'Spotify', url: settings.social_links.spotify },
    { key: 'youtube', label: 'YouTube', url: settings.social_links.youtube },
    { key: 'apple_music', label: 'Apple Music', url: settings.social_links.apple_music },
    { key: 'jiosaavn', label: 'JioSaavn', url: settings.social_links.jiosaavn },
    { key: 'instagram', label: 'Instagram', url: settings.social_links.instagram },
    { key: 'x', label: 'X', url: settings.social_links.x },
  ].filter((item) => Boolean(item.url));

  return (
    <section className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-[#070709] pt-24 pb-16">
      {/* Dark Luxury Atmospheric Lighting & Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] sm:h-[600px] bg-gradient-to-b from-rose-950/20 via-zinc-900/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-amber-700/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-rose-900/10 rounded-full blur-[100px]" />
        
        {/* Subtle grid mesh */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Cinematic vignette scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-[#070709]/60" />
      </div>

      {/* Admin uploaded hero background if present */}
      {settings.hero_image_url && (
        <div className="absolute inset-0 z-0 opacity-25 mix-blend-luminosity overflow-hidden">
          <img
            src={settings.hero_image_url}
            alt={settings.artist_name}
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/70 to-[#070709]/40" />
        </div>
      )}

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Official Website Kicker */}
        <div className="flex items-center justify-center mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400 font-semibold flex items-center justify-center gap-2">
            <span>Official Artist Website</span>
          </p>
        </div>

        {/* Artist Name Main Display Heading */}
        <h1 className="font-display font-extrabold text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white tracking-tighter uppercase mb-4 drop-shadow-2xl">
          {settings.hero_headline || settings.artist_name}
        </h1>

        {/* Subtitle / Role Tag */}
        <p className="text-sm sm:text-lg md:text-xl font-medium tracking-widest text-zinc-300 uppercase mb-8 max-w-2xl">
          {settings.hero_subheadline || settings.artist_title}
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-12 w-full sm:w-auto justify-center">
          <button
            onClick={onListenNow}
            className="w-full sm:w-auto px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold tracking-widest uppercase rounded-sm shadow-xl shadow-rose-950/40 hover:shadow-rose-900/60 transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
          >
            <Disc3 className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>Listen Now</span>
          </button>

          <button
            onClick={onWatchVideos}
            className="w-full sm:w-auto px-8 py-4 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs sm:text-sm font-bold tracking-widest uppercase rounded-sm border border-white/15 hover:border-white/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Play className="w-4 h-4 text-zinc-400 group-hover:text-white" />
            <span>Watch Videos</span>
          </button>
        </div>

        {/* Configured Platform Links */}
        {configuredSocials.length > 0 && (
          <div className="pt-4 border-t border-white/10 w-full max-w-xl">
            <p className="text-[11px] uppercase tracking-widest text-zinc-500 mb-3 font-medium">
              Available on Official Platforms
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
              {configuredSocials.map((platform) => (
                <a
                  key={platform.key}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-wider text-zinc-400 hover:text-rose-400 flex items-center gap-1 transition-colors py-1 px-2 hover:bg-white/5 rounded"
                >
                  <span>{platform.label}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Subtle bottom scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600">
        <div className="w-4 h-7 border border-zinc-700 rounded-full flex justify-center p-1">
          <div className="w-1 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};
