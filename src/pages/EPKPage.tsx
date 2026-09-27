import React from 'react';
import { Download, FileText, Music, MapPin, Mail, Calendar, ExternalLink } from 'lucide-react';
import { SiteSettings, EPKFile } from '../types';

interface EPKPageProps {
  settings: SiteSettings;
  epkFiles: EPKFile[];
  onOpenBooking: () => void;
}

export const EPKPage: React.FC<EPKPageProps> = ({ settings, epkFiles, onOpenBooking }) => {
  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-500 font-bold">
            Industry & Press Resource
          </p>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-white uppercase tracking-tight">
            Electronic Press Kit (EPK)
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto font-light">
            Official promotional assets, technical riders, artist biography, and high-resolution media for festival promoters, event curators, and music journalists.
          </p>
        </div>

        {/* Quick Facts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-zinc-950 border border-white/10 rounded-xl space-y-2">
            <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Artist Name</span>
            <p className="font-display font-bold text-xl text-white uppercase">{settings.artist_name}</p>
            <p className="text-xs text-rose-400 font-semibold">{settings.artist_title}</p>
          </div>

          <div className="p-6 bg-zinc-950 border border-white/10 rounded-xl space-y-2">
            <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Location & Origin</span>
            <p className="font-display font-bold text-xl text-white uppercase">{settings.based_in}</p>
            <p className="text-xs text-zinc-400">Available for domestic & international tour dates</p>
          </div>

          <div className="p-6 bg-zinc-950 border border-white/10 rounded-xl space-y-2">
            <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Genre Signature</span>
            <p className="font-display font-bold text-xl text-white uppercase">{settings.genres.join(' / ')}</p>
            <p className="text-xs text-zinc-400">Lyrical Hip Hop • Desi Contemporary</p>
          </div>
        </div>

        {/* Official Bio */}
        <div className="p-8 bg-[#0b0b10] border border-white/10 rounded-xl space-y-4">
          <h2 className="font-display font-bold text-xl text-white uppercase tracking-tight">
            Official Press Biography
          </h2>
          <div className="space-y-3 text-sm text-zinc-300 leading-relaxed font-light">
            <p>{settings.extended_bio || settings.bio}</p>
          </div>
        </div>

        {/* Downloadable Assets */}
        <div className="space-y-4">
          <h2 className="font-display font-bold text-xl text-white uppercase tracking-tight">
            Downloadable Press Resources
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {epkFiles.map((file) => (
              <div
                key={file.id}
                className="p-5 bg-zinc-950 border border-white/10 hover:border-white/20 rounded-xl flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-zinc-900 border border-white/10 flex items-center justify-center text-rose-500 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white uppercase">{file.title}</h3>
                    <p className="text-xs text-zinc-400">{file.category} · {file.file_size}</p>
                  </div>
                </div>

                <a
                  href={file.file_url}
                  download
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold uppercase tracking-wider text-rose-400 hover:text-rose-300 rounded flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Direct Booking CTA */}
        <div className="p-8 bg-gradient-to-r from-rose-950/40 via-zinc-950 to-zinc-950 border border-rose-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-display font-extrabold text-2xl text-white uppercase">
              Book Prantik Sarkar
            </h3>
            <p className="text-xs text-zinc-400">
              For promoter inquiries, festival slots, and direct fee quotes.
            </p>
          </div>

          <button
            onClick={onOpenBooking}
            className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-widest text-xs rounded transition-colors cursor-pointer shadow-lg shrink-0"
          >
            Submit Booking Request
          </button>
        </div>
      </div>
    </div>
  );
};
