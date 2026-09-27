import React, { useState } from 'react';
import { Camera, Maximize2 } from 'lucide-react';
import { GalleryItem } from '../../types';
import { Artwork } from '../common/ArtworkPlaceholder';
import { MediaLightbox } from '../modals/MediaLightbox';

interface GallerySectionProps {
  gallery: GalleryItem[];
}

const CATEGORIES = [
  'All',
  'Music',
  'Studio',
  'Performance',
  'Events',
  'Behind The Scenes',
  'Press',
];

export const GallerySection: React.FC<GallerySectionProps> = ({ gallery }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredItems =
    selectedCategory === 'All'
      ? gallery
      : gallery.filter((item) => item.category === selectedCategory);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  return (
    <section className="py-24 bg-[#070709] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-rose-500 font-bold mb-2">
              Visual Archive & Photography
            </p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight uppercase">
              Official Gallery
            </h2>
          </div>

          {/* Category Filter Controls */}
          {gallery.length > 0 && (
            <div className="flex flex-wrap gap-1 p-1 bg-zinc-900 border border-white/10 rounded-lg max-w-full overflow-x-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Gallery Grid or Empty State */}
        {filteredItems.length === 0 ? (
          <div className="bg-zinc-950/60 border border-white/10 rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
              <Camera className="w-5 h-5" />
            </div>
            <p className="font-display font-bold text-lg text-white uppercase">
              No gallery media published yet
            </p>
            <p className="text-sm text-zinc-400">
              High-resolution live concert captures, studio sessions, and editorial photo spreads will be exhibited here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => openLightbox(index)}
                className="group relative bg-zinc-950 rounded-lg overflow-hidden border border-white/10 hover:border-white/25 cursor-pointer aspect-square"
              >
                <Artwork
                  src={item.image_url}
                  alt={item.title}
                  aspect="square"
                  title={item.title}
                  type="gallery"
                />

                {/* Hover overlay with title & zoom icon */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                  <div className="flex justify-end">
                    <span className="p-2 rounded-full bg-black/60 text-white border border-white/10">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="font-display font-bold text-sm text-white uppercase truncate">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <MediaLightbox
          items={filteredItems}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
        />
      )}
    </section>
  );
};
