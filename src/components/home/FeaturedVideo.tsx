import React, { useState } from 'react';
import { Play, Film, Calendar, User } from 'lucide-react';
import { Video } from '../../types';
import { Artwork } from '../common/ArtworkPlaceholder';

interface FeaturedVideoProps {
  video: Video | null;
  onPlayVideo: (video: Video) => void;
}

export const FeaturedVideo: React.FC<FeaturedVideoProps> = ({ video, onPlayVideo }) => {
  const [isPlayingInline, setIsPlayingInline] = useState(false);

  if (!video) return null;

  const formattedDate = new Date(video.published_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Extract YouTube embed ID if applicable
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        const v = urlObj.searchParams.get('v');
        return `https://www.youtube.com/embed/${v}?autoplay=1`;
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
    } catch {
      // Fallback
    }
    return url;
  };

  return (
    <section className="py-20 bg-[#09090c] border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-rose-500 font-bold">
            Featured Visual
          </p>
        </div>

        <div className="bg-gradient-to-br from-zinc-900/90 via-[#101015] to-zinc-950 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Video Player or Thumbnail on the left/top */}
            <div className="lg:col-span-7 relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
              {isPlayingInline ? (
                <iframe
                  src={getYouTubeEmbedUrl(video.video_url)}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div
                  onClick={() => setIsPlayingInline(true)}
                  className="w-full h-full relative cursor-pointer group"
                >
                  <Artwork
                    src={video.thumbnail_url}
                    alt={video.title}
                    aspect="video"
                    title={video.title}
                    type="video"
                    className="w-full h-full"
                  />
                  
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 fill-current ml-1" />
                    </div>
                  </div>

                  {video.duration && (
                    <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 text-[11px] font-mono text-zinc-300 rounded border border-white/10">
                      {video.duration}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Video details on right */}
            <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Film className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Official Visual</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{formattedDate}</span>
                  </span>
                </div>

                <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight uppercase leading-snug">
                  {video.title}
                </h3>

                {video.description && (
                  <p className="text-sm text-zinc-300 leading-relaxed font-light">
                    {video.description}
                  </p>
                )}

                {video.director && (
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Directed by: {video.director}</span>
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center gap-4">
                <button
                  onClick={() => onPlayVideo(video)}
                  className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold tracking-widest uppercase rounded-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Watch Full Video</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
