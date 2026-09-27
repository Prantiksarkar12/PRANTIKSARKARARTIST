import React from 'react';
import { ArrowRight, BookOpen, Calendar, Clock } from 'lucide-react';
import { Post } from '../../types';
import { Artwork } from '../common/ArtworkPlaceholder';

interface LatestPostsProps {
  posts: Post[];
  onViewAllPosts: () => void;
  onReadPost: (post: Post) => void;
}

export const LatestPosts: React.FC<LatestPostsProps> = ({
  posts,
  onViewAllPosts,
  onReadPost,
}) => {
  return (
    <section className="py-24 bg-[#09090c] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-rose-500 font-bold mb-2">
              Journal & Stories
            </p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight uppercase">
              Latest Posts
            </h2>
          </div>

          {posts.length > 0 && (
            <button
              onClick={onViewAllPosts}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer group"
            >
              <span>View All Posts</span>
              <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Dynamic Posts or Empty state */}
        {posts.length === 0 ? (
          <div className="bg-zinc-950/60 border border-white/10 rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="font-display font-bold text-lg text-white uppercase">
              No articles published yet
            </p>
            <p className="text-sm text-zinc-400">
              Official writings, creative notes, and release breakdowns will be posted here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(0, 3).map((post) => {
              const formattedDate = new Date(post.published_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <article
                  key={post.id}
                  onClick={() => onReadPost(post)}
                  className="group bg-[#0d0d12] border border-white/10 hover:border-white/25 rounded-lg overflow-hidden transition-all duration-300 flex flex-col cursor-pointer"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Artwork
                      src={post.cover_image}
                      alt={post.title}
                      aspect="video"
                      title={post.title}
                      type="post"
                    />
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider text-rose-400 rounded-xs border border-white/10">
                      {post.category}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-600" />
                          <span>{formattedDate}</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-600" />
                          <span>{post.read_time}</span>
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-lg text-white tracking-tight group-hover:text-rose-400 transition-colors uppercase line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed font-light">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center text-xs text-zinc-300 group-hover:text-rose-400 font-semibold uppercase tracking-wider">
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
