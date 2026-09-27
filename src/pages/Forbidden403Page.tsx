import React from 'react';
import { ShieldAlert, ArrowLeft, LayoutDashboard, LogOut } from 'lucide-react';
import { User } from '../types';
import { db } from '../services/db';

interface Forbidden403Props {
  currentUser: User | null;
  requiredRole?: string;
  attemptedRoute?: string;
  onNavigate: (route: string) => void;
  onSwitchAccount: () => void;
}

export const Forbidden403Page: React.FC<Forbidden403Props> = ({
  currentUser,
  requiredRole = 'ADMINISTRATOR',
  attemptedRoute = '/admin',
  onNavigate,
  onSwitchAccount,
}) => {
  const handleLogout = () => {
    db.logout();
    onSwitchAccount();
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-[#0d0d13] border border-rose-500/20 rounded-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden text-center space-y-6">
        {/* Glow effect */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-32 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* 403 Badge */}
        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-500 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/50">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono tracking-widest text-rose-400 font-bold uppercase bg-rose-950/40 px-3 py-1 rounded-full border border-rose-500/30">
            HTTP 403 FORBIDDEN
          </span>
          <h1 className="font-display font-black text-3xl text-white tracking-tight uppercase mt-2">
            Access Denied
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
            You do not have sufficient server-side permissions to access this restricted area ({attemptedRoute}).
          </p>
        </div>

        {currentUser && (
          <div className="p-4 bg-zinc-950/80 border border-white/10 rounded-xl text-left text-xs space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
              Authenticated Session
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span>Account:</span>
              <span className="font-medium text-white">{currentUser.email}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span>Assigned Role:</span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-rose-400 font-mono text-[11px] font-bold">
                {currentUser.role}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span>Required Role:</span>
              <span className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30">
                {requiredRole}
              </span>
            </div>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('/dashboard')}
            className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to User Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('/')}
            className="w-full sm:w-auto px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Site</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-4 py-2.5 bg-zinc-900 hover:bg-rose-950/40 border border-white/10 hover:border-rose-500/30 text-zinc-400 hover:text-rose-300 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
