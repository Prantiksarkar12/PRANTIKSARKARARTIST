import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Send,
  Upload,
  Music,
  Video,
  Tv,
  Radio,
  Users,
  FileText,
  DollarSign,
  HelpCircle,
  Sparkles,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  Info,
  KeyRound,
} from 'lucide-react';
import { labelService, OFFICIAL_LABEL_EMAIL } from '../../services/labelInviteService';
import { LabelApplication } from '../../types';

interface RequestInvitationFormProps {
  onNavigate: (route: string) => void;
  prefillInvitationCode?: string;
}

export const RequestInvitationForm: React.FC<RequestInvitationFormProps> = ({
  onNavigate,
  prefillInvitationCode,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4; // 1: Contact & Artist, 2: Music & Experience, 3: Goals & Team, 4: Review, Declarations & Submit

  // Form State covering all 15 Sections
  const [form, setForm] = useState({
    // Section A — Contact Information
    full_name: '',
    artist_name: '',
    email: '',
    confirm_email: '',
    phone: '',
    whatsapp: '',
    country: 'India',
    state_province: '',
    city: '',
    preferred_contact_method: 'Email' as 'Email' | 'WhatsApp' | 'Phone',
    best_time_to_contact: 'Afternoons (2 PM - 6 PM IST)',
    preferred_language: 'English',

    // Section 3 — Artist Information
    artist_type: 'Solo Artist' as any,
    primary_genre: 'Hip Hop / Rap',
    secondary_genre: 'Desi Trap',
    subgenre: '',
    artist_bio: '',
    started_making_music_year: '2022',
    current_artist_status: 'Independent' as any,
    official_releases_count: 1,
    unreleased_tracks_count: 3,
    main_music_languages: 'Hindi, English',
    target_regions: 'India, South Asia, Worldwide Diaspora',

    // Section 4 — Music Profile
    spotify_url: '',
    apple_music_url: '',
    youtube_url: '',
    amazon_music_url: '',
    jiosaavn_url: '',
    other_streaming_links: '',
    official_website: '',
    instagram_url: '',
    facebook_url: '',
    x_twitter_url: '',
    tiktok_url: '',
    other_social_profiles: '',

    // Section 5 — Music Experience
    music_type_description: '',
    artistic_influences: '',
    music_differentiation: '',
    most_important_release: '',
    currently_promoting_release: '',
    planning_next_release: '',
    unreleased_music_ready: 'Yes' as 'Yes' | 'No',
    expected_releases_12m: 3,
    professional_quality_masters: 'Yes' as 'Yes' | 'No' | 'Some',
    original_artwork: true,
    rights_ownership: 'Yes' as 'Yes' | 'No' | 'Shared/Other',

    // Section 6 — Distribution Information
    previously_distributed: 'Yes' as 'Yes' | 'No',
    current_distributor: '',
    previous_distribution_provider: '',
    has_existing_isrcs: false,
    has_existing_upc_ean: false,
    has_existing_catalog: false,
    distribute_new_releases: true,
    distribute_existing_catalog: false,
    approx_tracks_count: 3,
    approx_videos_count: 1,
    desired_release_frequency: 'Every 4-6 weeks',

    // Section 7 — Label Services Interest
    services_interest: {
      music_distribution: true,
      music_distribution_details: '',
      video_distribution: false,
      video_distribution_details: '',
      vevo_services: false,
      vevo_services_details: '',
      video_channel_services: false,
      video_channel_details: '',
      release_management: true,
      release_management_details: '',
      artist_support: true,
      artist_support_details: '',
      other_services: false,
      other_services_details: '',
    },

    // Section 8 — Artist Goals
    goals_joining_label: '',
    expectations_from_label: '',
    support_needed: '',
    goals_next_12m: '',
    long_term_goals: '',
    working_with_manager: false,
    working_with_producer_team: false,
    who_else_involved: '',

    // Section 9 — Team / Business Information
    is_self_managed: true,
    management_name: '',
    manager_email: '',
    manager_phone: '',
    record_label_name: '',
    publisher_name: '',
    distributor_name: '',
    production_team: '',
    other_representative: '',

    // Section 10 — Documents / Links
    epk_url: '',
    portfolio_url: '',
    press_url: '',
    live_performance_url: '',
    music_video_url: '',
    materials_folder_url: '',
    additional_documents_url: '',

    // Section 11 — Invitation Information
    was_invited: (prefillInvitationCode ? 'Yes' : 'No') as 'Yes' | 'No' | 'Not sure',
    inviter_name: '',
    inviter_email: '',
    invitation_code: prefillInvitationCode || '',
    invitation_link: '',

    // Section 12 — Why are you contacting us?
    why_work_with_psar: '',
    how_discovered: 'Official Website' as any,
    anything_else: '',

    // Section 13 — Payment / Application Review Fee
    application_fee_required: false,
    application_fee_amount_inr: 0,
    fee_acknowledged_no_guarantee: true,
    fee_acknowledged_review_only: true,
    fee_acknowledged_accurate: true,
    fee_acknowledged_refund_policy: true,

    // Section 14 — Final Declarations (96-103)
    declaration_accurate: false,
    declaration_authority: false,
    declaration_no_agreement: false,
    declaration_additional_info: false,
    declaration_admin_review: false,
    declaration_terms: false,
    declaration_privacy: false,
    declaration_contact_consent: false,
  });

  const [uploadedFilesList, setUploadedFilesList] = useState<Array<{ name: string; type: string }>>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<LabelApplication | null>(null);

  const handleFileUploadSim = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFilesList((prev) => [
        ...prev,
        { name: `${file.name} (${type.toUpperCase()})`, type },
      ]);
    }
  };

  const validateStep = (step: number): boolean => {
    setErrorMsg('');
    if (step === 1) {
      if (!form.full_name.trim() || !form.artist_name.trim() || !form.email.trim()) {
        setErrorMsg('Please enter your full legal name, artist name, and email address.');
        return false;
      }
      if (form.email.trim().toLowerCase() !== form.confirm_email.trim().toLowerCase()) {
        setErrorMsg('Email and Confirm Email must match exactly.');
        return false;
      }
      if (!form.country.trim() || !form.city.trim()) {
        setErrorMsg('Please specify your country and city.');
        return false;
      }
      if (!form.artist_bio.trim()) {
        setErrorMsg('Please provide a brief artist biography and vision.');
        return false;
      }
    } else if (step === 2) {
      if (!form.music_type_description.trim()) {
        setErrorMsg('Please describe the type of music you create.');
        return false;
      }
    } else if (step === 3) {
      if (!form.why_work_with_psar.trim()) {
        setErrorMsg('Please explain why you would like to work with PRANTIK SARKAR ARTIST RECORD.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (
      !form.declaration_accurate ||
      !form.declaration_authority ||
      !form.declaration_no_agreement ||
      !form.declaration_additional_info ||
      !form.declaration_admin_review ||
      !form.declaration_terms ||
      !form.declaration_privacy ||
      !form.declaration_contact_consent
    ) {
      setErrorMsg('You must check and agree to all 8 mandatory legal declarations in Section 14 to submit.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = labelService.submitRequestInvitation({
        ...form,
        uploaded_documents: uploadedFilesList.map((f, i) => ({
          id: `doc_${Date.now()}_${i}`,
          application_id: 'TEMP',
          document_type: f.type as any,
          file_name: f.name,
          file_url: 'https://storage.label.internal/documents/' + encodeURIComponent(f.name),
          access_level: 'PRIVATE',
          uploaded_at: new Date().toISOString(),
        })),
      });

      if (res.success && res.application) {
        setSubmittedApp(res.application);
      } else {
        setErrorMsg(res.error || 'Submission failed. Please check required fields.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error submitting application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (submittedApp) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-[#0b0b12] border-2 border-emerald-500/40 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              APPLICATION RECEIVED
            </span>
            <h1 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
              Application Dossier Submitted
            </h1>
            <p className="font-mono text-rose-400 font-bold text-lg">
              Application ID: {submittedApp.id}
            </p>
          </div>

          <p className="text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
            Your request has been successfully submitted. Our team may contact you using the contact information provided in your application.
          </p>

          <div className="p-5 bg-zinc-950 rounded-2xl border border-white/10 text-xs text-zinc-400 max-w-lg mx-auto space-y-3 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-white/5 font-mono text-[11px]">
              <span className="text-zinc-500">Applicant:</span>
              <span className="text-white font-bold">{submittedApp.full_name} ({submittedApp.artist_name})</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-white/5 font-mono text-[11px]">
              <span className="text-zinc-500">Email:</span>
              <span className="text-zinc-200">{submittedApp.email}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-white/5 font-mono text-[11px]">
              <span className="text-zinc-500">Initial Status:</span>
              <span className="text-amber-400 font-bold font-mono">SUBMITTED (Under Review)</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-white/5 font-mono text-[11px]">
              <span className="text-zinc-500">Official Label Desk:</span>
              <span className="text-rose-400 font-mono font-semibold">{OFFICIAL_LABEL_EMAIL}</span>
            </div>
            <div className="pt-1 text-[11px] text-zinc-500 italic">
              A real confirmation dispatch was recorded to your email address. Note: Submission does not guarantee invitation or approval.
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('/label')}
              className="w-full sm:w-auto px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-rose-950/50 cursor-pointer"
            >
              Return to Record Label
            </button>
            <button
              onClick={() => onNavigate('/')}
              className="w-full sm:w-auto px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold">
          <Lock className="w-3.5 h-3.5" />
          <span>INVITE-ONLY RECORD LABEL • PRIVATE APPLICATION</span>
        </div>

        <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white uppercase tracking-tight">
          Request An Invitation
        </h1>

        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          We work with a limited number of artists. Artist onboarding is available through official invitations and private applications reviewed by our team.
        </p>

        {/* Step Indicator */}
        <div className="pt-4 flex items-center justify-center gap-2 sm:gap-4 text-xs font-mono">
          {[
            { num: 1, label: 'Identity' },
            { num: 2, label: 'Music & Catalog' },
            { num: 3, label: 'Goals & Team' },
            { num: 4, label: 'Declarations & Submit' },
          ].map((st) => (
            <div
              key={st.num}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                currentStep === st.num
                  ? 'bg-rose-600 text-white border-rose-500 font-bold'
                  : currentStep > st.num
                  ? 'bg-zinc-900 text-emerald-400 border-emerald-500/30 font-semibold'
                  : 'bg-zinc-950 text-zinc-500 border-white/5'
              }`}
            >
              <span>{st.num}.</span>
              <span className="hidden sm:inline">{st.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-[#0b0b12] border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        {errorMsg && (
          <div className="p-4 bg-red-950/80 border border-red-500/40 text-red-200 text-xs rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 text-xs">
          {/* ======================================================== */}
          {/* STEP 1: CONTACT (SECTION A) & ARTIST INFORMATION (SECTION 3) */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-8">
              {/* SECTION A — CONTACT INFORMATION */}
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <h2 className="font-display font-bold text-white text-base uppercase tracking-tight flex items-center gap-2 text-rose-400">
                    <Mail className="w-4 h-4" />
                    <span>Section A — Contact Information</span>
                  </h2>
                  <span className="text-[10px] text-zinc-500 font-mono">* Mandatory</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">1. Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      placeholder="Your official government legal name"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">2. Artist / Stage Name *</label>
                    <input
                      type="text"
                      required
                      value={form.artist_name}
                      onChange={(e) => setForm({ ...form, artist_name: e.target.value })}
                      placeholder="Artist / Band / Producer moniker"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">3. Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Primary contact email"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">4. Confirm Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.confirm_email}
                      onChange={(e) => setForm({ ...form, confirm_email: e.target.value })}
                      placeholder="Re-enter email address"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">5. Phone Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">6. WhatsApp Number</label>
                    <input
                      type="tel"
                      value={form.whatsapp}
                      onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                      placeholder="WhatsApp international format"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">7. Country *</label>
                    <input
                      type="text"
                      required
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      placeholder="e.g. India"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">8. State / Province</label>
                    <input
                      type="text"
                      value={form.state_province}
                      onChange={(e) => setForm({ ...form, state_province: e.target.value })}
                      placeholder="e.g. West Bengal"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">9. City *</label>
                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="e.g. Kolkata"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">10. Preferred Contact Method *</label>
                    <select
                      value={form.preferred_contact_method}
                      onChange={(e) => setForm({ ...form, preferred_contact_method: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Email">Email</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Phone">Phone</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">11. Best Time to Contact</label>
                    <input
                      type="text"
                      value={form.best_time_to_contact}
                      onChange={(e) => setForm({ ...form, best_time_to_contact: e.target.value })}
                      placeholder="e.g. Weekday evenings"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">12. Preferred Language</label>
                    <input
                      type="text"
                      value={form.preferred_language}
                      onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}
                      placeholder="e.g. English, Hindi, Bengali"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3 — ARTIST INFORMATION */}
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <h2 className="font-display font-bold text-white text-base uppercase tracking-tight flex items-center gap-2 text-rose-400">
                    <Users className="w-4 h-4" />
                    <span>Section 3 — Artist Information</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">13. Artist Type *</label>
                    <select
                      value={form.artist_type}
                      onChange={(e) => setForm({ ...form, artist_type: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Solo Artist">Solo Artist</option>
                      <option value="Duo">Duo</option>
                      <option value="Group">Group</option>
                      <option value="Band">Band</option>
                      <option value="Producer">Producer</option>
                      <option value="DJ">DJ</option>
                      <option value="Composer">Composer</option>
                      <option value="Songwriter">Songwriter</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">14. Primary Genre *</label>
                    <input
                      type="text"
                      required
                      value={form.primary_genre}
                      onChange={(e) => setForm({ ...form, primary_genre: e.target.value })}
                      placeholder="e.g. Hip Hop, Desi Trap, Electronic"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">15. Secondary Genre</label>
                    <input
                      type="text"
                      value={form.secondary_genre}
                      onChange={(e) => setForm({ ...form, secondary_genre: e.target.value })}
                      placeholder="e.g. R&B, Drill, Pop"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">17. Artist Biography & Creative Vision *</label>
                  <textarea
                    required
                    rows={4}
                    value={form.artist_bio}
                    onChange={(e) => setForm({ ...form, artist_bio: e.target.value })}
                    placeholder="Provide a detailed artist background, philosophy, lyrical style, and your artistic mission..."
                    className="w-full p-3.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">18. Year You Started Making Music *</label>
                    <input
                      type="text"
                      required
                      value={form.started_making_music_year}
                      onChange={(e) => setForm({ ...form, started_making_music_year: e.target.value })}
                      placeholder="e.g. 2021"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">19. Current Artist Status *</label>
                    <select
                      value={form.current_artist_status}
                      onChange={(e) => setForm({ ...form, current_artist_status: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Independent">Independent (Unsigned)</option>
                      <option value="Currently Signed">Currently Signed</option>
                      <option value="Previously Signed">Previously Signed</option>
                      <option value="Label/Team">Label / Team Managed</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">20. Official Releases Count</label>
                    <input
                      type="number"
                      min={0}
                      value={form.official_releases_count}
                      onChange={(e) => setForm({ ...form, official_releases_count: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">21. Unreleased Tracks Ready</label>
                    <input
                      type="number"
                      min={0}
                      value={form.unreleased_tracks_count}
                      onChange={(e) => setForm({ ...form, unreleased_tracks_count: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">22. Main Music Language(s)</label>
                    <input
                      type="text"
                      value={form.main_music_languages}
                      onChange={(e) => setForm({ ...form, main_music_languages: e.target.value })}
                      placeholder="e.g. Hindi, English, Punjabi"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">23. Target Country / Region</label>
                    <input
                      type="text"
                      value={form.target_regions}
                      onChange={(e) => setForm({ ...form, target_regions: e.target.value })}
                      placeholder="e.g. Global, India, UK"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50"
                >
                  <span>Next: Music Profiles & Experience</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: MUSIC PROFILE (4), EXPERIENCE (5) & DISTRIBUTION (6) */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-8">
              {/* SECTION 4 — MUSIC PROFILE */}
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <h2 className="font-display font-bold text-white text-base uppercase tracking-tight flex items-center gap-2 text-rose-400">
                    <Music className="w-4 h-4" />
                    <span>Section 4 — Music Profiles & Streaming Links</span>
                  </h2>
                  <span className="text-[10px] text-zinc-500 font-mono">Fill relevant links</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">24. Spotify Artist URL</label>
                    <input
                      type="url"
                      value={form.spotify_url}
                      onChange={(e) => setForm({ ...form, spotify_url: e.target.value })}
                      placeholder="https://open.spotify.com/artist/..."
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">25. Apple Music Artist URL</label>
                    <input
                      type="url"
                      value={form.apple_music_url}
                      onChange={(e) => setForm({ ...form, apple_music_url: e.target.value })}
                      placeholder="https://music.apple.com/artist/..."
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">26. YouTube / YouTube Music URL</label>
                    <input
                      type="url"
                      value={form.youtube_url}
                      onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                      placeholder="https://youtube.com/@..."
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">28. JioSaavn Artist URL</label>
                    <input
                      type="url"
                      value={form.jiosaavn_url}
                      onChange={(e) => setForm({ ...form, jiosaavn_url: e.target.value })}
                      placeholder="https://www.jiosaavn.com/artist/..."
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">31. Instagram Profile URL</label>
                    <input
                      type="text"
                      value={form.instagram_url}
                      onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
                      placeholder="https://instagram.com/..."
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">33. X / Twitter URL</label>
                    <input
                      type="text"
                      value={form.x_twitter_url}
                      onChange={(e) => setForm({ ...form, x_twitter_url: e.target.value })}
                      placeholder="https://x.com/..."
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">30. Official Website URL</label>
                    <input
                      type="url"
                      value={form.official_website}
                      onChange={(e) => setForm({ ...form, official_website: e.target.value })}
                      placeholder="https://yourdomain.com"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5 — MUSIC EXPERIENCE */}
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <h2 className="font-display font-bold text-white text-base uppercase tracking-tight flex items-center gap-2 text-rose-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Section 5 — Music Experience</span>
                  </h2>
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">36. What type of music do you create? *</label>
                  <textarea
                    required
                    rows={3}
                    value={form.music_type_description}
                    onChange={(e) => setForm({ ...form, music_type_description: e.target.value })}
                    placeholder="Describe your sonic identity, instrumentation, flow, vocal style, production techniques..."
                    className="w-full p-3.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">37. Main Artistic Influences</label>
                    <input
                      type="text"
                      value={form.artistic_influences}
                      onChange={(e) => setForm({ ...form, artistic_influences: e.target.value })}
                      placeholder="e.g. Kendrick Lamar, Divine, Sidhu Moosewala"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">38. What makes your music different?</label>
                    <input
                      type="text"
                      value={form.music_differentiation}
                      onChange={(e) => setForm({ ...form, music_differentiation: e.target.value })}
                      placeholder="Your unique artistic edge"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">42. Unreleased Music Ready?</label>
                    <select
                      value={form.unreleased_music_ready}
                      onChange={(e) => setForm({ ...form, unreleased_music_ready: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">44. Professional Masters?</label>
                    <select
                      value={form.professional_quality_masters}
                      onChange={(e) => setForm({ ...form, professional_quality_masters: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Yes">Yes</option>
                      <option value="Some">Some</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">46. Own / Control Rights? *</label>
                    <select
                      value={form.rights_ownership}
                      onChange={(e) => setForm({ ...form, rights_ownership: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Yes">Yes (100% Owned)</option>
                      <option value="Shared/Other">Shared / Split Controlled</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 6 — DISTRIBUTION INFORMATION */}
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <h2 className="font-display font-bold text-white text-base uppercase tracking-tight flex items-center gap-2 text-rose-400">
                    <Radio className="w-4 h-4" />
                    <span>Section 6 — Distribution Information</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">47. Previously Distributed?</label>
                    <select
                      value={form.previously_distributed}
                      onChange={(e) => setForm({ ...form, previously_distributed: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">48. Current / Previous Distributor</label>
                    <input
                      type="text"
                      value={form.current_distributor}
                      onChange={(e) => setForm({ ...form, current_distributor: e.target.value })}
                      placeholder="e.g. Ditto, DistroKid, TuneCore"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">57. Desired Release Frequency</label>
                    <input
                      type="text"
                      value={form.desired_release_frequency}
                      onChange={(e) => setForm({ ...form, desired_release_frequency: e.target.value })}
                      placeholder="e.g. Monthly, Quarterly"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="p-4 bg-zinc-950 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex items-center gap-2.5 cursor-pointer text-zinc-300">
                    <input
                      type="checkbox"
                      checked={form.has_existing_isrcs}
                      onChange={(e) => setForm({ ...form, has_existing_isrcs: e.target.checked })}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>50. Existing ISRCs available</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-zinc-300">
                    <input
                      type="checkbox"
                      checked={form.has_existing_upc_ean}
                      onChange={(e) => setForm({ ...form, has_existing_upc_ean: e.target.checked })}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>51. Existing UPC / EAN codes</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-zinc-300">
                    <input
                      type="checkbox"
                      checked={form.distribute_new_releases}
                      onChange={(e) => setForm({ ...form, distribute_new_releases: e.target.checked })}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>53. Distribute new releases</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50"
                >
                  <span>Next: Services, Goals & Team</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: SERVICES (7), GOALS (8), TEAM (9), DOCS (10), INVITATION (11), WHY (12) */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <div className="space-y-8">
              {/* SECTION 7 — LABEL SERVICES INTEREST */}
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <h2 className="font-display font-bold text-white text-base uppercase tracking-tight flex items-center gap-2 text-rose-400">
                    <Tv className="w-4 h-4" />
                    <span>Section 7 — Label Services Interest</span>
                  </h2>
                  <span className="text-[10px] text-zinc-400">Select all that apply</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Service 1: Music Distribution */}
                  <div className="p-4 bg-zinc-900/60 rounded-2xl border border-white/10 space-y-2">
                    <label className="flex items-center gap-2.5 cursor-pointer font-bold text-white">
                      <input
                        type="checkbox"
                        checked={form.services_interest.music_distribution}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            services_interest: { ...form.services_interest, music_distribution: e.target.checked },
                          })
                        }
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span>58. Global Music Distribution</span>
                    </label>
                    <input
                      type="text"
                      value={form.services_interest.music_distribution_details || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          services_interest: { ...form.services_interest, music_distribution_details: e.target.value },
                        })
                      }
                      placeholder="Tell us what you need for music distribution..."
                      className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-[11px]"
                    />
                  </div>

                  {/* Service 2: Video Distribution */}
                  <div className="p-4 bg-zinc-900/60 rounded-2xl border border-white/10 space-y-2">
                    <label className="flex items-center gap-2.5 cursor-pointer font-bold text-white">
                      <input
                        type="checkbox"
                        checked={form.services_interest.video_distribution}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            services_interest: { ...form.services_interest, video_distribution: e.target.checked },
                          })
                        }
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span>59. Music Video Distribution</span>
                    </label>
                    <input
                      type="text"
                      value={form.services_interest.video_distribution_details || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          services_interest: { ...form.services_interest, video_distribution_details: e.target.value },
                        })
                      }
                      placeholder="Tell us what you need for video distribution..."
                      className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-[11px]"
                    />
                  </div>

                  {/* Service 3: VEVO Services */}
                  <div className="p-4 bg-zinc-900/60 rounded-2xl border border-white/10 space-y-2">
                    <label className="flex items-center gap-2.5 cursor-pointer font-bold text-white">
                      <input
                        type="checkbox"
                        checked={form.services_interest.vevo_services}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            services_interest: { ...form.services_interest, vevo_services: e.target.checked },
                          })
                        }
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span>60. VEVO Services (Channel & Videos)</span>
                    </label>
                    <input
                      type="text"
                      value={form.services_interest.vevo_services_details || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          services_interest: { ...form.services_interest, vevo_services_details: e.target.value },
                        })
                      }
                      placeholder="Tell us what you need for VEVO provisioning..."
                      className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-[11px]"
                    />
                  </div>

                  {/* Service 4: Release Management & Support */}
                  <div className="p-4 bg-zinc-900/60 rounded-2xl border border-white/10 space-y-2">
                    <label className="flex items-center gap-2.5 cursor-pointer font-bold text-white">
                      <input
                        type="checkbox"
                        checked={form.services_interest.release_management}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            services_interest: { ...form.services_interest, release_management: e.target.checked },
                          })
                        }
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span>62. Release Management & Artist Support</span>
                    </label>
                    <input
                      type="text"
                      value={form.services_interest.release_management_details || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          services_interest: { ...form.services_interest, release_management_details: e.target.value },
                        })
                      }
                      placeholder="Tell us what you need for release planning..."
                      className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 8 — ARTIST GOALS */}
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <h2 className="font-display font-bold text-white text-base uppercase tracking-tight flex items-center gap-2 text-rose-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Section 8 — Artist Goals</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">65. Main Goals for Joining / Working with the Label</label>
                    <textarea
                      rows={2}
                      value={form.goals_joining_label}
                      onChange={(e) => setForm({ ...form, goals_joining_label: e.target.value })}
                      placeholder="What are your key milestones?"
                      className="w-full p-3 bg-zinc-900 border border-white/15 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">66. What do you expect from the label?</label>
                    <textarea
                      rows={2}
                      value={form.expectations_from_label}
                      onChange={(e) => setForm({ ...form, expectations_from_label: e.target.value })}
                      placeholder="Expectations regarding communication, distribution, guidance"
                      className="w-full p-3 bg-zinc-900 border border-white/15 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 9 — TEAM / BUSINESS INFORMATION */}
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <h2 className="font-display font-bold text-white text-base uppercase tracking-tight flex items-center gap-2 text-rose-400">
                    <Users className="w-4 h-4" />
                    <span>Section 9 — Team / Business Information</span>
                  </h2>
                </div>

                <div className="p-4 bg-zinc-900/60 rounded-2xl border border-white/10">
                  <label className="flex items-center gap-2.5 cursor-pointer font-bold text-white">
                    <input
                      type="checkbox"
                      checked={form.is_self_managed}
                      onChange={(e) => setForm({ ...form, is_self_managed: e.target.checked })}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>I am independent and manage myself.</span>
                  </label>
                </div>

                {!form.is_self_managed && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-zinc-300 font-semibold block mb-1">73. Management Name</label>
                      <input
                        type="text"
                        value={form.management_name}
                        onChange={(e) => setForm({ ...form, management_name: e.target.value })}
                        placeholder="Manager / Company name"
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-300 font-semibold block mb-1">74. Manager Email</label>
                      <input
                        type="email"
                        value={form.manager_email}
                        onChange={(e) => setForm({ ...form, manager_email: e.target.value })}
                        placeholder="manager@domain.com"
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-300 font-semibold block mb-1">79. Production Team</label>
                      <input
                        type="text"
                        value={form.production_team}
                        onChange={(e) => setForm({ ...form, production_team: e.target.value })}
                        placeholder="Primary producers / engineers"
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 10 — DOCUMENTS / LINKS & UPLOADS */}
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <h2 className="font-display font-bold text-white text-base uppercase tracking-tight flex items-center gap-2 text-rose-400">
                    <FileText className="w-4 h-4" />
                    <span>Section 10 — Documents & Audio Material</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">81. EPK / Press Kit URL</label>
                    <input
                      type="url"
                      value={form.epk_url}
                      onChange={(e) => setForm({ ...form, epk_url: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">86. Music / Materials Folder URL</label>
                    <input
                      type="url"
                      value={form.materials_folder_url}
                      onChange={(e) => setForm({ ...form, materials_folder_url: e.target.value })}
                      placeholder="Dropbox / Google Drive folder"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white"
                    />
                  </div>
                </div>

                {/* Upload Buttons */}
                <div className="p-4 bg-zinc-950 rounded-2xl border border-white/10 space-y-3">
                  <span className="text-zinc-400 font-semibold block">Attach Relevant Files (Encrypted Storage):</span>
                  <div className="flex flex-wrap gap-3">
                    <label className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/15 rounded-xl text-zinc-300 cursor-pointer flex items-center gap-2">
                      <Upload className="w-3.5 h-3.5 text-rose-400" />
                      <span>Artist Photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUploadSim(e, 'photo')} />
                    </label>
                    <label className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/15 rounded-xl text-zinc-300 cursor-pointer flex items-center gap-2">
                      <Upload className="w-3.5 h-3.5 text-rose-400" />
                      <span>EPK Document</span>
                      <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => handleFileUploadSim(e, 'epk')} />
                    </label>
                    <label className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/15 rounded-xl text-zinc-300 cursor-pointer flex items-center gap-2">
                      <Upload className="w-3.5 h-3.5 text-rose-400" />
                      <span>Audio Demo Sample</span>
                      <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUploadSim(e, 'music_sample')} />
                    </label>
                  </div>
                  {uploadedFilesList.length > 0 && (
                    <div className="pt-2 text-[11px] text-emerald-400 font-mono space-y-1">
                      {uploadedFilesList.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>Attached: {f.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 11 — INVITATION INFORMATION */}
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <h2 className="font-display font-bold text-white text-base uppercase tracking-tight flex items-center gap-2 text-rose-400">
                    <KeyRound className="w-4 h-4" />
                    <span>Section 11 — Invitation Verification</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">88. Were you invited by someone from PRANTIK SARKAR ARTIST RECORD? *</label>
                    <select
                      value={form.was_invited}
                      onChange={(e) => setForm({ ...form, was_invited: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="No">No (Submitting Public Consideration Request)</option>
                      <option value="Yes">Yes (I received an Invitation Code / Link)</option>
                      <option value="Not sure">Not sure</option>
                    </select>
                  </div>

                  {form.was_invited === 'Yes' && (
                    <div>
                      <label className="text-zinc-300 font-semibold block mb-1">91. Official Invitation Code / Token *</label>
                      <input
                        type="text"
                        value={form.invitation_code}
                        onChange={(e) => setForm({ ...form, invitation_code: e.target.value })}
                        placeholder="e.g. INV-SEC-XXXXXXXXXX"
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white font-mono"
                      />
                      <span className="text-[10px] text-zinc-500 mt-1 block">
                        Server verifies token authenticity and expiration automatically.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 12 — WHY ARE YOU CONTACTING US? */}
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <h2 className="font-display font-bold text-white text-base uppercase tracking-tight flex items-center gap-2 text-rose-400">
                    <HelpCircle className="w-4 h-4" />
                    <span>Section 12 — Why Are You Contacting Us?</span>
                  </h2>
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">93. Why would you like to work with PRANTIK SARKAR ARTIST RECORD? *</label>
                  <textarea
                    required
                    rows={3}
                    value={form.why_work_with_psar}
                    onChange={(e) => setForm({ ...form, why_work_with_psar: e.target.value })}
                    placeholder="Tell us what resonates with you about the label, sound, and roster..."
                    className="w-full p-3.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">94. How did you discover the label? *</label>
                    <select
                      value={form.how_discovered}
                      onChange={(e) => setForm({ ...form, how_discovered: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Official Website">Official Website</option>
                      <option value="Instagram">Instagram</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Friend/Artist">Friend / Artist Referral</option>
                      <option value="Direct Invitation">Direct Invitation</option>
                      <option value="Search Engine">Search Engine</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">95. Anything else the team should know?</label>
                    <input
                      type="text"
                      value={form.anything_else}
                      onChange={(e) => setForm({ ...form, anything_else: e.target.value })}
                      placeholder="Additional notes"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50"
                >
                  <span>Next: Review & Final Declarations</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: PAYMENT DISCLOSURE (13), DECLARATIONS (14), SUBMIT (15) */}
          {/* ======================================================== */}
          {currentStep === 4 && (
            <div className="space-y-8">
              {/* SECTION 13 — PAYMENT / APPLICATION REVIEW DISCLOSURE */}
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <h2 className="font-display font-bold text-white text-base uppercase tracking-tight flex items-center gap-2 text-rose-400">
                    <DollarSign className="w-4 h-4" />
                    <span>Section 13 — Application & Review Policy</span>
                  </h2>
                </div>

                <div className="p-5 bg-amber-950/20 border-2 border-amber-500/30 rounded-2xl space-y-3">
                  <div className="font-display font-black text-amber-300 uppercase tracking-tight text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Zero Guarantee Disclosure</span>
                  </div>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">
                    Application and review processing is conducted exclusively for curatorial assessment.
                  </p>
                  <div className="p-3 bg-black/60 rounded-xl border border-white/10 font-mono text-[11px] text-zinc-300 space-y-1">
                    <div className="font-bold text-white uppercase text-[10px] text-amber-400">Submission or fee does NOT guarantee:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-zinc-400">
                      <div>• Invitation token issuance</div>
                      <div>• Artist roster approval</div>
                      <div>• Label contract signing</div>
                      <div>• Distribution approval</div>
                      <div>• Platform verification</div>
                      <div>• Spotify playlist placement</div>
                      <div>• Commercial monetization</div>
                      <div>• Guaranteed streaming revenue</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 p-4 bg-zinc-950 rounded-2xl border border-white/10 text-[11px] text-zinc-300">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.fee_acknowledged_no_guarantee}
                      onChange={(e) => setForm({ ...form, fee_acknowledged_no_guarantee: e.target.checked })}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>I understand that submission does not guarantee invitation or acceptance.</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.fee_acknowledged_review_only}
                      onChange={(e) => setForm({ ...form, fee_acknowledged_review_only: e.target.checked })}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>I understand that the label team may approve, reject, waitlist, or request additional materials.</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.fee_acknowledged_accurate}
                      onChange={(e) => setForm({ ...form, fee_acknowledged_accurate: e.target.checked })}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>I have provided accurate and complete artistic information.</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.fee_acknowledged_refund_policy}
                      onChange={(e) => setForm({ ...form, fee_acknowledged_refund_policy: e.target.checked })}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>I understand the applicable curatorial policies and procedures.</span>
                  </label>
                </div>
              </div>

              {/* SECTION 14 — FINAL DECLARATIONS (96-103) */}
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <h2 className="font-display font-bold text-white text-base uppercase tracking-tight flex items-center gap-2 text-rose-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Section 14 — Final Declarations & Consents</span>
                  </h2>
                  <span className="text-[10px] text-zinc-500 font-mono">All 8 required</span>
                </div>

                <div className="p-5 bg-zinc-950 rounded-2xl border border-white/10 space-y-3 text-[11px] text-zinc-300">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={form.declaration_accurate}
                      onChange={(e) => setForm({ ...form, declaration_accurate: e.target.checked })}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>96. I confirm that the information provided is accurate and truthful. *</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={form.declaration_authority}
                      onChange={(e) => setForm({ ...form, declaration_authority: e.target.checked })}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>97. I confirm that I have legal authority to submit this application and music materials. *</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={form.declaration_no_agreement}
                      onChange={(e) => setForm({ ...form, declaration_no_agreement: e.target.checked })}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>98. I understand that submitting an application does not create a binding label contract or representation. *</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={form.declaration_additional_info}
                      onChange={(e) => setForm({ ...form, declaration_additional_info: e.target.checked })}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>99. I understand that the label may request additional verification, stem tracks, or identification. *</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={form.declaration_admin_review}
                      onChange={(e) => setForm({ ...form, declaration_admin_review: e.target.checked })}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>100. I understand that acceptance is subject to Owner/Admin review and the strict 40-artist capacity limit. *</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={form.declaration_terms}
                      onChange={(e) => setForm({ ...form, declaration_terms: e.target.checked })}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>101. I agree to the Record Label Terms of Service. *</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={form.declaration_privacy}
                      onChange={(e) => setForm({ ...form, declaration_privacy: e.target.checked })}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>102. I agree to the Privacy Policy. *</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={form.declaration_contact_consent}
                      onChange={(e) => setForm({ ...form, declaration_contact_consent: e.target.checked })}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>103. I consent to being contacted by PRANTIK SARKAR ARTIST RECORD regarding this application. *</span>
                  </label>
                </div>
              </div>

              {/* SECTION 15 — SUBMIT */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-full sm:w-auto px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous Step</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-10 py-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xl shadow-rose-950/60 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Transmitting Dossier...' : 'Submit Private Application'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
