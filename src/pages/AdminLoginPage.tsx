import React, { useState } from 'react';
import { ShieldAlert, Lock, ArrowRight, ArrowLeft, Mail, KeyRound, AlertTriangle } from 'lucide-react';
import { db } from '../services/db';
import { UserRole } from '../types';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onBackToSite: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess, onBackToSite }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide administrative credentials.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      try {
        // Authenticate with server-side check for administrative authorization
        const user = db.authenticateAdmin(email.trim(), password);
        setIsLoading(false);
        onSuccess();
      } catch (err: unknown) {
        setIsLoading(false);
        setError(
          err instanceof Error
            ? err.message
            : 'Access Denied: You do not have administrative authorization.'
        );
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center p-4 sm:p-6 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[#0c0c12] border border-amber-500/20 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] tracking-[0.25em] text-amber-400 font-bold uppercase block mb-1">
              Restricted Console
            </span>
            <h1 className="font-display font-black text-2xl text-white tracking-tight uppercase">
              Admin Studio Login
            </h1>
          </div>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Authorized management access for platform operations, content distribution, and infrastructure control.
          </p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-3 bg-rose-950/50 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
              Admin Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@prantiksarkar.com"
                className="w-full pl-3.5 pr-9 py-2.5 bg-zinc-950 border border-white/10 rounded-lg focus:border-amber-500 focus:outline-hidden text-white placeholder:text-zinc-600 transition-colors"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
              Security Key / Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-3.5 pr-9 py-2.5 bg-zinc-950 border border-white/10 rounded-lg focus:border-amber-500 focus:outline-hidden text-white placeholder:text-zinc-600 transition-colors"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:from-amber-700 text-black font-extrabold uppercase tracking-widest text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-950/40"
          >
            {isLoading ? (
              <span className="animate-pulse">Validating RBAC Credentials...</span>
            ) : (
              <>
                <span>Authenticate Admin Session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
          <button
            onClick={onBackToSite}
            className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Site</span>
          </button>

          <span className="text-[10px] text-zinc-600 font-mono">RBAC-PROTECTED</span>
        </div>
      </div>
    </div>
  );
};
