import React from 'react';
import { MapPin, Disc, Mic2, Sparkles, ArrowRight } from 'lucide-react';
import { SiteSettings } from '../../types';

interface EditorialProfileProps {
  settings: SiteSettings;
  onOpenFullBio: () => void;
  onOpenContact: () => void;
}

export const EditorialProfile: React.FC<EditorialProfileProps> = ({
  settings,
  onOpenFullBio,
  onOpenContact,
}) => {
  return (
    <section className="py-24 bg-[#09090c] border-t border-white/5 relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-rose-950/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Visual Profile Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-gradient-to-b from-[#14141a] to-[#0a0a0d] border border-white/10 rounded-xl p-8 sm:p-10 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.25em] text-rose-500 font-bold">
                  Editorial Profile
                </p>
                <h3 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight uppercase">
                  {settings.artist_name}
                </h3>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                  {settings.artist_title}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3 text-xs text-zinc-300">
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-500 uppercase tracking-wider font-mono">Location</span>
                  <span className="font-medium text-white flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {settings.based_in}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-500 uppercase tracking-wider font-mono">Primary Genres</span>
                  <span className="font-medium text-white">
                    {settings.genres.join(', ')}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-500 uppercase tracking-wider font-mono">Label / Imprint</span>
                  <span className="font-medium text-white">
                    {settings.record_label || 'Independent'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-zinc-500 uppercase tracking-wider font-mono">Discipline</span>
                  <span className="font-medium text-white">
                    Vocalist • Producer • Creative Director
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenContact}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-xs font-bold uppercase tracking-widest text-zinc-200 hover:text-white rounded transition-colors cursor-pointer"
                >
                  Direct Artist Inquiries
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative Biography & Philosophy */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.25em] text-amber-500 font-bold">
                Artistic Philosophy & Evolution
              </p>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight uppercase leading-tight">
                Authenticity In Every Rhyme & Frequency
              </h2>
            </div>

            <div className="space-y-4 text-zinc-300 text-sm sm:text-base leading-relaxed font-light">
              <p>
                {settings.extended_bio || settings.bio}
              </p>
            </div>

            {/* Creative Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 bg-zinc-950/80 border border-white/10 rounded-lg space-y-2">
                <Mic2 className="w-5 h-5 text-rose-500" />
                <h4 className="font-display font-bold text-sm text-white uppercase">Lyrical Craft</h4>
                <p className="text-xs text-zinc-400 font-light">
                  Complex rhymes and raw social commentary grounded in personal truth.
                </p>
              </div>

              <div className="p-4 bg-zinc-950/80 border border-white/10 rounded-lg space-y-2">
                <Disc className="w-5 h-5 text-amber-500" />
                <h4 className="font-display font-bold text-sm text-white uppercase">Sonic Identity</h4>
                <p className="text-xs text-zinc-400 font-light">
                  Blending heavy sub-frequencies, boom-bap rhythm, and modern arrangement.
                </p>
              </div>

              <div className="p-4 bg-zinc-950/80 border border-white/10 rounded-lg space-y-2">
                <Sparkles className="w-5 h-5 text-rose-400" />
                <h4 className="font-display font-bold text-sm text-white uppercase">Visual Direction</h4>
                <p className="text-xs text-zinc-400 font-light">
                  Cinematic music videos and art design crafted with bespoke visual aesthetics.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={onOpenFullBio}
                className="inline-flex items-center gap-3 px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold tracking-widest uppercase rounded-sm transition-all cursor-pointer group shadow-lg"
              >
                <span>Read Full Bio & Press Kit</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
