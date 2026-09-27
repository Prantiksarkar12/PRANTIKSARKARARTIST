import React from 'react';
import { SiteSettings } from '../../types';

interface FooterProps {
  settings: SiteSettings;
  onNavigate: (route: string) => void;
  onOpenLegal: (type: 'privacy' | 'terms' | 'cookies') => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate, onOpenLegal }) => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { key: 'spotify', label: 'Spotify', url: settings.social_links.spotify },
    { key: 'youtube', label: 'YouTube', url: settings.social_links.youtube },
    { key: 'apple_music', label: 'Apple Music', url: settings.social_links.apple_music },
    { key: 'jiosaavn', label: 'JioSaavn', url: settings.social_links.jiosaavn },
    { key: 'instagram', label: 'Instagram', url: settings.social_links.instagram },
    { key: 'x', label: 'X (Twitter)', url: settings.social_links.x },
  ].filter((item) => Boolean(item.url));

  return (
    <footer className="bg-[#050507] border-t border-white/10 text-zinc-400 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="font-display font-extrabold text-2xl text-white tracking-tight uppercase">
            {settings.artist_name}
          </h2>
          <p className="text-xs uppercase tracking-widest text-rose-500 font-semibold">
            {settings.artist_title}
          </p>
          <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
            {settings.tagline}
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            {socialLinks.map((s) => (
              <a
                key={s.key}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Navigation Column */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-200">
            Navigation
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors cursor-pointer">
                Home
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/music')} className="hover:text-white transition-colors cursor-pointer">
                Music & Discography
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/listen')} className="hover:text-white transition-colors cursor-pointer text-rose-400 font-medium">
                Listen Everywhere (150+)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/videos')} className="hover:text-white transition-colors cursor-pointer">
                Videos & Visuals
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/posts')} className="hover:text-white transition-colors cursor-pointer">
                Posts & Stories
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/press')} className="hover:text-white transition-colors cursor-pointer">
                Press & Media
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/events')} className="hover:text-white transition-colors cursor-pointer">
                Events & Live
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/gallery')} className="hover:text-white transition-colors cursor-pointer">
                Gallery
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/about')} className="hover:text-white transition-colors cursor-pointer">
                About The Artist
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/contact')} className="hover:text-white transition-colors cursor-pointer">
                Booking & Contact
              </button>
            </li>
          </ul>
        </div>

        {/* Media & Press Column */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-200">
            Media & Inquiries
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <button onClick={() => onNavigate('/epk')} className="hover:text-white transition-colors cursor-pointer text-rose-400 font-semibold">
                Electronic Press Kit (EPK)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/press')} className="hover:text-white transition-colors cursor-pointer">
                Press & Coverage
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/contact')} className="hover:text-white transition-colors cursor-pointer">
                Booking Inquiries
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/gallery')} className="hover:text-white transition-colors cursor-pointer">
                Official Photo Gallery
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/about')} className="hover:text-white transition-colors cursor-pointer">
                Biography & Credits
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <p>© {currentYear} {settings.artist_name}. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <button onClick={() => onOpenLegal('privacy')} className="hover:text-zinc-300 transition-colors cursor-pointer">
            Privacy Policy
          </button>
          <button onClick={() => onOpenLegal('terms')} className="hover:text-zinc-300 transition-colors cursor-pointer">
            Terms of Service
          </button>
          <button onClick={() => onOpenLegal('cookies')} className="hover:text-zinc-300 transition-colors cursor-pointer">
            Cookie Policy
          </button>
        </div>
      </div>
    </footer>
  );
};
