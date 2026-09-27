import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 z-50 flex items-center gap-2.5 rounded-lg bg-zinc-900/95 border border-rose-500/40 px-3.5 py-2 text-xs font-medium text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 duration-300">
      <div className="relative flex items-center justify-center">
        <WifiOff className="w-3.5 h-3.5 text-rose-400" />
        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
      </div>
      <span>
        <strong className="text-rose-300 font-semibold">Offline Mode</strong> — Serving cached music & content.
      </span>
    </div>
  );
};
