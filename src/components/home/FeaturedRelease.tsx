import React from 'react';
import { Play, Disc, Calendar, ExternalLink } from 'lucide-react';
import { Release } from '../../types';
import { Artwork } from '../common/ArtworkPlaceholder';
import { useAudio } from '../../context/AudioContext';

interface FeaturedReleaseProps {
  release: Release | null;
  onOpenReleaseModal?: (release: Release) => void;
}

export const FeaturedRelease: React.FC<FeaturedReleaseProps> = ({
  release,
  onOpenReleaseModal,
}) => {
  const { playTrack, currentTrack, isPlaying } = useAudio();

  if (!release) {
    return null; // As requested: If no featured release exists, hide the section cleanly
  }

  const isCurrentPlaying =
    isPlaying && currentTrack?.release_id === release.id;

  const handleListen = () => {
    if (release.audio_preview_url) {
      playTrack({
        release_id: release.id,
        release_title: release.title,
        track_title: release.tracks?.[0]?.title || release.title,
        artist: release.artist,
        artwork_url: release.artwork_url,
        audio_url: release.audio_preview_url,
        spotify_url: release.spotify_url,
        apple_music_url: release.apple_music_url,
        youtube_music_url: release.youtube_music_url,
        jiosaavn_url: release.jiosaavn_url,
      });
    } else if (onOpenReleaseModal) {
      onOpenReleaseModal(release);
    }
  };

  const formattedDate = new Date(release.release_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <section className="py-20 bg-[#070709] border-t border-white/5 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-rose-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-500 font-bold">
            Featured Spotlight
          </p>
        </div>

        <div className="relative bg-gradient-to-br from-zinc-900/80 via-[#101015] to-zinc-950 border border-white/10 rounded-xl overflow-hidden p-6 sm:p-10 lg:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Artwork Container */}
            <div className="lg:col-span-5 relative group">
              <div className="relative rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                <Artwork
                  src={release.artwork_url}
                  alt={release.title}
                  aspect="square"
                  title={release.title}
                  subtitle={release.artist}
                  type="release"
                  className="w-full"
                />

                {/* Quick overlay play button */}
                <button
                  onClick={handleListen}
                  aria-label={`Play ${release.title}`}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                </button>
              </div>
            </div>

            {/* Release Info */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium uppercase tracking-wider">
                  <span>{release.type}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{formattedDate}</span>
                  </span>
                  {release.genre && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{release.genre}</span>
                    </>
                  )}
                </div>

                <h3 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight uppercase">
                  {release.title}
                </h3>
                <p className="text-sm font-semibold text-rose-400 uppercase tracking-widest">
                  {release.artist}
                </p>
              </div>

              {release.description && (
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl font-light">
                  {release.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={handleListen}
                  className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold tracking-widest uppercase rounded-sm shadow-xl transition-all flex items-center gap-3 cursor-pointer"
                >
                  {isCurrentPlaying ? (
                    <>
                      <Disc className="w-4 h-4 animate-spin" />
                      <span>Playing Now</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Listen Now</span>
                    </>
                  )}
                </button>

                {onOpenReleaseModal && (
                  <button
                    onClick={() => onOpenReleaseModal(release)}
                    className="px-6 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs sm:text-sm font-bold tracking-widest uppercase rounded-sm border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Release Details</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                )}
              </div>

              {/* Streaming platform direct links */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap gap-4 text-xs text-zinc-400">
                {release.spotify_url && (
                  <a href={release.spotify_url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Spotify ↗
                  </a>
                )}
                {release.apple_music_url && (
                  <a href={release.apple_music_url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Apple Music ↗
                  </a>
                )}
                {release.youtube_music_url && (
                  <a href={release.youtube_music_url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    YouTube ↗
                  </a>
                )}
                {release.jiosaavn_url && (
                  <a href={release.jiosaavn_url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    JioSaavn ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
