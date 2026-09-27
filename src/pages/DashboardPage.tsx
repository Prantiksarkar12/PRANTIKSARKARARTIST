import React, { useState } from 'react';
import { User, Release, Video, Post, Notification } from '../types';
import { db } from '../services/db';
import { Disc, Film, BookOpen, Bell, Shield, LogOut, Heart } from 'lucide-react';

interface DashboardPageProps {
  currentUser: User | null;
  onNavigate: (route: string) => void;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser,
  onNavigate,
  onLogout,
}) => {
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="p-8 bg-zinc-950 border border-white/10 rounded-xl max-w-md space-y-4">
          <Shield className="w-8 h-8 text-rose-500 mx-auto" />
          <h2 className="font-display font-extrabold text-2xl uppercase">Access Restricted</h2>
          <p className="text-xs text-zinc-400">Please sign in to access your fan dashboard and saved tracks.</p>
          <button
            onClick={() => onNavigate('/')}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const saved = db.getSavedItems(currentUser.id);
  const notifications = db.getNotifications(currentUser.id);

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* User Banner */}
        <div className="bg-gradient-to-r from-zinc-950 via-[#101015] to-zinc-950 border border-white/10 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-xl font-black text-rose-300 font-display">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-2xl text-white uppercase">{currentUser.name}</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-rose-950/50 text-rose-400 border border-rose-500/30 rounded">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{currentUser.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(currentUser.role === 'OWNER' || currentUser.role === 'ADMIN') && (
              <button
                onClick={() => onNavigate('/admin')}
                className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider rounded transition-colors"
              >
                Admin Studio
              </button>
            )}
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-rose-400 text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Saved Items & Notifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Notifications Inbox */}
          <div className="bg-zinc-950 border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
              <Bell className="w-4 h-4" />
              <span>Official Transmissions & Alerts</span>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No new notifications in inbox.</p>
            ) : (
              <div className="space-y-2 text-xs">
                {notifications.map((n: Notification) => (
                  <div key={n.id} className="p-3 bg-zinc-900/60 border border-white/5 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{n.title}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-[11px] font-light">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Tracks & Bookmarks */}
          <div className="bg-zinc-950 border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
              <Heart className="w-4 h-4" />
              <span>Saved Catalog & Favorites</span>
            </div>

            {saved.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-xs text-zinc-400">You haven't bookmarked any tracks or videos yet.</p>
                <button
                  onClick={() => onNavigate('/music')}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold uppercase"
                >
                  Explore Music Releases →
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {saved.map((item, idx) => (
                  <div key={idx} className="p-3 bg-zinc-900/60 border border-white/5 rounded flex items-center justify-between">
                    <span className="text-white font-medium capitalize">{item.item_type}: {item.item_id}</span>
                    <span className="text-[10px] text-zinc-500">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
