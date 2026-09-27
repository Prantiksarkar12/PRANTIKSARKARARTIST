import React from 'react';
import { Play, ArrowRight, Film } from 'lucide-react';
import { Video } from '../../types';
import { Artwork } from '../common/ArtworkPlaceholder';

interface LatestVideosProps {
  videos: Video[];
  onViewAllVideos: () => void;
  onPlayVideo: (video: Video) => void;
}

export const LatestVideos: React.FC<LatestVideosProps> = ({
  videos,
  onViewAllVideos,
  onPlayVideo,
}) => {
  return (
    <section className="py-24 bg-[#070709] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-rose-500 font-bold mb-2">
              Visuals & Cinema
            </p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight uppercase">
              Latest Videos
            </h2>
          </div>

          {videos.length > 0 && (
            <button
              onClick={onViewAllVideos}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer group"
            >
              <span>View All Videos</span>
              <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Dynamic Videos List or Clean Empty State */}
        {videos.length === 0 ? (
          <div className="bg-zinc-950/60 border border-white/10 rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
              <Film className="w-5 h-5" />
            </div>
            <p className="font-display font-bold text-lg text-white uppercase">
              No videos published yet
            </p>
            <p className="text-sm text-zinc-400">
              Official music videos and cinematic visuals will be premiered here upon release.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.slice(0, 6).map((video) => {
              const formattedDate = new Date(video.published_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={video.id}
                  onClick={() => onPlayVideo(video)}
                  className="group bg-[#0d0d12] border border-white/10 hover:border-white/25 rounded-lg overflow-hidden transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Video Thumbnail with Hover Play Icon */}
                  <div className="relative aspect-video overflow-hidden">
                    <Artwork
                      src={video.thumbnail_url}
                      alt={video.title}
                      aspect="video"
                      title={video.title}
                      type="video"
                    />

                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl group-hover:scale-115 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 text-[10px] font-mono text-zinc-300 rounded border border-white/10">
                        {video.duration}
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <p className="text-[11px] text-zinc-500 font-mono">
                        {formattedDate}
                      </p>
                      <h3 className="font-display font-bold text-base text-white tracking-tight group-hover:text-rose-400 transition-colors uppercase line-clamp-2">
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-light">
                          {video.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-rose-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1">
                        <Play className="w-3 h-3 fill-current" />
                        <span>Watch Visual</span>
                      </span>
                      {video.director && (
                        <span className="text-[11px] text-zinc-500 truncate max-w-[120px]">
                          Dir: {video.director}
                        </span>
                      )}
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
