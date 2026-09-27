import React, { useState } from 'react';
import { X, Calendar, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { db } from '../../services/db';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    event_type: 'Concert' as const,
    event_date: '',
    location: '',
    budget: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.event_date || !formData.location) {
      setErrorMsg('Please complete all required fields.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    try {
      db.createBooking(formData);
      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0e0e14] border border-white/15 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          aria-label="Close booking modal"
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/80 hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-widest">
            <Calendar className="w-4 h-4" />
            <span>Official Booking Inquiry</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
            Book Performance
          </h2>
          <p className="text-xs text-zinc-400">
            Submit event parameters directly to management for festivals, campus shows, and venue bookings.
          </p>
        </div>

        {status === 'success' ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-xl text-white uppercase">
              Booking Inquiry Transmitted
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
              Your performance inquiry has been registered in the official booking database. Management will review rider requirements and respond via email.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-xs font-bold uppercase tracking-widest text-white rounded cursor-pointer"
              >
                Close Window
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Promoter or organizer name"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded focus:border-rose-500 focus:outline-hidden text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@agency.com"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded focus:border-rose-500 focus:outline-hidden text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded focus:border-rose-500 focus:outline-hidden text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
                  Organization / Agency
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Festival, Club, or College"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded focus:border-rose-500 focus:outline-hidden text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
                  Event Type *
                </label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded focus:border-rose-500 focus:outline-hidden text-white"
                >
                  <option value="Concert">Concert / Headline Show</option>
                  <option value="Festival">Music Festival</option>
                  <option value="College Fest">College / University Fest</option>
                  <option value="Club Show">Club / Nightlife Appearance</option>
                  <option value="Corporate">Corporate / Private</option>
                  <option value="Collaboration">Studio Collaboration</option>
                  <option value="Other">Other Engagement</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
                  Target Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded focus:border-rose-500 focus:outline-hidden text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
                  City & Venue Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Mumbai / Kolkata / Bangalore"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded focus:border-rose-500 focus:outline-hidden text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
                  Budget Range / Offer (Optional)
                </label>
                <input
                  type="text"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="e.g. ₹ 2,00,000 / $ 3,000"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded focus:border-rose-500 focus:outline-hidden text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
                Event Scope & Performance Details
              </label>
              <textarea
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Include set duration, stage specs, backline availability, or special requests..."
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded focus:border-rose-500 focus:outline-hidden text-white resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-widest text-xs rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{status === 'submitting' ? 'Transmitting Booking...' : 'Submit Booking Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
