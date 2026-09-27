import React from 'react';
import { X, Play, Disc, Calendar, ExternalLink, Music2, Bookmark, BookmarkCheck } from 'lucide-react';
import { Release, User } from '../../types';
import { Artwork } from '../common/ArtworkPlaceholder';
import { useAudio } from '../../context/AudioContext';
import { db } from '../../services/db';

interface ReleaseModalProps {
  release: Release | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const ReleaseModal: React.FC<ReleaseModalProps> = ({
  release,
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
}) => {
  const { playTrack, currentTrack, isPlaying } = useAudio();

  if (!isOpen || !release) return null;

  const isSaved = currentUser ? db.isItemSaved(currentUser.id, 'release', release.id) : false;

  const handleToggleSave = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    db.toggleSaveItem(currentUser.id, 'release', release.id);
  };

  const handlePlayPreview = (trackTitle?: string) => {
    if (release.audio_preview_url) {
      playTrack({
        release_id: release.id,
        release_title: release.title,
        track_title: trackTitle || release.tracks?.[0]?.title || release.title,
        artist: release.artist,
        artwork_url: release.artwork_url,
        audio_url: release.audio_preview_url,
        spotify_url: release.spotify_url,
        apple_music_url: release.apple_music_url,
        youtube_music_url: release.youtube_music_url,
        jiosaavn_url: release.jiosaavn_url,
      });
    }
  };

  const formattedDate = new Date(release.release_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0e0e14] border border-white/15 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/80 hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
          {/* Cover Art */}
          <div className="sm:col-span-5 rounded-lg overflow-hidden border border-white/10 shadow-xl">
            <Artwork
              src={release.artwork_url}
              alt={release.title}
              aspect="square"
              title={release.title}
              subtitle={release.artist}
              type="release"
            />
          </div>

          {/* Metadata */}
          <div className="sm:col-span-7 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-wider font-mono mb-1">
                <span>{release.type}</span>
                <span aria-hidden="true">·</span>
                <span>{formattedDate}</span>
              </div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight">
                {release.title}
              </h2>
              <p className="text-sm font-semibold text-rose-500 uppercase tracking-wider">
                {release.artist}
              </p>
            </div>

            {release.description && (
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
                {release.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {release.audio_preview_url && (
                <button
                  onClick={() => handlePlayPreview()}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isPlaying && currentTrack?.release_id === release.id ? 'Playing' : 'Audio Preview'}</span>
                </button>
              )}

              {/* Functional Save Button */}
              <button
                onClick={handleToggleSave}
                className={`px-4 py-2.5 border rounded-sm text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-white/15 text-zinc-300 hover:text-white'
                }`}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-rose-400" />
                    <span>Saved in Studio</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Save Track</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tracklist */}
        {release.tracks && release.tracks.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
              <Music2 className="w-4 h-4 text-rose-500" />
              <span>Official Tracklist</span>
            </h3>
            <div className="space-y-1">
              {release.tracks.map((track, i) => (
                <div
                  key={track.id || i}
                  onClick={() => handlePlayPreview(track.title)}
                  className="p-2.5 rounded-lg bg-zinc-900/40 hover:bg-zinc-800 border border-white/5 flex items-center justify-between text-xs cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-zinc-500 font-mono text-[11px]">{track.number || i + 1}</span>
                    <span className="text-white font-medium group-hover:text-rose-400 transition-colors">
                      {track.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-500 font-mono text-[11px]">
                    <span>{track.duration}</span>
                    <Play className="w-3.5 h-3.5 text-zinc-400 group-hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Streaming links */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
            Stream on Music Platforms
          </p>
          <div className="flex flex-wrap gap-3 text-xs">
            {release.spotify_url && (
              <a
                href={release.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <span>Spotify</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            )}
            {release.apple_music_url && (
              <a
                href={release.apple_music_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <span>Apple Music</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            )}
            {release.youtube_music_url && (
              <a
                href={release.youtube_music_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <span>YouTube Music</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            )}
            {release.jiosaavn_url && (
              <a
                href={release.jiosaavn_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <span>JioSaavn</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
