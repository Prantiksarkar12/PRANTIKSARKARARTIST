import React from 'react';
import { X, ShieldCheck, FileText, Cookie } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | 'cookies' | null;
  isOpen: boolean;
  onClose: () => void;
  artistName: string;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  type,
  isOpen,
  onClose,
  artistName,
}) => {
  if (!isOpen || !type) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0e0e14] border border-white/15 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative text-xs sm:text-sm text-zinc-300 space-y-6">
        <button
          onClick={onClose}
          aria-label="Close legal modal"
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/80 hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {type === 'privacy' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-rose-500 font-bold uppercase tracking-wider text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Policy</span>
            </div>
            <h2 className="font-display font-black text-2xl text-white uppercase tracking-tight">
              Privacy Policy
            </h2>
            <p className="text-zinc-400 leading-relaxed font-light">
              This official website for {artistName} respects your privacy. We do not sell, rent, or trade your personal data with third-party advertisers.
            </p>
            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-white uppercase text-xs">Data We Collect</h3>
              <p className="text-zinc-400 leading-relaxed font-light">
                When you subscribe to the official newsletter, submit a booking inquiry, or register an account, we store your contact details strictly to fulfill your request and communicate official artist dispatches.
              </p>
              <h3 className="font-bold text-white uppercase text-xs">Security & Retention</h3>
              <p className="text-zinc-400 leading-relaxed font-light">
                All data transmission is encrypted via SSL/TLS. You may request total erasure of your personal data at any time by contacting our management team.
              </p>
            </div>
          </div>
        )}

        {type === 'terms' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-rose-500 font-bold uppercase tracking-wider text-xs">
              <FileText className="w-4 h-4" />
              <span>Terms & Rights</span>
            </div>
            <h2 className="font-display font-black text-2xl text-white uppercase tracking-tight">
              Terms of Service
            </h2>
            <p className="text-zinc-400 leading-relaxed font-light">
              All musical compositions, master audio recordings, artwork, photography, lyrics, trademarks, and visual designs featured on this website are the intellectual property of {artistName} and respective rights holders.
            </p>
            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-white uppercase text-xs">Permitted Use</h3>
              <p className="text-zinc-400 leading-relaxed font-light">
                You may stream audio previews, watch official visualizers, read journal articles, and download authorized press kit materials for legitimate editorial and promotional use. Unauthorized commercial reproduction is prohibited.
              </p>
            </div>
          </div>
        )}

        {type === 'cookies' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-rose-500 font-bold uppercase tracking-wider text-xs">
              <Cookie className="w-4 h-4" />
              <span>Storage Notice</span>
            </div>
            <h2 className="font-display font-black text-2xl text-white uppercase tracking-tight">
              Cookie & Local Storage Policy
            </h2>
            <p className="text-zinc-400 leading-relaxed font-light">
              We utilize essential local storage tokens and anonymous telemetry strictly to preserve your user session, manage saved releases, and support interactive audio playback. No intrusive third-party tracking scripts are executed.
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs uppercase tracking-wider font-semibold rounded cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
