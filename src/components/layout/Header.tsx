import React, { useState, useEffect } from 'react';
import { Search, User as UserIcon, Menu, X, ShieldAlert, LogOut, MessageSquare, Sparkles } from 'lucide-react';
import { User } from '../../types';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  currentUser: User | null;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  currentUser,
  onOpenSearch,
  onOpenAuth,
  onLogout,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Music', route: '/music' },
    { label: 'Listen Everywhere', route: '/listen' },
    { label: 'Videos', route: '/videos' },
    { label: 'Posts', route: '/posts' },
    { label: 'Press', route: '/press' },
    { label: 'Events', route: '/events' },
    { label: 'Gallery', route: '/gallery' },
    { label: 'About', route: '/about' },
    { label: 'Contact', route: '/contact' },
  ];

  const handleNavClick = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const isPrivileged = currentUser && (currentUser.role === 'OWNER' || currentUser.role === 'ADMIN' || currentUser.role === 'EDITOR');

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#070709]/90 backdrop-blur-md border-b border-white/10 shadow-2xl py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => handleNavClick('/')}
          className="text-left font-display font-extrabold text-lg sm:text-xl tracking-tight text-white hover:text-rose-400 transition-colors uppercase cursor-pointer"
        >
          Prantik Sarkar
        </button>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.route;
            return (
              <button
                key={link.route}
                onClick={() => handleNavClick(link.route)}
                className={`text-xs xl:text-sm font-medium tracking-wide uppercase transition-colors cursor-pointer relative py-1 ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-600 animate-in fade-in duration-300" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Account */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PRANTIK AI Public Button */}
          <button
            onClick={() => handleNavClick('/ai')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              currentRoute === '/ai' || currentRoute === '/chat'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white border-transparent shadow-lg shadow-rose-950/50'
                : 'bg-zinc-950/80 hover:bg-zinc-900 text-zinc-200 border-rose-500/30 hover:border-amber-400/50'
            }`}
            title="PRANTIK AI: Music, Coding, Maths, Research"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">PRANTIK AI</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* In-App PWA Install Button */}
          <PWAInstallButton variant="header" />

          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            aria-label="Search catalogue"
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            title="Search releases, videos, press (Cmd+K)"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* User Account State */}
          {currentUser ? (
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => handleNavClick('/dashboard/chat')}
                className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="PRANTIK Chat"
              >
                <MessageSquare className="w-4 h-4 text-rose-400" />
              </button>

              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-[10px] font-bold text-rose-300">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline-block max-w-[100px] truncate">{currentUser.name}</span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 top-full w-56 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="font-semibold text-white truncate">{currentUser.name}</p>
                    <p className="text-zinc-400 truncate text-[11px]">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-400">
                      <span>Role:</span>
                      <span className="text-rose-400 font-semibold">{currentUser.role}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleNavClick('/dashboard')}
                    className="w-full text-left px-3 py-2 text-zinc-300 hover:text-white hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    User Dashboard
                  </button>

                  <button
                    onClick={() => handleNavClick('/dashboard/chat')}
                    className="w-full text-left px-3 py-2 text-rose-300 hover:text-white hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                    <span>PRANTIK Chat Grid</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('/dashboard/ai')}
                    className="w-full text-left px-3 py-2 text-rose-300 hover:text-white hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    PRANTIK AI (Free 24h)
                  </button>

                  <button
                    onClick={() => handleNavClick('/dashboard/wallet')}
                    className="w-full text-left px-3 py-2 text-amber-300 hover:text-white hover:bg-amber-950/40 flex items-center gap-2 cursor-pointer"
                  >
                    Wallet & AI Coins
                  </button>

                  <button
                    onClick={() => handleNavClick('/dashboard/rewards')}
                    className="w-full text-left px-3 py-2 text-purple-300 hover:text-white hover:bg-purple-950/40 flex items-center gap-2 cursor-pointer"
                  >
                    Daily Rewards & Spin
                  </button>

                  {isPrivileged && (
                    <button
                      onClick={() => handleNavClick('/admin')}
                      className="w-full text-left px-3 py-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Admin Studio
                    </button>
                  )}

                  <button
                    onClick={() => handleNavClick('/epk')}
                    className="w-full text-left px-3 py-2 text-zinc-300 hover:text-white hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                  >
                    Electronic Press Kit (EPK)
                  </button>

                  <div className="border-t border-white/10 my-1" />

                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold tracking-wider uppercase text-white bg-zinc-900 hover:bg-zinc-800 border border-white/15 rounded-md hover:border-white/30 transition-all cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 lg:hidden text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-zinc-950/95 backdrop-blur-2xl border-b border-white/10 px-6 py-6 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.route}
                onClick={() => handleNavClick(link.route)}
                className={`text-left text-sm font-medium tracking-wide uppercase py-2 cursor-pointer ${
                  currentRoute === link.route ? 'text-rose-400 font-semibold' : 'text-zinc-300 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              <button
                onClick={() => handleNavClick('/ai')}
                className="text-left text-sm uppercase tracking-wider text-amber-300 hover:text-white font-bold py-1.5 flex items-center gap-2 cursor-pointer bg-zinc-900/60 p-2.5 rounded-lg border border-amber-500/30"
              >
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>PRANTIK AI Assistant (Gemini)</span>
              </button>

              <PWAInstallButton variant="mobile" />

              <button
                onClick={() => handleNavClick('/epk')}
                className="text-left text-xs uppercase tracking-wider text-zinc-400 hover:text-white py-1 cursor-pointer"
              >
                Official EPK (Press Kit)
              </button>
              {isPrivileged && (
                <button
                  onClick={() => handleNavClick('/admin')}
                  className="text-left text-xs uppercase tracking-wider text-amber-400 hover:text-amber-300 font-semibold py-1 flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Admin Studio
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
