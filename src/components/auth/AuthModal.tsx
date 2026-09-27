import React, { useState } from 'react';
import { X, Lock, ArrowRight, CheckCircle2, ShieldCheck, Mail, KeyRound } from 'lucide-react';
import { db } from '../../services/db';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'signup' | 'forgot';
  onNavigateToDashboard?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  onNavigateToDashboard,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleModeChange = (newMode: 'login' | 'signup' | 'forgot') => {
    setMode(newMode);
    setError('');
    setResetSent(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }

    if (mode === 'forgot') {
      setIsLoading(true);
      setTimeout(() => {
        try {
          db.requestPasswordReset(email.trim());
          setResetSent(true);
          setIsLoading(false);
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Unable to request password reset.');
          setIsLoading(false);
        }
      }, 400);
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      try {
        if (mode === 'signup') {
          // Register new Fan User (role enforced server-side as USER)
          db.registerUser({
            email: email.trim(),
            name: name.trim() || email.trim().split('@')[0],
            password: password,
          });
        } else {
          // Standard User Portal Authentication (server-authoritative DB role)
          db.authenticateUser(email.trim(), password);
        }

        setIsLoading(false);
        if (onSuccess) onSuccess();
        onClose();
        if (onNavigateToDashboard) onNavigateToDashboard();
      } catch (err: unknown) {
        setIsLoading(false);
        setError(err instanceof Error ? err.message : 'Authentication failed.');
      }
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0b0b10] border border-white/12 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Gold / Crimson Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-rose-600/10 via-amber-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-rose-900/10 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/80 hover:bg-zinc-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 mb-6 text-center relative z-10">
          <div className="w-11 h-11 rounded-full bg-zinc-900 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto shadow-inner shadow-rose-950/40">
            {mode === 'forgot' ? (
              <KeyRound className="w-5 h-5 text-amber-400" />
            ) : mode === 'signup' ? (
              <ShieldCheck className="w-5 h-5 text-rose-400" />
            ) : (
              <Lock className="w-5 h-5 text-rose-500" />
            )}
          </div>

          <div>
            <span className="text-[10px] tracking-[0.25em] text-rose-400 font-bold uppercase block mb-1">
              Official Portal
            </span>
            <h2 className="font-display font-black text-2xl text-white uppercase tracking-tight">
              {mode === 'login' && 'Login'}
              {mode === 'signup' && 'Create Fan Account'}
              {mode === 'forgot' && 'Forgot Password'}
            </h2>
          </div>

          <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
            {mode === 'login' &&
              'Access saved tracks, early tour tickets, private subscriber notes, and your personal account.'}
            {mode === 'signup' &&
              'Create your personal account to join the official community and unlock library features.'}
            {mode === 'forgot' &&
              'Enter your registered email address to receive a secure password recovery link.'}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg text-xs text-rose-400 flex items-start gap-2 animate-in fade-in">
            <span className="font-bold">•</span>
            <span>{error}</span>
          </div>
        )}

        {/* Password Reset Confirmation */}
        {resetSent && (
          <div className="mb-4 p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 space-y-1 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Reset Link Dispatched</span>
            </div>
            <p className="text-[11px] text-zinc-300">
              If an account is associated with <strong className="text-white">{email}</strong>, a secure recovery link has been generated.
            </p>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs relative z-10">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-bold uppercase tracking-wider text-[10px] flex items-center justify-between">
                <span>Your Name</span>
                <span className="text-zinc-500 text-[10px] normal-case">Required</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full px-3.5 py-2.5 bg-zinc-950/90 border border-white/10 rounded-lg focus:border-rose-500 focus:outline-hidden text-white placeholder:text-zinc-600 transition-colors"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-zinc-300 font-bold uppercase tracking-wider text-[10px] flex items-center justify-between">
              <span>Email Address</span>
              <span className="text-zinc-500 text-[10px] normal-case">Required</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-3.5 pr-9 py-2.5 bg-zinc-950/90 border border-white/10 rounded-lg focus:border-rose-500 focus:outline-hidden text-white placeholder:text-zinc-600 transition-colors"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => handleModeChange('forgot')}
                    className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-9 py-2.5 bg-zinc-950/90 border border-white/10 rounded-lg focus:border-rose-500 focus:outline-hidden text-white placeholder:text-zinc-600 transition-colors"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 disabled:opacity-50 text-white font-bold uppercase tracking-widest text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50 hover:shadow-rose-900/40"
          >
            {isLoading ? (
              <span className="animate-pulse">Authenticating...</span>
            ) : mode === 'login' ? (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : mode === 'signup' ? (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Send Reset Instructions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation Switcher */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center space-y-2 relative z-10 text-xs">
          {mode === 'login' ? (
            <div>
              <span className="text-zinc-400">Don't have an account? </span>
              <button
                type="button"
                onClick={() => handleModeChange('signup')}
                className="text-rose-400 hover:text-rose-300 font-semibold transition-colors cursor-pointer"
              >
                Sign up
              </button>
            </div>
          ) : (
            <div>
              <span className="text-zinc-400">Already have an account? </span>
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className="text-rose-400 hover:text-rose-300 font-semibold transition-colors cursor-pointer"
              >
                Sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
