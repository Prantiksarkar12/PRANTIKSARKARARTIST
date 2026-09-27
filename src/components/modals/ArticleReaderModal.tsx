import React from 'react';
import { X, Calendar, Clock, User, Tag, Bookmark, BookmarkCheck } from 'lucide-react';
import { Post, User as UserType } from '../../types';
import { Artwork } from '../common/ArtworkPlaceholder';
import { db } from '../../services/db';

interface ArticleReaderModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  onOpenAuth: () => void;
}

export const ArticleReaderModal: React.FC<ArticleReaderModalProps> = ({
  post,
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
}) => {
  if (!isOpen || !post) return null;

  const isSaved = currentUser ? db.isItemSaved(currentUser.id, 'post', post.id) : false;

  const handleToggleSave = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    db.toggleSaveItem(currentUser.id, 'post', post.id);
  };

  const formattedDate = new Date(post.published_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0e0e14] border border-white/15 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={handleToggleSave}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
              isSaved ? 'bg-rose-950/90 text-rose-300 border border-rose-500/40' : 'bg-zinc-900/90 text-zinc-300 hover:text-white border border-white/10'
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-rose-400" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={onClose}
            aria-label="Close article"
            className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/90 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cover visual */}
        <div className="relative aspect-[21/9] sm:aspect-[2.5/1] overflow-hidden">
          <Artwork
            src={post.cover_image}
            alt={post.title}
            aspect="video"
            title={post.title}
            type="post"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e14] via-transparent to-transparent" />
        </div>

        {/* Post content body */}
        <div className="p-6 sm:p-10 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
              <span className="text-rose-500 font-bold uppercase">{post.category}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>{formattedDate}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>{post.read_time}</span>
              </span>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight leading-tight">
              {post.title}
            </h1>

            <p className="text-xs text-zinc-400 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-zinc-500" />
              <span>Written by {post.author}</span>
            </p>
          </div>

          <div className="text-zinc-300 text-sm sm:text-base leading-relaxed space-y-4 font-light border-t border-white/10 pt-6">
            {post.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
              <Tag className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-zinc-500">Topics:</span>
              {post.tags.map((tag) => (
                <span key={tag} className="text-zinc-300 font-mono">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
