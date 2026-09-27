import React from 'react';
import { Play, ArrowRight, Music, Disc } from 'lucide-react';
import { Release } from '../../types';
import { Artwork } from '../common/ArtworkPlaceholder';
import { useAudio } from '../../context/AudioContext';

interface LatestReleasesProps {
  releases: Release[];
  onViewAllMusic: () => void;
  onSelectRelease: (release: Release) => void;
}

export const LatestReleases: React.FC<LatestReleasesProps> = ({
  releases,
  onViewAllMusic,
  onSelectRelease,
}) => {
  const { playTrack, currentTrack, isPlaying } = useAudio();

  const handleListen = (release: Release, e: React.MouseEvent) => {
    e.stopPropagation();
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
    } else {
      onSelectRelease(release);
    }
  };

  return (
    <section className="py-24 bg-[#070709] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-rose-500 font-bold mb-2">
              Discography & Releases
            </p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight uppercase">
              Latest Releases
            </h2>
          </div>

          {releases.length > 0 && (
            <button
              onClick={onViewAllMusic}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer group"
            >
              <span>View All Music</span>
              <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Dynamic Releases List or Clean Empty State */}
        {releases.length === 0 ? (
          <div className="bg-zinc-950/60 border border-white/10 rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
              <Music className="w-5 h-5" />
            </div>
            <p className="font-display font-bold text-lg text-white uppercase">
              No releases published yet
            </p>
            <p className="text-sm text-zinc-400">
              The official discography is currently being prepared. Check back soon or subscribe to official updates to receive release notifications.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {releases.slice(0, 8).map((release) => {
              const isCurrent = isPlaying && currentTrack?.release_id === release.id;
              const formattedDate = new Date(release.release_date).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={release.id}
                  onClick={() => onSelectRelease(release)}
                  className="group bg-[#0d0d12] border border-white/10 hover:border-white/25 rounded-lg overflow-hidden transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Artwork with hover play button */}
                  <div className="relative overflow-hidden aspect-square">
                    <Artwork
                      src={release.artwork_url}
                      alt={release.title}
                      aspect="square"
                      title={release.title}
                      subtitle={release.artist}
                      type="release"
                    />

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={(e) => handleListen(release, e)}
                        aria-label={`Listen to ${release.title}`}
                        className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer"
                      >
                        {isCurrent ? (
                          <Disc className="w-5 h-5 animate-spin" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>

                    {/* Unboxed type kicker in corner */}
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider text-zinc-300 rounded-xs border border-white/10">
                      {release.type}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-1 font-mono">
                        <span>{formattedDate}</span>
                        {release.genre && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{release.genre}</span>
                          </>
                        )}
                      </div>
                      <h3 className="font-display font-bold text-base text-white tracking-tight group-hover:text-rose-400 transition-colors uppercase line-clamp-1">
                        {release.title}
                      </h3>
                      <p className="text-xs text-zinc-400 font-medium">
                        {release.artist}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                      <button
                        onClick={(e) => handleListen(release, e)}
                        className="text-rose-400 hover:text-rose-300 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Listen</span>
                      </button>
                      <span className="text-[11px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        Details ↗
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
