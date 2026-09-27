import React, { useState } from 'react';
import { Download, Smartphone, X, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'mobile' | 'floating';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header', className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone PWA mode, suppress the button
  if (isInstalled) {
    return null;
  }

  // Not on iOS and not installable yet
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleClick = () => {
    if (isInstallable) {
      install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleClick}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${className}`}
          title="Install Official App for offline access and faster playback"
        >
          <Download className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Install App</span>
        </button>
      )}

      {variant === 'mobile' && (
        <button
          onClick={handleClick}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg ${className}`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Install Official Mobile App</span>
        </button>
      )}

      {variant === 'floating' && (
        <button
          onClick={handleClick}
          className={`fixed bottom-24 right-5 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-2xl font-bold text-xs uppercase tracking-wider transition-transform hover:scale-105 cursor-pointer ${className}`}
        >
          <Download className="w-4 h-4" />
          <span>Install App</span>
        </button>
      )}

      {/* iOS Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-[#0e0e14] border border-white/15 p-6 shadow-2xl space-y-4 text-zinc-200 relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-rose-950 flex items-center justify-center border border-rose-500/40 font-display font-black text-white text-base">
                PS
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">Prantik Sarkar</h3>
                <p className="text-[11px] text-zinc-400">Install to iPhone / iPad Home Screen</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                <Share className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  1. Tap the <strong className="text-white">Share</strong> icon in the Safari bottom toolbar.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                <PlusSquare className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  2. Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-zinc-300">
                  Enjoy fullscreen audio playback, offline browsing, and faster load times.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
