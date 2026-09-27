import React from 'react';
import { Calendar, Mail, ArrowRight } from 'lucide-react';
import { SiteSettings } from '../../types';

interface ContactCTAProps {
  settings: SiteSettings;
  onOpenBooking: () => void;
  onOpenContact: () => void;
}

export const ContactCTA: React.FC<ContactCTAProps> = ({
  settings,
  onOpenBooking,
  onOpenContact,
}) => {
  return (
    <section className="py-24 bg-[#070709] border-t border-white/5 relative overflow-hidden">
      {/* Cinematic subtle crimson background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-rose-950/15 via-transparent to-amber-950/10 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-500 font-bold">
            Live Booking & Creative Collaboration
          </p>
          <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-tight uppercase">
            Let's Work Together
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto font-light leading-relaxed">
            Available for headlining festival sets, club tours, college appearances, brand collaborations, and press interviews.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onOpenBooking}
            className="w-full sm:w-auto px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold tracking-widest uppercase rounded-sm shadow-xl shadow-rose-950/40 hover:shadow-rose-900/60 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Performance</span>
          </button>

          <button
            onClick={onOpenContact}
            className="w-full sm:w-auto px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs sm:text-sm font-bold tracking-widest uppercase rounded-sm border border-white/15 hover:border-white/30 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>General Inquiries</span>
          </button>
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
          <span>Direct Booking: <strong className="text-zinc-400 font-mono">{settings.booking_email}</strong></span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span>General: <strong className="text-zinc-400 font-mono">{settings.contact_email}</strong></span>
        </div>
      </div>
    </section>
  );
};
