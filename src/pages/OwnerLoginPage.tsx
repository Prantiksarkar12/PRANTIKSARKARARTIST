import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, ArrowLeft, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { db } from '../services/db';

interface OwnerLoginPageProps {
  onSuccess: () => void;
  onBackToSite: () => void;
}

export const OwnerLoginPage: React.FC<OwnerLoginPageProps> = ({ onSuccess, onBackToSite }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide Owner credentials.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      try {
        // Authenticate with server-side check for OWNER authorization
        const user = db.authenticateOwner(email.trim(), password);
        setIsLoading(false);
        onSuccess();
      } catch (err: unknown) {
        setIsLoading(false);
        setError(
          err instanceof Error
            ? err.message
            : 'Access Denied: 403 Forbidden. Owner privileges required.'
        );
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white flex items-center justify-center p-4 sm:p-6 relative">
      {/* High-security Deep Gold / Red Ambient Background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-rose-600/10 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[#0a0a0f] border border-rose-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-inner shadow-rose-950/60">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] tracking-[0.3em] text-rose-400 font-bold uppercase block mb-1">
              Highest Security Level
            </span>
            <h1 className="font-display font-black text-2xl text-white tracking-tight uppercase">
              Owner Console
            </h1>
          </div>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Primary Artist & Root Administrative authentication. Governs all project instances, domains, and global configuration.
          </p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-lg text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
              Owner Account Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prantiksarkarartist@gmail.com"
                className="w-full pl-3.5 pr-9 py-2.5 bg-zinc-950 border border-white/10 rounded-lg focus:border-rose-500 focus:outline-hidden text-white placeholder:text-zinc-600 transition-colors"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
              Master Password / Security Key
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-3.5 pr-9 py-2.5 bg-zinc-950 border border-white/10 rounded-lg focus:border-rose-500 focus:outline-hidden text-white placeholder:text-zinc-600 transition-colors"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-extrabold uppercase tracking-widest text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/60"
          >
            {isLoading ? (
              <span className="animate-pulse">Verifying Root Ownership...</span>
            ) : (
              <>
                <span>Sign In as Platform Owner</span>
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

          <div className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
            <Sparkles className="w-3 h-3" />
            <span>ROOT OWNER</span>
          </div>
        </div>
      </div>
    </div>
  );
};
