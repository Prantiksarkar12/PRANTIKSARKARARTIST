import React from 'react';
import { Play, Pause, X, Disc, ExternalLink, Volume2 } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

export const AudioPlayerBar: React.FC = () => {
  const { currentTrack, isPlaying, progress, duration, togglePlay, seek, closePlayer } = useAudio();

  if (!currentTrack) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c10]/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 text-white shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Track info on left */}
        <div className="flex items-center gap-3 w-full md:w-1/4 min-w-0">
          <div className="w-11 h-11 rounded bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden relative">
            {currentTrack.artwork_url ? (
              <img
                src={currentTrack.artwork_url}
                alt={currentTrack.release_title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Disc className={`w-6 h-6 text-rose-500 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-display font-bold text-xs uppercase tracking-tight text-white truncate">
              {currentTrack.track_title}
            </h4>
            <p className="text-[11px] text-zinc-400 truncate">
              {currentTrack.artist} · <span className="text-zinc-500">{currentTrack.release_title}</span>
            </p>
          </div>
        </div>

        {/* Player controls & Timeline bar in center */}
        <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-9 h-9 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
          </div>

          {/* Progress scrubber */}
          <div className="flex items-center gap-2 w-full max-w-md text-[10px] font-mono text-zinc-400">
            <span className="w-8 text-right">{formatTime(progress)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={progress}
              onChange={handleSeekChange}
              className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <span className="w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right side: External links and close button */}
        <div className="flex items-center justify-end gap-3 w-full md:w-1/4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
            {currentTrack.spotify_url && (
              <a
                href={currentTrack.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
                title="Open in Spotify"
              >
                <span>Spotify</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}
            {currentTrack.apple_music_url && (
              <a
                href={currentTrack.apple_music_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
                title="Open in Apple Music"
              >
                <span>Apple</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}
          </div>

          <button
            onClick={closePlayer}
            aria-label="Close player"
            className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
