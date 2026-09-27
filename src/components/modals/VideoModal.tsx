import React from 'react';
import { X, Calendar, User, Film, Bookmark, BookmarkCheck } from 'lucide-react';
import { Video, User as UserType } from '../../types';
import { db } from '../../services/db';

interface VideoModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  onOpenAuth: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  video,
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
}) => {
  if (!isOpen || !video) return null;

  const isSaved = currentUser ? db.isItemSaved(currentUser.id, 'video', video.id) : false;

  const handleToggleSave = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    db.toggleSaveItem(currentUser.id, 'video', video.id);
  };

  const getEmbedUrl = (url: string) => {
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
      if (url.includes('vimeo.com/')) {
        const id = url.split('vimeo.com/')[1];
        return `https://player.vimeo.com/video/${id}?autoplay=1`;
      }
    } catch {
      // fallback
    }
    return url;
  };

  const formattedDate = new Date(video.published_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0e0e14] border border-white/15 rounded-xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-950">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-rose-500" />
            <span className="text-xs uppercase font-bold text-zinc-300 tracking-wider">Official Video Player</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSave}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                isSaved ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40' : 'bg-zinc-900 text-zinc-300 hover:text-white border border-white/10'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-rose-400" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved' : 'Save Video'}</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Close video player"
              className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Frame */}
        <div className="relative aspect-video bg-black">
          <iframe
            src={getEmbedUrl(video.video_url)}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>

        {/* Video Info Details */}
        <div className="p-6 space-y-3 bg-[#0d0d12] overflow-y-auto">
          <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>{formattedDate}</span>
            </span>
            {video.director && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Dir: {video.director}</span>
                </span>
              </>
            )}
          </div>

          <h2 className="font-display font-bold text-xl sm:text-2xl text-white uppercase tracking-tight">
            {video.title}
          </h2>

          {video.description && (
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
              {video.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
