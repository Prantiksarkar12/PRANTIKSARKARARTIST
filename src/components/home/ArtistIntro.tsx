import React from 'react';
import { ArrowRight, MapPin, Music2 } from 'lucide-react';
import { SiteSettings } from '../../types';

interface ArtistIntroProps {
  settings: SiteSettings;
  onOpenAbout: () => void;
}

export const ArtistIntro: React.FC<ArtistIntroProps> = ({ settings, onOpenAbout }) => {
  return (
    <section className="py-24 bg-[#09090c] border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Title */}
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs uppercase tracking-[0.25em] text-rose-500 font-bold">
              Artist • Rapper • Creator
            </p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight uppercase">
              {settings.artist_name}
            </h2>
            
            {/* Metadata in clean unboxed text */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                <span>{settings.based_in}</span>
              </span>
              {settings.genres.length > 0 && (
                <>
                  <span aria-hidden="true" className="text-zinc-600">·</span>
                  <span className="flex items-center gap-1">
                    <Music2 className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{settings.genres.join(' / ')}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Dynamic CMS Bio & CTA */}
          <div className="lg:col-span-7 space-y-6 lg:border-l lg:border-white/10 lg:pl-10">
            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-light">
              {settings.bio || 'A modern artist platform for music, videos, releases, creative work, events, press and official updates.'}
            </p>

            <div>
              <button
                onClick={onOpenAbout}
                className="inline-flex items-center gap-3 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 text-xs sm:text-sm font-semibold tracking-wider uppercase text-white rounded-sm transition-all cursor-pointer group"
              >
                <span>About The Artist</span>
                <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
