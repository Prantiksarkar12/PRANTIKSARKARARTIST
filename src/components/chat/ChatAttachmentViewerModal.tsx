import React from 'react';
import { X, Download, FileText, Music, Film, ExternalLink } from 'lucide-react';
import { ChatAttachment } from '../../types';

interface ChatAttachmentViewerModalProps {
  attachment: ChatAttachment | null;
  onClose: () => void;
}

export const ChatAttachmentViewerModal: React.FC<ChatAttachmentViewerModalProps> = ({
  attachment,
  onClose,
}) => {
  if (!attachment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-zinc-900/60">
          <div className="flex items-center gap-2.5 truncate pr-4">
            {attachment.type === 'image' && <Film className="w-4 h-4 text-rose-400 shrink-0" />}
            {attachment.type === 'audio' && <Music className="w-4 h-4 text-emerald-400 shrink-0" />}
            {attachment.type === 'document' && <FileText className="w-4 h-4 text-blue-400 shrink-0" />}
            <span className="text-xs font-bold text-white uppercase truncate">{attachment.name}</span>
            {attachment.size_bytes && (
              <span className="text-[10px] text-zinc-500 font-mono">
                ({(attachment.size_bytes / (1024 * 1024)).toFixed(2)} MB)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {attachment.url && attachment.url !== '#' && (
              <a
                href={attachment.url}
                download={attachment.name}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="p-6 flex-1 flex items-center justify-center overflow-auto bg-black/40 min-h-[350px]">
          {attachment.type === 'image' && (
            <img
              src={attachment.url}
              alt={attachment.name}
              className="max-h-[70vh] max-w-full rounded-lg object-contain border border-white/5 shadow-2xl"
              onError={(e) => {
                // fallback placeholder
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect fill="%23111" width="600" height="400"/><text fill="%23666" x="50%" y="50%" font-size="20" text-anchor="middle" font-family="sans-serif">Image Preview Unavailable</text></svg>';
              }}
            />
          )}

          {attachment.type === 'video' && (
            <video
              src={attachment.url}
              controls
              autoPlay
              className="max-h-[70vh] max-w-full rounded-lg shadow-2xl"
            >
              Your browser does not support HTML5 video.
            </video>
          )}

          {attachment.type === 'audio' && (
            <div className="p-8 bg-zinc-900 border border-white/10 rounded-2xl text-center space-y-4 max-w-md w-full">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <Music className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{attachment.name}</h4>
                <p className="text-xs text-zinc-400 mt-0.5">High-fidelity Studio Audio Asset</p>
              </div>
              <audio src={attachment.url} controls className="w-full mt-4" />
            </div>
          )}

          {attachment.type === 'document' && (
            <div className="p-8 bg-zinc-900 border border-white/10 rounded-2xl text-center space-y-4 max-w-md w-full">
              <div className="w-16 h-16 rounded-full bg-blue-950 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{attachment.name}</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Official Document / Asset Package</p>
              </div>
              {attachment.url && attachment.url !== '#' ? (
                <a
                  href={attachment.url}
                  download={attachment.name}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Document</span>
                </a>
              ) : (
                <p className="text-xs text-zinc-500 italic">Embedded document record</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
