import React, { useState } from 'react';
import { X, Mail, CheckCircle2, AlertCircle, Send, Copy, Check } from 'lucide-react';
import { db } from '../../services/db';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactEmail: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  contactEmail,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Booking & Licensing',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const departments = [
    { label: 'Booking / License', email: 'prantiksarkarartist@hotmail.com' },
    { label: 'Collaborations', email: 'prantiksarkarartist@outlook.in' },
    { label: 'Sponsorships', email: 'prantiksarkarartist@outlook.com' },
    { label: 'Promotion', email: 'prantiksarkarartist@hotmail.com' },
    { label: 'Copyright / Re-upload', email: 'prantiksarkar825@gmail.com' },
  ];

  if (!isOpen) return null;

  const handleCopy = (email: string, key: string) => {
    navigator.clipboard.writeText(email);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg('Please fill in your name, email, and message.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    try {
      db.sendMessage({
        name: formData.name,
        email: formData.email,
        subject: `[${formData.department}] ${formData.subject || 'Direct Inquiry'}`,
        message: formData.message,
      });
      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send message.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0e0e14] border border-white/15 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          aria-label="Close contact modal"
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/80 hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-widest font-mono">
            <Mail className="w-4 h-4" />
            <span>Direct Inquiries</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
            Contact Artist
          </h2>
          <p className="text-xs text-zinc-400">
            Send an instant note or use the department email addresses below.
          </p>
        </div>

        {/* Quick Email Badges */}
        <div className="p-3 rounded-lg bg-zinc-950 border border-white/10 mb-5 space-y-2">
          <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
            Direct Department Inboxes:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
            {departments.map((d) => (
              <div
                key={d.label}
                className="flex items-center justify-between p-1.5 rounded bg-zinc-900/80 border border-white/5"
              >
                <div className="truncate pr-1">
                  <span className="text-white font-medium block truncate text-[10px] uppercase font-mono">{d.label}</span>
                  <a href={`mailto:${d.email}`} className="text-rose-400 hover:underline truncate block text-[10px]">
                    {d.email}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(d.email, d.label)}
                  className="p-1 text-zinc-400 hover:text-white shrink-0 cursor-pointer"
                  title="Copy email"
                >
                  {copiedKey === d.label ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {status === 'success' ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-xl text-white uppercase">
              Message Received
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
              Thank you for reaching out. Your transmission has been logged into the artist portal inbox.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-xs font-bold uppercase tracking-widest text-white rounded cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {status === 'error' && (
              <div className="p-3 bg-rose-950/50 border border-rose-500/30 rounded text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
                Target Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded focus:border-rose-500 focus:outline-hidden text-white"
              >
                {departments.map((d) => (
                  <option key={d.label} value={d.label}>
                    {d.label} ({d.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded focus:border-rose-500 focus:outline-hidden text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
                Your Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded focus:border-rose-500 focus:outline-hidden text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Collaboration, Media Inquiry, or Feedback"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded focus:border-rose-500 focus:outline-hidden text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
                Message *
              </label>
              <textarea
                rows={3}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your note here..."
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded focus:border-rose-500 focus:outline-hidden text-white resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-widest text-xs rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{status === 'submitting' ? 'Sending...' : 'Transmit Message'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

