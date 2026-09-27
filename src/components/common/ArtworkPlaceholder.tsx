import React, { useState } from 'react';
import { Music, Disc, Play, Radio, Mic2 } from 'lucide-react';

interface ArtworkProps {
  src?: string;
  alt: string;
  className?: string;
  aspect?: 'square' | 'video' | 'portrait';
  title?: string;
  subtitle?: string;
  type?: 'release' | 'video' | 'post' | 'artist' | 'gallery';
}

export const Artwork: React.FC<ArtworkProps> = ({
  src,
  alt,
  className = '',
  aspect = 'square',
  title,
  subtitle,
  type = 'release',
}) => {
  const [hasError, setHasError] = useState(false);

  const aspectClass =
    aspect === 'video' ? 'aspect-video' : aspect === 'portrait' ? 'aspect-[3/4]' : 'aspect-square';

  if (!src || hasError) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-zinc-900 via-[#121217] to-black border border-white/10 flex flex-col items-center justify-center p-6 text-center select-none group ${aspectClass} ${className}`}
      >
        {/* Subtle crimson and gold ambient lighting */}
        <div className="absolute inset-0 bg-radial from-crimson-900/20 via-transparent to-transparent opacity-40 pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-crimson-500 group-hover:border-crimson-500/40 transition-colors shadow-lg">
            {type === 'release' && <Disc className="w-6 h-6 animate-[spin_12s_linear_infinite]" />}
            {type === 'video' && <Play className="w-6 h-6 text-zinc-300 ml-0.5" />}
            {type === 'artist' && <Mic2 className="w-6 h-6 text-zinc-300" />}
            {type === 'post' && <Radio className="w-6 h-6 text-zinc-300" />}
            {type === 'gallery' && <Music className="w-6 h-6 text-zinc-300" />}
          </div>
          {title && (
            <div className="space-y-1 max-w-[85%]">
              <p className="font-display font-bold text-sm tracking-tight text-zinc-200 line-clamp-1">{title}</p>
              {subtitle && <p className="text-xs text-zinc-500 line-clamp-1">{subtitle}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-zinc-950 ${aspectClass} ${className}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
    </div>
  );
};
