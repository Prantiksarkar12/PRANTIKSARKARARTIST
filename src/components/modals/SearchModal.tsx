import React, { useState, useEffect } from 'react';
import { Search, X, Disc, Film, BookOpen, Calendar, Newspaper, ArrowRight } from 'lucide-react';
import { Release, Video, Post, EventItem, PressArticle } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  releases: Release[];
  videos: Video[];
  posts: Post[];
  events: EventItem[];
  press: PressArticle[];
  onSelectRelease: (r: Release) => void;
  onSelectVideo: (v: Video) => void;
  onSelectPost: (p: Post) => void;
  onNavigate: (route: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  releases,
  videos,
  posts,
  events,
  press,
  onSelectRelease,
  onSelectVideo,
  onSelectPost,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // toggle search
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingReleases = q
    ? releases.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.genre?.toLowerCase().includes(q)
      )
    : [];

  const matchingVideos = q
    ? videos.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.director?.toLowerCase().includes(q)
      )
    : [];

  const matchingPosts = q
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    : [];

  const matchingEvents = q
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q)
      )
    : [];

  const matchingPress = q
    ? press.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.publication.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q)
      )
    : [];

  const totalResults =
    matchingReleases.length +
    matchingVideos.length +
    matchingPosts.length +
    matchingEvents.length +
    matchingPress.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0e0e13] border border-white/15 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-4 border-b border-white/10 bg-zinc-950/60">
          <Search className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search music, videos, articles, tour dates, press..."
            className="w-full bg-transparent text-white placeholder:text-zinc-500 text-sm focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-md transition-colors cursor-pointer ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 space-y-6 flex-1">
          {!q ? (
            <div className="text-center py-10 text-zinc-500 text-xs">
              <p>Type to search official catalogue items...</p>
              <div className="mt-4 flex justify-center gap-2">
                <span className="px-2 py-1 bg-zinc-900 border border-white/5 rounded">Releases</span>
                <span className="px-2 py-1 bg-zinc-900 border border-white/5 rounded">Videos</span>
                <span className="px-2 py-1 bg-zinc-900 border border-white/5 rounded">Events</span>
                <span className="px-2 py-1 bg-zinc-900 border border-white/5 rounded">Articles</span>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-10 text-zinc-400 text-xs">
              <p>No results found for "{query}".</p>
            </div>
          ) : (
            <div className="space-y-6 text-xs">
              {/* Releases */}
              {matchingReleases.length > 0 && (
                <div className="space-y-2">
                  <p className="font-bold text-rose-500 uppercase tracking-wider text-[10px]">
                    Music Releases ({matchingReleases.length})
                  </p>
                  <div className="space-y-1">
                    {matchingReleases.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          onSelectRelease(r);
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-white/5 flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <Disc className="w-4 h-4 text-zinc-400 group-hover:text-rose-400" />
                          <span className="text-white font-medium">{r.title}</span>
                          <span className="text-zinc-500">({r.type})</span>
                        </div>
                        <span className="text-zinc-500 group-hover:text-zinc-300">View ↗</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {matchingVideos.length > 0 && (
                <div className="space-y-2">
                  <p className="font-bold text-rose-500 uppercase tracking-wider text-[10px]">
                    Videos & Cinema ({matchingVideos.length})
                  </p>
                  <div className="space-y-1">
                    {matchingVideos.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => {
                          onSelectVideo(v);
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-white/5 flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <Film className="w-4 h-4 text-zinc-400 group-hover:text-rose-400" />
                          <span className="text-white font-medium">{v.title}</span>
                        </div>
                        <span className="text-zinc-500 group-hover:text-zinc-300">Watch ↗</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              {matchingPosts.length > 0 && (
                <div className="space-y-2">
                  <p className="font-bold text-rose-500 uppercase tracking-wider text-[10px]">
                    Articles & Journal ({matchingPosts.length})
                  </p>
                  <div className="space-y-1">
                    {matchingPosts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectPost(p);
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-white/5 flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-4 h-4 text-zinc-400 group-hover:text-rose-400" />
                          <span className="text-white font-medium">{p.title}</span>
                          <span className="text-zinc-500">({p.category})</span>
                        </div>
                        <span className="text-zinc-500 group-hover:text-zinc-300">Read ↗</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Events */}
              {matchingEvents.length > 0 && (
                <div className="space-y-2">
                  <p className="font-bold text-rose-500 uppercase tracking-wider text-[10px]">
                    Live Events ({matchingEvents.length})
                  </p>
                  <div className="space-y-1">
                    {matchingEvents.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => {
                          onNavigate('/events');
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-white/5 flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-zinc-400 group-hover:text-rose-400" />
                          <span className="text-white font-medium">{e.title}</span>
                          <span className="text-zinc-500">{e.city} · {e.date}</span>
                        </div>
                        <span className="text-zinc-500 group-hover:text-zinc-300">Details ↗</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Press */}
              {matchingPress.length > 0 && (
                <div className="space-y-2">
                  <p className="font-bold text-rose-500 uppercase tracking-wider text-[10px]">
                    Press Features ({matchingPress.length})
                  </p>
                  <div className="space-y-1">
                    {matchingPress.map((pr) => (
                      <button
                        key={pr.id}
                        onClick={() => {
                          onNavigate('/press');
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-white/5 flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <Newspaper className="w-4 h-4 text-zinc-400 group-hover:text-rose-400" />
                          <span className="text-white font-medium">{pr.title}</span>
                          <span className="text-zinc-500">({pr.publication})</span>
                        </div>
                        <span className="text-zinc-500 group-hover:text-zinc-300">View ↗</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
