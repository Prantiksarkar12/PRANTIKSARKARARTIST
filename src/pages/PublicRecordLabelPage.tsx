import React, { useState, useEffect } from 'react';
import {
  Disc,
  ShieldCheck,
  Lock,
  ArrowRight,
  ExternalLink,
  Users,
  Music,
  Video as VideoIcon,
  Tv,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  FileText,
  Mail,
  Send,
  Search,
  Filter,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { labelService, OFFICIAL_LABEL_EMAIL } from '../services/labelInviteService';
import { LabelInvitation, LabelApplication, DistributionRelease } from '../types';
import { RequestInvitationForm } from '../components/label/RequestInvitationForm';

interface PublicRecordLabelPageProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenAuth?: () => void;
}

export const PublicRecordLabelPage: React.FC<PublicRecordLabelPageProps> = ({
  currentRoute,
  onNavigate,
  onOpenAuth,
}) => {
  const {
    labelCapacity,
    publicLabelArtists,
    publicDistributionReleases,
    labelPricing,
  } = useRealtimeData();

  // Route parsing
  const cleanRoute = currentRoute.replace(/\/+$/, '') || '/label';

  // Sub-routes detection
  const isInviteApply = cleanRoute.includes('/label/invite/') && cleanRoute.endsWith('/apply');
  const isInviteLanding = cleanRoute.startsWith('/label/invite/') && !cleanRoute.endsWith('/apply');
  const inviteTokenFromUrl = isInviteLanding
    ? cleanRoute.replace('/label/invite/', '').split('/')[0]
    : isInviteApply
    ? cleanRoute.replace('/label/invite/', '').replace('/apply', '').split('/')[0]
    : '';

  // Local state for token lookup box on /label/invitation
  const [tokenInput, setTokenInput] = useState('');
  const [tokenLookupError, setTokenLookupError] = useState('');

  // Token validation state for /label/invite/:token
  const [validatedInvite, setValidatedInvite] = useState<{
    valid: boolean;
    reason?: string;
    invitation?: LabelInvitation;
    capacity_available: boolean;
  } | null>(null);

  useEffect(() => {
    if (inviteTokenFromUrl) {
      const res = labelService.validateInvitation(inviteTokenFromUrl);
      setValidatedInvite(res);
    }
  }, [inviteTokenFromUrl]);

  // Application Form State for /label/invite/:token/apply
  const [appForm, setAppForm] = useState({
    artist_name: '',
    legal_name: '',
    email: '',
    phone: '',
    country: 'India',
    city: '',
    genre: 'Hip Hop / Rap',
    artist_bio: '',
    youtube_link: '',
    spotify_link: '',
    apple_link: '',
    instagram_link: '',
    other_link: '',
    music_experience: '',
    previous_releases: '',
    portfolio: '',
    release_info: '',
    additional_notes: '',
    agreement_consent: false,
    privacy_consent: false,
  });

  const [submittingApp, setSubmittingApp] = useState(false);
  const [submittedAppSuccess, setSubmittedAppSuccess] = useState<LabelApplication | null>(null);
  const [appError, setAppError] = useState('');

  const handleLookupToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setTokenLookupError('Please enter an invitation token.');
      return;
    }
    const val = labelService.validateInvitation(tokenInput.trim());
    if (!val.valid) {
      setTokenLookupError(val.reason || 'This invitation is invalid or has expired.');
    } else {
      setTokenLookupError('');
      onNavigate(`/label/invite/${tokenInput.trim()}`);
    }
  };

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppError('');

    if (!appForm.agreement_consent || !appForm.privacy_consent) {
      setAppError('You must review and consent to the artist agreement and privacy terms.');
      return;
    }

    if (!appForm.artist_name || !appForm.legal_name || !appForm.email) {
      setAppError('Please fill in all mandatory legal name, artist name, and email fields.');
      return;
    }

    setSubmittingApp(true);
    try {
      const res = labelService.submitApplication({
        invitation_token: inviteTokenFromUrl,
        artist_name: appForm.artist_name,
        legal_name: appForm.legal_name,
        email: appForm.email,
        phone: appForm.phone,
        country: appForm.country,
        city: appForm.city,
        genre: appForm.genre,
        artist_bio: appForm.artist_bio,
        social_links: {
          youtube: appForm.youtube_link,
          spotify: appForm.spotify_link,
          apple_music: appForm.apple_link,
          instagram: appForm.instagram_link,
          other: appForm.other_link,
        },
        music_experience: appForm.music_experience,
        previous_releases: appForm.previous_releases,
        portfolio: appForm.portfolio,
        release_info: appForm.release_info,
        additional_notes: appForm.additional_notes,
        agreement_consent: appForm.agreement_consent,
        privacy_consent: appForm.privacy_consent,
      });

      if (res.success && res.application) {
        setSubmittedAppSuccess(res.application);
      } else {
        setAppError(res.error || 'Failed to submit application.');
      }
    } catch (err: unknown) {
      setAppError(err instanceof Error ? err.message : 'Application submission error.');
    } finally {
      setSubmittingApp(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 selection:bg-rose-600 selection:text-white">
      {/* Label Sub-Navigation Header */}
      <header className="sticky top-16 z-30 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-400 flex items-center justify-center font-bold">
              <Disc className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm text-white tracking-wider uppercase">
                  PRANTIK SARKAR ARTIST RECORD
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  INVITE-ONLY
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">Curated Independent Record Label & Distribution</p>
            </div>
          </div>

          {/* Real Capacity Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1 rounded-full bg-zinc-950 border border-white/10 text-xs font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-400">ROSTER CAPACITY:</span>
              <strong className="text-white">
                {labelCapacity.current_active_artists} / {labelCapacity.maximum_active_artists}
              </strong>
            </div>

            <nav className="flex items-center gap-1 text-xs font-semibold overflow-x-auto no-scrollbar">
              {[
                { path: '/label', label: 'Overview' },
                { path: '/label/request-invitation', label: 'Request Invitation' },
                { path: '/label/invitation', label: 'I Have An Invite' },
                { path: '/label/artists', label: 'Artists' },
                { path: '/label/releases', label: 'Releases' },
                { path: '/label/services', label: 'Services' },
                { path: '/label/distribution', label: 'Distribution' },
                { path: '/label/about', label: 'About' },
                { path: '/label/contact', label: 'Contact' },
                { path: '/label/privacy', label: 'Privacy' },
                { path: '/label/terms', label: 'Terms' },
              ].map((item) => {
                const isActive = cleanRoute === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => onNavigate(item.path)}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-rose-600 text-white font-bold'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Body per Route */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        
        {/* ==================================================== */}
        {/* ROUTE: /label/request-invitation (REQUEST INVITATION MULTI-SECTION FORM) */}
        {/* ==================================================== */}
        {cleanRoute === '/label/request-invitation' && (
          <RequestInvitationForm onNavigate={onNavigate} />
        )}

        {/* ==================================================== */}
        {/* ROUTE: /label/invite/[token]/apply (PRIVATE APPLICATION FORM) */}
        {/* ==================================================== */}
        {isInviteApply && (
          <div className="max-w-3xl mx-auto space-y-6">
            {!validatedInvite?.valid ? (
              <div className="p-8 bg-zinc-950 border border-red-500/30 rounded-2xl text-center space-y-4">
                <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
                <h2 className="font-display font-black text-xl text-white uppercase">Invalid Application Access</h2>
                <p className="text-xs text-zinc-400">This invitation is invalid or has expired.</p>
                <button
                  onClick={() => onNavigate('/label/invitation')}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Verify Another Invitation
                </button>
              </div>
            ) : submittedAppSuccess ? (
              <div className="p-8 bg-[#0b0b12] border border-emerald-500/40 rounded-2xl text-center space-y-5 shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    APPLICATION RECEIVED
                  </span>
                  <h2 className="font-display font-black text-2xl text-white uppercase mt-2">
                    Application Dossier Registered
                  </h2>
                  <p className="font-mono text-rose-400 font-bold text-sm">
                    Application ID: #{submittedAppSuccess.id}
                  </p>
                </div>
                <p className="text-xs text-zinc-300 max-w-lg mx-auto leading-relaxed">
                  Thank you, <strong className="text-white">{submittedAppSuccess.artist_name}</strong>. Your private application dossier has been delivered to the Record Label Board. A confirmation dispatch was recorded to <strong className="text-white">{submittedAppSuccess.email}</strong>.
                </p>
                <div className="p-4 bg-zinc-950 rounded-xl border border-white/5 text-[11px] text-zinc-400 max-w-md mx-auto space-y-1 text-left">
                  <div>• Status: <strong className="text-amber-400 font-mono">UNDER REVIEW</strong></div>
                  <div>• Roster Slots: Subject to active 40-artist capacity check at review.</div>
                  <div>• Notice: We will contact you directly regarding agreement execution.</div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('/label')}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg cursor-pointer"
                  >
                    Back to Record Label
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#0b0b12] border border-white/15 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="border-b border-white/10 pb-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      INVITATION VALIDATED
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">Token: {inviteTokenFromUrl}</span>
                  </div>
                  <h2 className="font-display font-black text-2xl text-white uppercase tracking-tight">
                    Private Artist Application
                  </h2>
                  <p className="text-xs text-zinc-400">
                    PRANTIK SARKAR ARTIST RECORD • Strict Curatorial Onboarding Dossier
                  </p>
                </div>

                {appError && (
                  <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 text-xs rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{appError}</span>
                  </div>
                )}

                <form onSubmit={handleApplicationSubmit} className="space-y-6 text-xs">
                  {/* Artist Info */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-white uppercase text-[11px] tracking-wider text-rose-400 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      <span>1. Artist Identity & Legal Details</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-zinc-400 font-semibold block mb-1">Artist / Stage Name *</label>
                        <input
                          type="text"
                          required
                          value={appForm.artist_name}
                          onChange={(e) => setAppForm({ ...appForm, artist_name: e.target.value })}
                          placeholder="e.g. Raw Vibes"
                          className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-lg text-white text-xs focus:outline-none focus:border-rose-500"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 font-semibold block mb-1">Full Legal Name *</label>
                        <input
                          type="text"
                          required
                          value={appForm.legal_name}
                          onChange={(e) => setAppForm({ ...appForm, legal_name: e.target.value })}
                          placeholder="Official legal name for contract"
                          className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-lg text-white text-xs focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-zinc-400 font-semibold block mb-1">Contact Email *</label>
                        <input
                          type="email"
                          required
                          value={appForm.email}
                          onChange={(e) => setAppForm({ ...appForm, email: e.target.value })}
                          placeholder="artist@example.com"
                          className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-lg text-white text-xs focus:outline-none focus:border-rose-500"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 font-semibold block mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={appForm.phone}
                          onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })}
                          placeholder="+91..."
                          className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-lg text-white text-xs focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-zinc-400 font-semibold block mb-1">Country</label>
                        <input
                          type="text"
                          value={appForm.country}
                          onChange={(e) => setAppForm({ ...appForm, country: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-lg text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 font-semibold block mb-1">City / Region</label>
                        <input
                          type="text"
                          value={appForm.city}
                          onChange={(e) => setAppForm({ ...appForm, city: e.target.value })}
                          placeholder="e.g. Kolkata / Mumbai"
                          className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-lg text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 font-semibold block mb-1">Primary Genre</label>
                        <input
                          type="text"
                          value={appForm.genre}
                          onChange={(e) => setAppForm({ ...appForm, genre: e.target.value })}
                          placeholder="Hip Hop, Rap, Trap..."
                          className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-lg text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-zinc-400 font-semibold block mb-1">Artist Biography & Vision *</label>
                      <textarea
                        required
                        rows={3}
                        value={appForm.artist_bio}
                        onChange={(e) => setAppForm({ ...appForm, artist_bio: e.target.value })}
                        placeholder="Tell the label about your sound, musical vision, and goals..."
                        className="w-full p-3 bg-zinc-900 border border-white/15 rounded-lg text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Social & Streaming Links */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <h3 className="font-bold text-white uppercase text-[11px] tracking-wider text-rose-400 flex items-center gap-2">
                      <Music className="w-3.5 h-3.5" />
                      <span>2. Streaming Profiles & Portfolio</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-zinc-400 font-semibold block mb-1">YouTube Channel URL</label>
                        <input
                          type="url"
                          value={appForm.youtube_link}
                          onChange={(e) => setAppForm({ ...appForm, youtube_link: e.target.value })}
                          placeholder="https://youtube.com/..."
                          className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-lg text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 font-semibold block mb-1">Spotify Artist URL</label>
                        <input
                          type="url"
                          value={appForm.spotify_link}
                          onChange={(e) => setAppForm({ ...appForm, spotify_link: e.target.value })}
                          placeholder="https://open.spotify.com/artist/..."
                          className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-lg text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-zinc-400 font-semibold block mb-1">Instagram Handle / URL</label>
                        <input
                          type="text"
                          value={appForm.instagram_link}
                          onChange={(e) => setAppForm({ ...appForm, instagram_link: e.target.value })}
                          placeholder="https://instagram.com/..."
                          className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-lg text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 font-semibold block mb-1">Portfolio / Audio Demo Link</label>
                        <input
                          type="url"
                          value={appForm.portfolio}
                          onChange={(e) => setAppForm({ ...appForm, portfolio: e.target.value })}
                          placeholder="Google Drive / Dropbox / SoundCloud private demo..."
                          className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-lg text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-zinc-400 font-semibold block mb-1">Upcoming Release Information</label>
                      <textarea
                        rows={2}
                        value={appForm.release_info}
                        onChange={(e) => setAppForm({ ...appForm, release_info: e.target.value })}
                        placeholder="Single / EP / Album title, planned dates, master recording status..."
                        className="w-full p-3 bg-zinc-900 border border-white/15 rounded-lg text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Legal Consent */}
                  <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 space-y-3">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appForm.agreement_consent}
                        onChange={(e) => setAppForm({ ...appForm, agreement_consent: e.target.checked })}
                        className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-zinc-300 text-[11px] leading-relaxed">
                        I confirm that all master recordings and creative materials submitted are original, properly cleared, and I agree to the 12-clause Record Label Agreement and 15% revenue share model upon approval.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appForm.privacy_consent}
                        onChange={(e) => setAppForm({ ...appForm, privacy_consent: e.target.checked })}
                        className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-zinc-300 text-[11px] leading-relaxed">
                        I consent to PRANTIK SARKAR ARTIST RECORD verifying my submitted credentials and processing my contact details for label curatorial review.
                      </span>
                    </label>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onNavigate(`/label/invite/${inviteTokenFromUrl}`)}
                      className="px-4 py-2 bg-zinc-900 text-zinc-400 text-xs rounded-lg"
                    >
                      Back to Invitation
                    </button>
                    <button
                      type="submit"
                      disabled={submittingApp}
                      className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-lg shadow-rose-950/50 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingApp ? 'Submitting Dossier...' : 'Submit Application Dossier'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* ROUTE: /label/invite/[token] (PRIVATE INVITATION LANDING) */}
        {/* ==================================================== */}
        {isInviteLanding && (
          <div className="max-w-2xl mx-auto space-y-6">
            {!validatedInvite?.valid ? (
              <div className="p-8 bg-[#0b0b12] border border-red-500/40 rounded-2xl text-center space-y-4 shadow-2xl">
                <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h2 className="font-display font-black text-xl text-white uppercase">
                  Invalid or Expired Invitation
                </h2>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  {validatedInvite?.reason || 'This invitation is invalid or has expired.'}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('/label/invitation')}
                    className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Enter Valid Invitation Token
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#0b0b12] border border-emerald-500/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      OFFICIAL INVITATION VERIFIED
                    </span>
                    <h2 className="font-display font-black text-2xl text-white uppercase tracking-tight mt-1.5">
                      Welcome to Private Onboarding
                    </h2>
                    <p className="text-xs text-zinc-400">
                      PRANTIK SARKAR ARTIST RECORD • Invite-Only Independent Roster
                    </p>
                  </div>
                  <div className="text-right font-mono text-[10px] text-zinc-400">
                    <div>Expires: {new Date(validatedInvite.invitation!.expires_at).toLocaleDateString()}</div>
                    <div className="text-emerald-400 font-bold">Status: PENDING APPLICATION</div>
                  </div>
                </div>

                <div className="p-4 bg-zinc-950 rounded-xl border border-white/5 space-y-2 text-xs">
                  <div className="text-zinc-400">
                    Invited Artist: <strong className="text-white">{validatedInvite.invitation!.artist_name}</strong>
                  </div>
                  <div className="text-zinc-400">
                    Authorized Services: <span className="text-rose-300">{validatedInvite.invitation!.allowed_services.join(', ')}</span>
                  </div>
                  {validatedInvite.invitation!.notes && (
                    <div className="text-zinc-400 italic">
                      Curator Note: "{validatedInvite.invitation!.notes}"
                    </div>
                  )}
                </div>

                {/* Capacity Alert */}
                <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Active Artist Capacity:</span>
                  </div>
                  <span className="font-mono font-bold text-white">
                    {labelCapacity.current_active_artists} of {labelCapacity.maximum_active_artists} Approved
                  </span>
                </div>

                <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl text-[11px] text-zinc-300 space-y-1.5 leading-relaxed">
                  <div className="font-bold text-white uppercase flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                    <span>Controlled Artist Onboarding Process</span>
                  </div>
                  <p>
                    Accepting this invitation allows you to submit your private artist dossier. Upon submission, label administration verifies audio stems, metadata, and capacity before activating your signed Artist Portal.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => onNavigate('/label')}
                    className="px-4 py-2 bg-zinc-900 text-zinc-400 text-xs rounded-lg"
                  >
                    Decline & Exit
                  </button>
                  <button
                    onClick={() => onNavigate(`/label/invite/${inviteTokenFromUrl}/apply`)}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-rose-950/50"
                  >
                    <span>Proceed to Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* ROUTE: /label/invitation (PUBLIC INVITATION PROTOCOL) */}
        {/* ==================================================== */}
        {cleanRoute === '/label/invitation' && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                STRICTLY INVITE-ONLY
              </span>
              <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
                Invitation Protocol
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
                PRANTIK SARKAR ARTIST RECORD does not maintain public sign-ups or open membership purchases. Roster admission is strictly limited to 40 approved artists.
              </p>
            </div>

            {/* Token Verification Form */}
            <div className="p-6 sm:p-8 bg-[#0b0b12] border border-white/15 rounded-2xl shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm uppercase">
                <Lock className="w-4 h-4 text-rose-400" />
                <span>Verify Your Official Invitation Token</span>
              </div>
              <p className="text-xs text-zinc-400">
                If you have received an official cryptographic invitation token from label leadership, enter it below to access the private application dossier.
              </p>

              <form onSubmit={handleLookupToken} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Enter Token (e.g. INV-SEC-XXXXXXXXXX)"
                    className="flex-1 px-4 py-2.5 bg-zinc-900 border border-white/15 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shrink-0"
                  >
                    Verify Token
                  </button>
                </div>
                {tokenLookupError && (
                  <p className="text-xs text-red-400 font-semibold">{tokenLookupError}</p>
                )}
              </form>
            </div>

            {/* 6-Step Onboarding Protocol Overview */}
            <div className="p-6 bg-zinc-950 border border-white/10 rounded-2xl space-y-4 text-xs">
              <h3 className="font-bold text-white uppercase text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>The 6-Step Onboarding Architecture</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/5 space-y-1">
                  <div className="font-bold text-white">1. Official Invitation</div>
                  <p className="text-zinc-400 text-[11px]">Issued directly by label leadership with cryptographically unique security token.</p>
                </div>
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/5 space-y-1">
                  <div className="font-bold text-white">2. Token Validation</div>
                  <p className="text-zinc-400 text-[11px]">Server verifies token validity, expiration, revocation, and active roster capacity.</p>
                </div>
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/5 space-y-1">
                  <div className="font-bold text-white">3. Private Application</div>
                  <p className="text-zinc-400 text-[11px]">Artist completes private onboarding dossier with legal credits and audio demos.</p>
                </div>
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/5 space-y-1">
                  <div className="font-bold text-white">4. Administrative Review</div>
                  <p className="text-zinc-400 text-[11px]">Owner audits originality, sonic quality, metadata integrity, and releases.</p>
                </div>
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/5 space-y-1">
                  <div className="font-bold text-white">5. Capacity Gate (Max 40)</div>
                  <p className="text-zinc-400 text-[11px]">Approval immediately verifies active approved count &lt; 40; otherwise waitlisted.</p>
                </div>
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/5 space-y-1">
                  <div className="font-bold text-white">6. Artist Activation</div>
                  <p className="text-zinc-400 text-[11px]">Signed artist portal access, digital contract execution, and Ditto ingestion.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* ROUTE: /label/artists (PUBLIC ARTIST DIRECTORY) */}
        {/* ==================================================== */}
        {cleanRoute === '/label/artists' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PUBLIC ROSTER
                </span>
                <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
                  Signed Artists Directory
                </h1>
                <p className="text-xs text-zinc-400">
                  Approved recording artists signed to PRANTIK SARKAR ARTIST RECORD.
                </p>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-300">
                Active Artists: <strong className="text-emerald-400">{labelCapacity.current_active_artists}</strong> / {labelCapacity.maximum_active_artists}
              </div>
            </div>

            {publicLabelArtists.length === 0 ? (
              <div className="p-12 text-center bg-zinc-950 border border-white/10 rounded-2xl text-zinc-400 space-y-2">
                <Users className="w-10 h-10 mx-auto text-zinc-600" />
                <h3 className="font-bold text-white text-base">No public artists signed yet</h3>
                <p className="text-xs">Roster updates are published upon artist approval.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicLabelArtists.map((artist) => (
                  <div
                    key={artist.id}
                    className="bg-[#0b0b12] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl hover:border-white/20 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={artist.profile_image}
                          alt={artist.artist_name}
                          className="w-14 h-14 rounded-full object-cover border border-rose-500/40"
                        />
                        <div>
                          <h3 className="font-display font-bold text-lg text-white">{artist.artist_name}</h3>
                          <span className="text-[11px] font-mono text-rose-400 font-semibold">{artist.genre}</span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                        {artist.bio}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-mono text-[11px]">
                        {artist.public_releases_count} Public Releases
                      </span>
                      <div className="flex items-center gap-2">
                        {artist.social_links.spotify && (
                          <a href={artist.social_links.spotify} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white">
                            Spotify
                          </a>
                        )}
                        {artist.social_links.youtube && (
                          <a href={artist.social_links.youtube} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white">
                            YouTube
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* ROUTE: /label/releases (PUBLIC RELEASES DIRECTORY) */}
        {/* ==================================================== */}
        {cleanRoute === '/label/releases' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  LIVE CATALOG
                </span>
                <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
                  Public Label Releases
                </h1>
                <p className="text-xs text-zinc-400">
                  Official music and video releases distributed via Ditto Music to global DSP networks.
                </p>
              </div>
            </div>

            {publicDistributionReleases.length === 0 ? (
              <div className="p-12 text-center bg-zinc-950 border border-white/10 rounded-2xl text-zinc-400 space-y-2">
                <Disc className="w-10 h-10 mx-auto text-zinc-600" />
                <h3 className="font-bold text-white text-base">No public releases live yet</h3>
                <p className="text-xs">Live releases will appear once distribution verification is complete.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicDistributionReleases.map((rel) => (
                  <div
                    key={rel.id}
                    className="bg-[#0b0b12] border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-white/20 transition-all flex flex-col justify-between"
                  >
                    <div className="relative aspect-square">
                      <img
                        src={rel.cover_artwork_url}
                        alt={rel.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-black/80 text-emerald-400 border border-emerald-500/40">
                        LIVE ON DSPS
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <div className="text-[11px] font-mono text-zinc-400">{rel.artist_name}</div>
                        <h3 className="font-display font-bold text-lg text-white tracking-tight">{rel.title}</h3>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {rel.genre} • Released: {rel.release_date}
                        </div>
                      </div>

                      <div className="p-2.5 bg-zinc-950 rounded-lg border border-white/5 font-mono text-[10px] space-y-1">
                        <div className="text-zinc-400">ISRC: <strong className="text-zinc-200">{rel.isrc || 'N/A'}</strong></div>
                        <div className="text-zinc-400">UPC: <strong className="text-zinc-200">{rel.upc || 'N/A'}</strong></div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-zinc-500 font-mono">Via Ditto Music</span>
                        <div className="flex items-center gap-2">
                          {rel.live_urls.spotify && (
                            <a href={rel.live_urls.spotify} target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1">
                              <span>Stream</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* ROUTE: /label/services (ONLY ACTUAL MUSIC SERVICES) */}
        {/* ==================================================== */}
        {cleanRoute === '/label/services' && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                ACTUAL LABEL SERVICES
              </span>
              <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
                Record Label Services
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
                Configured music distribution, video syndication, VEVO network channels, and release lifecycle management for signed roster artists.
              </p>
            </div>

            {/* Services Grid (NO CUSTOM WEBSITE PACKAGE!) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Service 1: Music Distribution */}
              <div className="bg-[#0b0b12] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                  <Music className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base">Global Music Distribution</h3>
                  <p className="text-xs text-zinc-400">
                    Worldwide digital ingestion to Spotify, Apple Music, YouTube Music, Amazon Music, JioSaavn, and 150+ stores via Ditto Music.
                  </p>
                </div>
                <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 font-mono text-xs">
                  <div className="text-zinc-500 text-[10px]">CONFIGURED RATE</div>
                  <div className="text-lg font-bold text-white mt-0.5">₹3,000 <span className="text-xs font-normal text-zinc-400">/ Song</span></div>
                </div>
                <ul className="text-[11px] text-zinc-300 space-y-1.5 list-disc list-inside">
                  <li>Official ISRC and UPC assignment via Ditto</li>
                  <li>Lossless 24-bit audio delivery</li>
                  <li>Worldwide territorial licensing</li>
                </ul>
              </div>

              {/* Service 2: Video Distribution */}
              <div className="bg-[#0b0b12] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center">
                  <VideoIcon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base">Music Video Distribution</h3>
                  <p className="text-xs text-zinc-400">
                    Syndication of official HD/4K music videos to digital video platforms and authorized partner networks.
                  </p>
                </div>
                <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 font-mono text-xs">
                  <div className="text-zinc-500 text-[10px]">CONFIGURED RATE</div>
                  <div className="text-lg font-bold text-white mt-0.5">₹3,000 <span className="text-xs font-normal text-zinc-400">/ Video</span></div>
                </div>
                <ul className="text-[11px] text-zinc-300 space-y-1.5 list-disc list-inside">
                  <li>ProRes and MP4 container checking</li>
                  <li>Synchronized metadata and credits</li>
                  <li>Partner catalog archiving</li>
                </ul>
              </div>

              {/* Service 3: VEVO Services */}
              <div className="bg-[#0b0b12] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Tv className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base">VEVO Channel & Music Videos</h3>
                  <p className="text-xs text-zinc-400">
                    Dedicated VEVO Artist Channel provisioning and official music video premiere delivery on the VEVO network.
                  </p>
                </div>
                <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 font-mono text-xs">
                  <div className="text-zinc-500 text-[10px]">CONFIGURED RATE</div>
                  <div className="text-lg font-bold text-white mt-0.5">₹5,000 <span className="text-xs font-normal text-zinc-400">Channel Setup</span></div>
                </div>
                <ul className="text-[11px] text-zinc-300 space-y-1.5 list-disc list-inside">
                  <li>Official ArtistVEVO branding</li>
                  <li>YouTube VEVO integration</li>
                  <li>Dedicated video ingestion pipeline</li>
                </ul>
              </div>
            </div>

            {/* 15% Revenue Share Disclosure */}
            <div className="p-6 bg-zinc-950 border border-white/10 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-white text-sm">Contractual 85/15 Royalty Model</div>
                <p className="text-zinc-400 text-[11px] max-w-2xl leading-relaxed">
                  Where contractual agreements specify, net royalties collected from digital streaming are split 85% to the signed artist and 15% to PRANTIK SARKAR ARTIST RECORD. All terms are formalized in digital contracts.
                </p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 font-mono font-bold shrink-0">
                85% ARTIST / 15% LABEL
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* ROUTE: /label/distribution (DITTO INTEGRATION & SPECS) */}
        {/* ==================================================== */}
        {cleanRoute === '/label/distribution' && (
          <div className="max-w-4xl mx-auto space-y-8 text-xs">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                DITTO MUSIC INTEGRATION
              </span>
              <h1 className="font-display font-black text-3xl text-white uppercase tracking-tight">
                Distribution Architecture
              </h1>
              <p className="text-zinc-400 max-w-xl mx-auto">
                Transparent digital music distribution powered by Ditto Music as the configured primary provider.
              </p>
            </div>

            <div className="p-6 bg-[#0b0b12] border border-white/15 rounded-2xl space-y-4 shadow-xl">
              <h3 className="font-bold text-white text-sm uppercase text-rose-400">
                Source of Truth Architecture
              </h3>
              <p className="text-zinc-300 leading-relaxed">
                PRANTIK SARKAR ARTIST RECORD treats Ditto Music as the authoritative source of truth for distribution identifiers:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="p-3 bg-zinc-950 rounded-lg border border-white/5">
                  <div className="text-zinc-500">INTERNAL PLATFORM</div>
                  <div className="text-white font-bold mt-1">Internal Release ID (e.g. PR-2026-XXXX)</div>
                  <p className="text-zinc-400 text-[10px] font-sans mt-0.5">Authoritative for local metadata and rights.</p>
                </div>
                <div className="p-3 bg-zinc-950 rounded-lg border border-white/5">
                  <div className="text-zinc-500">DITTO MUSIC PROVIDER</div>
                  <div className="text-white font-bold mt-1">Ditto Release ID, ISRC, UPC, Delivery</div>
                  <p className="text-zinc-400 text-[10px] font-sans mt-0.5">Authoritative for assigned identifiers & store status.</p>
                </div>
              </div>
            </div>

            {/* Zero Guarantees Disclaimer */}
            <div className="p-5 bg-amber-950/20 border border-amber-500/30 rounded-2xl space-y-2">
              <div className="font-bold text-amber-300 uppercase flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span>Zero False Guarantees Disclosure</span>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                PRANTIK SARKAR ARTIST RECORD is an independent record label. Payment of processing fees does not guarantee Spotify editorial approval, Apple Music placement, playlist adds, platform verification, or external monetization. DSP review decisions are governed independently by the respective streaming platforms.
              </p>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* ROUTE: /label/about */}
        {/* ==================================================== */}
        {cleanRoute === '/label/about' && (
          <div className="max-w-3xl mx-auto space-y-6 text-xs leading-relaxed text-zinc-300">
            <h1 className="font-display font-black text-3xl text-white uppercase tracking-tight">
              About PRANTIK SARKAR ARTIST RECORD
            </h1>
            <p>
              PRANTIK SARKAR ARTIST RECORD was founded to serve as an uncompromising, artist-first creative bastion for cutting-edge hip-hop, Indian trap, and contemporary vocal music.
            </p>
            <div className="p-5 bg-[#0b0b12] border border-white/10 rounded-2xl space-y-2">
              <h3 className="font-bold text-white uppercase text-sm">Why Invite-Only?</h3>
              <p className="text-zinc-400">
                To guarantee relentless curatorial focus, sonic excellence, and personal release supervision, the label caps its active signed roster at <strong>40 artists</strong>. We prioritize depth of collaboration over mass distribution volume.
              </p>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* ROUTE: /label/contact */}
        {/* ==================================================== */}
        {cleanRoute === '/label/contact' && (
          <div className="max-w-2xl mx-auto space-y-6 text-xs">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                OFFICIAL RECORD LABEL CONTACT
              </span>
              <h1 className="font-display font-black text-3xl text-white uppercase tracking-tight">
                PRANTIK SARKAR ARTIST RECORD
              </h1>
              <p className="text-zinc-400">Official Record Label & Executive Management Desk</p>
            </div>

            <div className="p-6 bg-[#0b0b12] border border-white/15 rounded-2xl space-y-5 shadow-xl">
              <div>
                <span className="text-zinc-500 font-bold uppercase block text-[10px]">Headquarters & Studio</span>
                <span className="text-white font-bold text-sm">Kolkata, India</span>
              </div>

              <div>
                <span className="text-zinc-500 font-bold uppercase block text-[10px]">Official Record Label Email</span>
                <a
                  href={`mailto:${OFFICIAL_LABEL_EMAIL}`}
                  className="text-rose-400 hover:text-rose-300 font-mono font-bold text-base block mt-0.5"
                >
                  {OFFICIAL_LABEL_EMAIL}
                </a>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Primary official Record Label contact address configured for:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-zinc-300 pt-2 font-mono">
                  <div>• Artist enquiries</div>
                  <div>• Invitation requests</div>
                  <div>• Private applications</div>
                  <div>• Label enquiries</div>
                  <div>• Distribution enquiries</div>
                  <div>• Artist support</div>
                  <div>• Business enquiries</div>
                  <div>• General label communication</div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                <span className="text-zinc-500 font-bold uppercase block text-[10px]">Distribution Provider</span>
                <span className="text-white font-semibold">Ditto Music (Configured Authorized Partner)</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* ROUTE: /label/terms (TERMS OF SERVICE & SUBMISSION POLICY) */}
        {/* ==================================================== */}
        {cleanRoute === '/label/terms' && (
          <div className="max-w-4xl mx-auto space-y-8 text-xs leading-relaxed text-zinc-300">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                OFFICIAL RECORD LABEL POLICY
              </span>
              <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
                Terms of Service & Submission Policy
              </h1>
              <p className="text-zinc-400 max-w-xl mx-auto">
                PRANTIK SARKAR ARTIST RECORD • Operating under strict invite-only curatorial governance.
              </p>
            </div>

            <div className="p-6 sm:p-8 bg-[#0b0b12] border border-white/15 rounded-2xl space-y-6 shadow-2xl">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase text-rose-400">
                  1. Invite-Only Operational Governance
                </h3>
                <p>
                  PRANTIK SARKAR ARTIST RECORD is an independent, invite-only record label. Roster onboarding is exclusively accessible via official invitation tokens or private curatorial requests. We do not provide open public membership, self-signups, or guaranteed artist signing.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold text-white uppercase text-rose-400">
                  2. Strict Server-Side Roster Capacity Limit (40 Artists)
                </h3>
                <p>
                  To preserve individualized artist attention, meticulous audio quality control, and executive release management, the active signed roster is strictly limited to <strong>40 approved artists</strong>. Capacity is verified using transactional server-side checks. When capacity is reached, applicants may be placed on the Waitlist until a slot becomes available.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold text-white uppercase text-rose-400">
                  3. Non-Refundable Review & Application Fees Disclosure
                </h3>
                <p>
                  Any administrative or review fee associated with curatorial processing is strictly non-refundable and covers staff evaluation time and stem verification. <strong>Payment of any fee never guarantees invitation, approval, signing, distribution, verification, or platform acceptance.</strong> Acceptance is solely determined by curatorial merit and available capacity.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold text-white uppercase text-rose-400">
                  4. Intellectual Property & Master Recording Rights
                </h3>
                <p>
                  Artists retain legal ownership of their original underlying musical compositions and sound recordings, subject to the non-exclusive or exclusive rights granted to PRANTIK SARKAR ARTIST RECORD for digital distribution and monetization as set forth in the formal Artist Agreement. All submissions must be 100% original, fully cleared, and free of unauthorized samples.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold text-white uppercase text-rose-400">
                  5. Transparent Royalty Distribution (85% Artist / 15% Label)
                </h3>
                <p>
                  Net revenue received from digital streaming platforms (DSPs) via configured authorized partners (including Ditto Music) is split: <strong>85% to the signed artist</strong> and <strong>15% to PRANTIK SARKAR ARTIST RECORD</strong> for label administration and distribution services.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold text-white uppercase text-rose-400">
                  6. Zero False Guarantees Disclaimer
                </h3>
                <p>
                  PRANTIK SARKAR ARTIST RECORD does not guarantee playlist inclusion (e.g. Spotify Editorial, Apple Music Playlists), algorithmic spikes, verified badges, or specific financial returns. DSP curation decisions are entirely within the discretion of the third-party platforms.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold text-white uppercase text-rose-400">
                  7. Official Legal Inquiries Desk
                </h3>
                <p>
                  For questions regarding our terms, agreements, or legal policies, contact the executive desk at{' '}
                  <a href={`mailto:${OFFICIAL_LABEL_EMAIL}`} className="text-rose-400 hover:text-rose-300 font-mono font-bold">
                    {OFFICIAL_LABEL_EMAIL}
                  </a>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* ROUTE: /label/privacy (PRIVACY POLICY & DATA PROTECTION) */}
        {/* ==================================================== */}
        {cleanRoute === '/label/privacy' && (
          <div className="max-w-4xl mx-auto space-y-8 text-xs leading-relaxed text-zinc-300">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                DATA PROTECTION & CONFIDENTIALITY
              </span>
              <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
                Record Label Privacy Policy
              </h1>
              <p className="text-zinc-400 max-w-xl mx-auto">
                PRANTIK SARKAR ARTIST RECORD • Strict confidentiality of artist dossiers, audio stems, and identity data.
              </p>
            </div>

            <div className="p-6 sm:p-8 bg-[#0b0b12] border border-white/15 rounded-2xl space-y-6 shadow-2xl">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase text-emerald-400">
                  1. Information We Collect
                </h3>
                <p>
                  When you submit an invitation request, provide contact details, or upload a private application dossier, we collect:
                </p>
                <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
                  <li>Legal identification details: full name, stage name, country, city, and jurisdiction</li>
                  <li>Contact communication: verified email, phone number, WhatsApp, and preferred contact schedule</li>
                  <li>Artistic assets: streaming profile URLs, unreleased demos, EPK links, audio files, and album artwork</li>
                  <li>Business data: management contacts, publisher records, previous distributor names, and ISRC/UPC metadata</li>
                </ul>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold text-white uppercase text-emerald-400">
                  2. Purpose & Use of Data
                </h3>
                <p>
                  Applicant data is utilized strictly for evaluating artist fit for the invite-only roster, verifying copyright ownership, generating contracts upon approval, and providing communications through our official desk ({OFFICIAL_LABEL_EMAIL}). We never sell, lease, or monetize applicant personal information.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold text-white uppercase text-emerald-400">
                  3. Strict Applicant Confidentiality
                </h3>
                <p>
                  Under no circumstances is applicant data exposed to other applicants or unauthorized third parties. All submissions are stored with restricted private access control. Only authenticated label directors and review board members have access to application dossiers.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold text-white uppercase text-emerald-400">
                  4. Secure Storage & Audit Trail Logging
                </h3>
                <p>
                  All status transitions (Submitted, Under Review, Waitlisted, Approved, Rejected) and curator communications generate immutable audit logs including timestamp and reviewer ID to ensure absolute transparency and compliance.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold text-white uppercase text-emerald-400">
                  5. Data Retention & Erasure Requests
                </h3>
                <p>
                  Applicants whose submissions are rejected or withdrawn may request the permanent deletion of their contact details and demo links by emailing{' '}
                  <a href={`mailto:${OFFICIAL_LABEL_EMAIL}`} className="text-rose-400 hover:text-rose-300 font-mono font-bold">
                    {OFFICIAL_LABEL_EMAIL}
                  </a>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* ROUTE: /label (HOME / HUB OVERVIEW) */}
        {/* ==================================================== */}
        {cleanRoute === '/label' && (
          <div className="space-y-12">
            {/* Hero Banner */}
            <div className="relative rounded-3xl bg-gradient-to-br from-[#120f18] via-[#0b0b10] to-[#070709] border border-white/10 p-8 sm:p-12 overflow-hidden shadow-2xl">
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>INVITE-ONLY RECORD LABEL • MAXIMUM 40 ARTISTS</span>
                </div>

                <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight leading-tight">
                  PRANTIK SARKAR ARTIST RECORD
                </h1>

                <p className="text-rose-400 font-display font-bold text-lg sm:text-xl uppercase tracking-wider">
                  INVITE-ONLY RECORD LABEL
                </p>

                <blockquote className="p-4 bg-zinc-950/80 border-l-4 border-rose-600 rounded-r-xl text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-2xl italic">
                  "We work with a limited number of artists. Artist onboarding is available through official invitations and private applications reviewed by our team."
                </blockquote>

                <div className="pt-4 flex items-center gap-4 flex-wrap">
                  <button
                    onClick={() => onNavigate('/label/invitation')}
                    className="px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xl shadow-rose-950/60"
                  >
                    <Lock className="w-4 h-4" />
                    <span>I HAVE AN INVITATION</span>
                  </button>

                  <button
                    onClick={() => onNavigate('/label/request-invitation')}
                    className="px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-white/20 hover:border-rose-500/60 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg"
                  >
                    <Send className="w-4 h-4 text-rose-400" />
                    <span>REQUEST AN INVITATION</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-[#0b0b12] border border-white/10 rounded-2xl text-center space-y-1">
                <div className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Approved Artists</div>
                <div className="text-xl sm:text-2xl font-mono font-black text-emerald-400">
                  {labelCapacity.current_active_artists} / 40
                </div>
              </div>
              <div className="p-4 bg-[#0b0b12] border border-white/10 rounded-2xl text-center space-y-1">
                <div className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Admission Model</div>
                <div className="text-xl sm:text-2xl font-display font-black text-amber-300">
                  INVITE-ONLY
                </div>
              </div>
              <div className="p-4 bg-[#0b0b12] border border-white/10 rounded-2xl text-center space-y-1">
                <div className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Distribution Provider</div>
                <div className="text-xl sm:text-2xl font-display font-black text-cyan-400">
                  DITTO
                </div>
              </div>
              <div className="p-4 bg-[#0b0b12] border border-white/10 rounded-2xl text-center space-y-1">
                <div className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Royalty Split</div>
                <div className="text-xl sm:text-2xl font-mono font-black text-rose-400">
                  85% / 15%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Label Sub-Footer for All Label Routes */}
        <footer className="mt-16 pt-8 border-t border-white/10 text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-white uppercase tracking-wider text-xs">
              PRANTIK SARKAR ARTIST RECORD
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-[10px] font-mono font-bold text-amber-400">INVITE-ONLY (40 CAPACITY)</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px]">
            {[
              { path: '/label', label: 'Overview' },
              { path: '/label/about', label: 'About' },
              { path: '/label/artists', label: 'Artists' },
              { path: '/label/releases', label: 'Releases' },
              { path: '/label/services', label: 'Services' },
              { path: '/label/distribution', label: 'Distribution' },
              { path: '/label/invitation', label: 'Invitation' },
              { path: '/label/request-invitation', label: 'Request Invite' },
              { path: '/label/contact', label: 'Contact' },
              { path: '/label/privacy', label: 'Privacy' },
              { path: '/label/terms', label: 'Terms' },
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  onNavigate(link.path);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
};
