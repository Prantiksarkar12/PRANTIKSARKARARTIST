import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { GalleryItem } from '../../types';

interface MediaLightboxProps {
  items: GalleryItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  items,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    } else {
      onNavigate(items.length - 1);
    }
  }, [currentIndex, items.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      onNavigate(currentIndex + 1);
    } else {
      onNavigate(0);
    }
  }, [currentIndex, items.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex];
  if (!currentItem) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between text-white pb-4 border-b border-white/10">
        <div>
          <span className="text-xs uppercase tracking-widest text-rose-500 font-bold">
            {currentItem.category}
          </span>
          <span className="text-xs text-zinc-400 ml-3 font-mono">
            {currentIndex + 1} / {items.length}
          </span>
        </div>

        <button
          onClick={onClose}
          aria-label="Close Lightbox"
          className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Viewport with Nav Arrows */}
      <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
        {/* Prev Button */}
        <button
          onClick={handlePrev}
          aria-label="Previous image"
          className="absolute left-2 sm:left-6 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 hover:scale-110 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Center Media */}
        <div className="max-w-5xl max-h-[75vh] flex items-center justify-center">
          {currentItem.image_url ? (
            <img
              src={currentItem.image_url}
              alt={currentItem.title}
              className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl"
            />
          ) : (
            <div className="w-[500px] h-[350px] bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-xl flex flex-col items-center justify-center p-8 text-center">
              <Camera className="w-12 h-12 text-zinc-600 mb-3" />
              <h4 className="font-display font-bold text-lg text-white uppercase">{currentItem.title}</h4>
              <p className="text-xs text-zinc-400 mt-1">{currentItem.category} Archive</p>
            </div>
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          aria-label="Next image"
          className="absolute right-2 sm:right-6 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 hover:scale-110 transition-all cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Caption & Credits */}
      <div className="text-center text-zinc-300 max-w-2xl mx-auto pt-2">
        <h3 className="font-display font-bold text-base sm:text-lg text-white uppercase tracking-tight">
          {currentItem.title}
        </h3>
        {currentItem.caption && (
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-light">
            {currentItem.caption}
          </p>
        )}
        {currentItem.photographer_credit && (
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">
            Photo Credit: {currentItem.photographer_credit}
          </p>
        )}
      </div>
    </div>
  );
};
