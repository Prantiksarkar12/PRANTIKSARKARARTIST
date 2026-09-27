import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { db } from '../../services/db';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = db.subscribeNewsletter(email);
      setStatus('success');
      setMessage(res.message);
      setEmail('');
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Subscription error. Please try again.');
    }
  };

  return (
    <section className="py-20 bg-[#09090c] border-t border-white/5 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="w-12 h-12 rounded-full bg-rose-950/40 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <Mail className="w-5 h-5" />
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-rose-500 font-bold">
            Direct Artist Dispatch
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight uppercase">
            Stay Updated
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Subscribe for official release dates, ticket presales, music videos, and private subscriber transmissions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-3.5 bg-zinc-950 border border-white/15 focus:border-rose-500 focus:outline-hidden text-sm text-white placeholder:text-zinc-600 rounded-sm"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              <span>Subscribe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {status === 'success' && (
            <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded text-xs text-emerald-400 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-4 p-3 bg-rose-950/40 border border-rose-500/30 rounded text-xs text-rose-400 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <p className="text-[11px] text-zinc-600 mt-3">
            No spam. You can unsubscribe at any time with a single click.
          </p>
        </form>
      </div>
    </section>
  );
};
