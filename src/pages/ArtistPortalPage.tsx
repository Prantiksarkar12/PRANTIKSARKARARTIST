import React, { useState } from 'react';
import {
  Sparkles,
  CreditCard,
  Receipt,
  FileText,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Music,
  Video,
  Tv,
  Globe,
  Plus,
  Eye,
  Download,
  ShieldCheck,
  Percent,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { db } from '../services/db';
import {
  ArtistInvoice,
  ArtistPayment,
  LabelCheckoutItem,
  LabelServiceOrder,
  PaymentTransactionStatus,
  User,
} from '../types';
import { LabelCheckoutModal } from '../components/label/LabelCheckoutModal';
import { InvoiceViewerModal } from '../components/label/InvoiceViewerModal';
import { ArtistAgreementModal } from '../components/label/ArtistAgreementModal';

interface ArtistPortalPageProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenAuth?: () => void;
}

export type ArtistPortalTab = 'services' | 'billing' | 'payments' | 'invoices' | 'agreements';

export const ArtistPortalPage: React.FC<ArtistPortalPageProps> = ({
  currentRoute,
  onNavigate,
  onOpenAuth,
}) => {
  const {
    labelPricing,
    labelOrders,
    labelMemberships,
    labelSubmissions,
    artistInvoices,
    artistPayments,
    currentUser,
  } = useRealtimeData();

  // Determine active tab from route
  const getTabFromRoute = (route: string): ArtistPortalTab => {
    if (route.includes('/artist/billing')) return 'billing';
    if (route.includes('/artist/payments')) return 'payments';
    if (route.includes('/artist/invoices')) return 'invoices';
    if (route.includes('/artist/agreements') || route.includes('/artist/agreement')) return 'agreements';
    return 'services';
  };

  const [activeTab, setActiveTab] = useState<ArtistPortalTab>(getTabFromRoute(currentRoute));

  // Sync tab with route changes
  React.useEffect(() => {
    setActiveTab(getTabFromRoute(currentRoute));
  }, [currentRoute]);

  const handleTabChange = (tab: ArtistPortalTab) => {
    setActiveTab(tab);
    onNavigate(`/artist/${tab === 'agreements' ? 'agreement' : tab}`);
  };

  // Modals state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<LabelCheckoutItem[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<ArtistInvoice | null>(null);
  const [agreementModalOpen, setAgreementModalOpen] = useState(false);

  // Dynamic calculations for Services order builder
  const [musicSongCount, setMusicSongCount] = useState(1);
  const [videoSongCount, setVideoSongCount] = useState(0);
  const [includeVideoChannel, setIncludeVideoChannel] = useState(false);
  const [includeVevoChannel, setIncludeVevoChannel] = useState(false);
  const [vevoVideoCount, setVevoVideoCount] = useState(0);

  // Filter user specific records if logged in
  const myOrders = currentUser
    ? labelOrders.filter((o) => o.user_id === currentUser.id || o.user_email === currentUser.email)
    : labelOrders;
  const myInvoices = currentUser
    ? artistInvoices.filter((inv) => inv.artist_id === currentUser.id || inv.artist_email === currentUser.email)
    : artistInvoices;
  const myPayments = currentUser
    ? artistPayments.filter((p) => p.artist_id === currentUser.id || p.artist_email === currentUser.email)
    : artistPayments;
  const myMembership = currentUser
    ? labelMemberships.find((m) => m.user_id === currentUser.id || m.user_email === currentUser.email)
    : labelMemberships[0];

  const userAgreementAcceptance = currentUser ? db.getAgreementAcceptance(currentUser.id) : null;

  // Single service checkout launcher
  const handleCheckoutSingle = (
    title: string,
    service_type: LabelCheckoutItem['service_type'],
    unit_price: number,
    qty: number = 1,
    details?: string
  ) => {
    setCheckoutItems([
      {
        id: `chk_${Date.now()}`,
        title,
        service_type,
        quantity: qty,
        unit_price,
        subtotal: unit_price * qty,
        details,
      },
    ]);
    setCheckoutOpen(true);
  };

  // Custom multi-service checkout builder
  const handleLaunchCustomCheckout = () => {
    const items: LabelCheckoutItem[] = [];

    if (musicSongCount > 0) {
      items.push({
        id: `item_m_${Date.now()}`,
        title: `Music Distribution (${musicSongCount} ${musicSongCount === 1 ? 'Song' : 'Songs'})`,
        service_type: 'MUSIC_DISTRIBUTION',
        quantity: musicSongCount,
        unit_price: labelPricing.music_distribution.price_per_song_inr,
        subtotal: musicSongCount * labelPricing.music_distribution.price_per_song_inr,
        details: `DSP delivery via ${labelPricing.music_distribution.distribution_provider || 'DITTO'}`,
      });
    }

    if (videoSongCount > 0) {
      items.push({
        id: `item_v_${Date.now()}`,
        title: `Video Song Distribution (${videoSongCount} ${videoSongCount === 1 ? 'Video' : 'Videos'})`,
        service_type: 'VIDEO_DISTRIBUTION',
        quantity: videoSongCount,
        unit_price: labelPricing.video_distribution.price_per_video_song_inr,
        subtotal: videoSongCount * labelPricing.video_distribution.price_per_video_song_inr,
      });
    }

    if (includeVideoChannel) {
      items.push({
        id: `item_vc_${Date.now()}`,
        title: labelPricing.video_channel.title,
        service_type: 'VIDEO_CHANNEL',
        quantity: 1,
        unit_price: labelPricing.video_channel.price_inr,
        subtotal: labelPricing.video_channel.price_inr,
      });
    }

    if (includeVevoChannel) {
      items.push({
        id: `item_vevo_c_${Date.now()}`,
        title: labelPricing.vevo_services.vevo_channel_title,
        service_type: 'VEVO_CHANNEL',
        quantity: 1,
        unit_price: labelPricing.vevo_services.vevo_channel_setup_inr,
        subtotal: labelPricing.vevo_services.vevo_channel_setup_inr,
      });
    }

    if (vevoVideoCount > 0) {
      items.push({
        id: `item_vevo_v_${Date.now()}`,
        title: `${labelPricing.vevo_services.vevo_music_video_title} (${vevoVideoCount} Videos)`,
        service_type: 'VEVO_VIDEO',
        quantity: vevoVideoCount,
        unit_price: labelPricing.vevo_services.vevo_music_video_inr,
        subtotal: vevoVideoCount * labelPricing.vevo_services.vevo_music_video_inr,
      });
    }

    if (items.length === 0) return;
    setCheckoutItems(items);
    setCheckoutOpen(true);
  };

  const calculatedSubtotal =
    musicSongCount * labelPricing.music_distribution.price_per_song_inr +
    videoSongCount * labelPricing.video_distribution.price_per_video_song_inr +
    (includeVideoChannel ? labelPricing.video_channel.price_inr : 0) +
    (includeVevoChannel ? labelPricing.vevo_services.vevo_channel_setup_inr : 0) +
    vevoVideoCount * labelPricing.vevo_services.vevo_music_video_inr;

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 pt-24 pb-20 selection:bg-rose-600 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-3xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Artist Portal & Label Services</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white uppercase tracking-tight font-display">
              {currentUser ? `${currentUser.name} — Artist Hub` : 'Record Label Artist Portal'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Manage distribution submissions, billing, payments, verified invoices, and signed label agreements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!currentUser ? (
              <button
                onClick={onOpenAuth}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-lg shadow-rose-900/40"
              >
                Sign In to Artist Portal
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-xl text-xs font-bold text-zinc-300">
                  {myMembership?.status === 'ACTIVE' ? 'Verified Label Artist' : 'Onboarding Pending'}
                </span>
                <button
                  onClick={() => setAgreementModalOpen(true)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                  <span>Agreement</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-white/10 pb-3 text-xs">
          <button
            onClick={() => handleTabChange('services')}
            className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'services'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                : 'text-zinc-400 hover:text-white bg-zinc-950/60 border border-white/5'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Services & Pricing</span>
          </button>

          <button
            onClick={() => handleTabChange('billing')}
            className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'billing'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                : 'text-zinc-400 hover:text-white bg-zinc-950/60 border border-white/5'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Membership & Billing</span>
          </button>

          <button
            onClick={() => handleTabChange('payments')}
            className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'payments'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                : 'text-zinc-400 hover:text-white bg-zinc-950/60 border border-white/5'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Payments & Ledger ({myPayments.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('invoices')}
            className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'invoices'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                : 'text-zinc-400 hover:text-white bg-zinc-950/60 border border-white/5'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Invoices ({myInvoices.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('agreements')}
            className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'agreements'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                : 'text-zinc-400 hover:text-white bg-zinc-950/60 border border-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Artist Agreement</span>
          </button>
        </div>

        {/* TAB 1: SERVICES CATALOG & CHECKOUT BUILDER */}
        {activeTab === 'services' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Quick Order Builder */}
            <div className="p-6 sm:p-8 bg-gradient-to-b from-zinc-950 to-[#0e0e14] border border-white/10 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold text-white">Select Services for Distribution & Promotion</h2>
                  <p className="text-xs text-zinc-400">
                    Live dynamic calculator. Select tracks, video distribution, and channel setups for instant itemized checkout.
                  </p>
                </div>
                <span className="px-3 py-1 bg-zinc-900 border border-white/10 rounded-lg text-xs font-mono font-bold text-rose-400">
                  Provider: {labelPricing.music_distribution.distribution_provider || 'DITTO'}
                </span>
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* 1. Music Distribution */}
                <div className="p-4 bg-zinc-900/60 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white uppercase">Music Distribution</span>
                    <span className="font-mono font-bold text-rose-400">
                      {labelPricing.currency_symbol}
                      {(musicSongCount * labelPricing.music_distribution.price_per_song_inr).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Number of Songs:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setMusicSongCount(Math.max(0, musicSongCount - 1))}
                        className="w-6 h-6 rounded bg-zinc-800 text-white flex items-center justify-center font-bold hover:bg-zinc-700"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-white">{musicSongCount}</span>
                      <button
                        onClick={() => setMusicSongCount(musicSongCount + 1)}
                        className="w-6 h-6 rounded bg-zinc-800 text-white flex items-center justify-center font-bold hover:bg-zinc-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {labelPricing.currency_symbol}{labelPricing.music_distribution.price_per_song_inr.toLocaleString()} per song across 150+ DSPs.
                  </p>
                </div>

                {/* 2. Video Song Distribution */}
                <div className="p-4 bg-zinc-900/60 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white uppercase">Video Song Dist.</span>
                    <span className="font-mono font-bold text-purple-400">
                      {labelPricing.currency_symbol}
                      {(videoSongCount * labelPricing.video_distribution.price_per_video_song_inr).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Number of Videos:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setVideoSongCount(Math.max(0, videoSongCount - 1))}
                        className="w-6 h-6 rounded bg-zinc-800 text-white flex items-center justify-center font-bold hover:bg-zinc-700"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-white">{videoSongCount}</span>
                      <button
                        onClick={() => setVideoSongCount(videoSongCount + 1)}
                        className="w-6 h-6 rounded bg-zinc-800 text-white flex items-center justify-center font-bold hover:bg-zinc-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {labelPricing.currency_symbol}{labelPricing.video_distribution.price_per_video_song_inr.toLocaleString()} per video song.
                  </p>
                </div>

                {/* 3. Video Channel Setup */}
                <div className="p-4 bg-zinc-900/60 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white uppercase">Video Channel Setup</span>
                    <span className="font-mono font-bold text-red-400">
                      {labelPricing.currency_symbol}
                      {(includeVideoChannel ? labelPricing.video_channel.price_inr : 0).toLocaleString()}
                    </span>
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer text-zinc-300">
                    <input
                      type="checkbox"
                      checked={includeVideoChannel}
                      onChange={(e) => setIncludeVideoChannel(e.target.checked)}
                      className="rounded border-white/20 text-red-600 focus:ring-red-500"
                    />
                    <span>Add Channel Setup ({labelPricing.currency_symbol}{labelPricing.video_channel.price_inr.toLocaleString()})</span>
                  </label>
                  <p className="text-[11px] text-zinc-500">
                    One-time artist channel setup and distribution ingestion.
                  </p>
                </div>

                {/* 4. VEVO Channel Setup */}
                <div className="p-4 bg-zinc-900/60 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white uppercase">VEVO Channel Setup</span>
                    <span className="font-mono font-bold text-amber-400">
                      {labelPricing.currency_symbol}
                      {(includeVevoChannel ? labelPricing.vevo_services.vevo_channel_setup_inr : 0).toLocaleString()}
                    </span>
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer text-zinc-300">
                    <input
                      type="checkbox"
                      checked={includeVevoChannel}
                      onChange={(e) => setIncludeVevoChannel(e.target.checked)}
                      className="rounded border-white/20 text-amber-600 focus:ring-amber-500"
                    />
                    <span>VEVO Channel ({labelPricing.currency_symbol}{labelPricing.vevo_services.vevo_channel_setup_inr.toLocaleString()})</span>
                  </label>
                  <p className="text-[11px] text-zinc-500">
                    VEVO pipeline provisioning (subject to platform editorial guidelines).
                  </p>
                </div>

                {/* 5. VEVO Music Video */}
                <div className="p-4 bg-zinc-900/60 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white uppercase">VEVO Music Video</span>
                    <span className="font-mono font-bold text-amber-400">
                      {labelPricing.currency_symbol}
                      {(vevoVideoCount * labelPricing.vevo_services.vevo_music_video_inr).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>VEVO Videos:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setVevoVideoCount(Math.max(0, vevoVideoCount - 1))}
                        className="w-6 h-6 rounded bg-zinc-800 text-white flex items-center justify-center font-bold hover:bg-zinc-700"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-white">{vevoVideoCount}</span>
                      <button
                        onClick={() => setVevoVideoCount(vevoVideoCount + 1)}
                        className="w-6 h-6 rounded bg-zinc-800 text-white flex items-center justify-center font-bold hover:bg-zinc-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {labelPricing.currency_symbol}{labelPricing.vevo_services.vevo_music_video_inr.toLocaleString()} per VEVO video submission.
                  </p>
                </div>
              </div>

              {/* Order Checkout Bar */}
              <div className="p-6 bg-black/60 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Calculated Service Total</span>
                  <div className="text-3xl font-extrabold text-white font-mono">
                    {labelPricing.currency_symbol}{calculatedSubtotal.toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={handleLaunchCustomCheckout}
                  disabled={calculatedSubtotal === 0}
                  className="w-full sm:w-auto px-8 py-3.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-900/40"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Individual Standard Services Table */}
            <div className="p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-3xl space-y-6">
              <h3 className="text-lg font-bold text-white">Direct Service Catalog</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Join Plan Card */}
                <div className="p-5 bg-zinc-900/60 border border-white/10 rounded-2xl flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Roster Account</span>
                    <h4 className="text-base font-bold text-white">{labelPricing.artist_join_plan.plan_name}</h4>
                    <p className="text-zinc-400 leading-relaxed">{labelPricing.artist_join_plan.description}</p>
                    <div className="flex items-baseline gap-2 pt-2">
                      <span className="text-2xl font-extrabold text-white font-mono">
                        {labelPricing.currency_symbol}{labelPricing.artist_join_plan.join_fee_inr.toLocaleString()}
                      </span>
                      <span className="text-zinc-400">Approved Artist Dues • {labelPricing.currency_symbol}{labelPricing.artist_join_plan.annual_fee_inr.toLocaleString()}/year</span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleCheckoutSingle(
                        labelPricing.artist_join_plan.plan_name,
                        'JOIN_FEE',
                        labelPricing.artist_join_plan.join_fee_inr,
                        1,
                        'Approved artist roster activation fee'
                      )
                    }
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
                  >
                    Pay Account Dues
                  </button>
                </div>

                {/* VEVO Channel Setup Card */}
                <div className="p-5 bg-zinc-900/60 border border-white/10 rounded-2xl flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">VEVO Network</span>
                    <h4 className="text-base font-bold text-white">{labelPricing.vevo_services.vevo_channel_title}</h4>
                    <p className="text-zinc-400 leading-relaxed">{labelPricing.vevo_services.vevo_channel_description}</p>
                    <div className="flex items-baseline gap-2 pt-2">
                      <span className="text-2xl font-extrabold text-white font-mono">
                        {labelPricing.currency_symbol}{labelPricing.vevo_services.vevo_channel_setup_inr.toLocaleString()}
                      </span>
                      <span className="text-zinc-400">per channel setup</span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleCheckoutSingle(
                        labelPricing.vevo_services.vevo_channel_title,
                        'VEVO_CHANNEL',
                        labelPricing.vevo_services.vevo_channel_setup_inr,
                        1,
                        'VEVO artist channel setup and metadata delivery'
                      )
                    }
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
                  >
                    Setup VEVO Channel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MEMBERSHIP & BILLING */}
        {activeTab === 'billing' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold text-white">Artist Membership & Plan Billing</h2>
                  <p className="text-xs text-zinc-400">Configured fees, renewal policy, and active service subscription status.</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    myMembership?.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                  }`}
                >
                  {myMembership ? myMembership.status : 'PENDING ONBOARDING'}
                </span>
              </div>

              {/* Membership Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="p-5 bg-zinc-900/60 border border-white/5 rounded-2xl space-y-2">
                  <span className="text-zinc-500 block text-[11px] uppercase font-bold">1. Joining Fee</span>
                  <div className="text-2xl font-mono font-extrabold text-white">
                    {labelPricing.currency_symbol}{labelPricing.artist_join_plan.join_fee_inr.toLocaleString()}
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    Paid when artist is accepted and chooses to complete onboarding.
                  </p>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    myMembership?.join_fee_paid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    Status: {myMembership?.join_fee_paid ? 'PAID' : 'PENDING'}
                  </span>
                </div>

                <div className="p-5 bg-zinc-900/60 border border-white/5 rounded-2xl space-y-2">
                  <span className="text-zinc-500 block text-[11px] uppercase font-bold">2. Annual Membership</span>
                  <div className="text-2xl font-mono font-extrabold text-white">
                    {labelPricing.currency_symbol}{labelPricing.artist_join_plan.annual_fee_inr.toLocaleString()}
                    <span className="text-xs text-zinc-400 font-normal"> / year</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    Applies annually according to configured renewal policy.
                  </p>
                  <span className="text-zinc-400 font-mono text-[11px] block">
                    Next Renewal: {myMembership ? new Date(myMembership.membership_renewal_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                <div className="p-5 bg-zinc-900/60 border border-white/5 rounded-2xl space-y-2">
                  <span className="text-zinc-500 block text-[11px] uppercase font-bold">3. Label Revenue Split</span>
                  <div className="text-2xl font-mono font-extrabold text-emerald-400">
                    {labelPricing.revenue_share.artist_share_percent}% / {labelPricing.revenue_share.label_share_percent}%
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    85% Artist / 15% Label share according to signed artist agreement.
                  </p>
                  <span className="text-zinc-400 font-mono text-[11px] block">
                    Agreement: {userAgreementAcceptance ? 'EXECUTED' : 'PENDING SIGNATURE'}
                  </span>
                </div>
              </div>

              {/* Included Management List */}
              <div className="p-6 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Included Artist Management Features</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs text-zinc-300">
                  {labelPricing.artist_join_plan.included_features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENTS & LEDGER */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-3xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold text-white">Verified Payment Ledger</h2>
                  <p className="text-xs text-zinc-400">
                    Signature-verified transactions with idempotency tracking and real audit logs.
                  </p>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  Total Transactions: <strong className="text-white">{myPayments.length}</strong>
                </span>
              </div>

              {myPayments.length === 0 ? (
                <div className="p-8 text-center bg-zinc-900/40 border border-white/5 rounded-2xl text-zinc-400 text-xs">
                  No payment transactions recorded yet. When you complete a service order, verified records appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {myPayments.map((pmt) => (
                    <div
                      key={pmt.id}
                      className="p-4 bg-zinc-900/60 border border-white/5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{pmt.payment_reference}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              pmt.status === 'PAID'
                                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                : pmt.status === 'PENDING'
                                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                                : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                            }`}
                          >
                            {pmt.status}
                          </span>
                          {pmt.signature_verified && (
                            <span className="px-1.5 py-0.5 bg-zinc-800 text-[10px] font-mono text-emerald-400 rounded">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-400 text-[11px]">
                          Method: {pmt.payment_method} • Idempotency: {pmt.idempotency_key.substring(0, 16)}...
                        </p>
                        <p className="text-zinc-500 text-[10px]">
                          Date: {new Date(pmt.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right space-y-1 self-end sm:self-center">
                        <div className="text-base font-mono font-extrabold text-white">
                          {labelPricing.currency_symbol}{pmt.amount.toLocaleString()}
                        </div>
                        {pmt.invoice_id && (
                          <button
                            onClick={() => {
                              const inv = db.getArtistInvoice(pmt.invoice_id!);
                              if (inv) setSelectedInvoice(inv);
                            }}
                            className="text-xs text-rose-400 hover:underline flex items-center gap-1 cursor-pointer justify-end"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>View Invoice</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: INVOICES LEDGER */}
        {activeTab === 'invoices' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-3xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold text-white">Official Artist Invoices</h2>
                  <p className="text-xs text-zinc-400">
                    Real generated invoices for verified services. View and download for tax and accounting records.
                  </p>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  Invoices: <strong className="text-white">{myInvoices.length}</strong>
                </span>
              </div>

              {myInvoices.length === 0 ? (
                <div className="p-8 text-center bg-zinc-900/40 border border-white/5 rounded-2xl text-zinc-400 text-xs">
                  No invoices generated yet. Invoices are generated automatically following verified payments.
                </div>
              ) : (
                <div className="space-y-3">
                  {myInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="p-5 bg-zinc-900/60 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-sm">{invoice.id}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                            {invoice.status}
                          </span>
                        </div>
                        <p className="font-semibold text-zinc-200">{invoice.service_name}</p>
                        <p className="text-zinc-400 text-[11px]">
                          Date: {new Date(invoice.payment_date).toLocaleDateString()} • Ref: {invoice.payment_reference} • Provider: {invoice.distribution_provider || 'DITTO'}
                        </p>
                      </div>

                      <div className="text-right space-y-2 self-end sm:self-center">
                        <div className="text-lg font-mono font-extrabold text-white">
                          {invoice.currency_symbol}{invoice.total_amount.toLocaleString()}
                        </div>
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View / Print Invoice</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: ARTIST AGREEMENT */}
        {activeTab === 'agreements' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold text-white">Record Label Artist Agreement</h2>
                  <p className="text-xs text-zinc-400">
                    Governs joining fees, annual membership, 15% label royalty split, takedown rules, and rights reversion.
                  </p>
                </div>
                <button
                  onClick={() => setAgreementModalOpen(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
                >
                  {userAgreementAcceptance ? 'Review Signed Agreement' : 'Sign Agreement'}
                </button>
              </div>

              {userAgreementAcceptance ? (
                <div className="p-6 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Agreement Officially Executed & Bound</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-zinc-300">
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold">Signer Name</span>
                      <span className="font-bold text-white">{userAgreementAcceptance.artist_name}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold">Signer Email</span>
                      <span className="text-white">{userAgreementAcceptance.artist_email}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold">Signed Timestamp</span>
                      <span className="font-mono text-zinc-300">
                        {new Date(userAgreementAcceptance.accepted_timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold">Agreement Version</span>
                      <span className="font-mono text-rose-300 font-bold">{userAgreementAcceptance.agreement_version}</span>
                    </div>
                  </div>
                  <div className="pt-2 text-[11px] font-mono text-zinc-500 border-t border-white/10">
                    Cryptographic Hash: {userAgreementAcceptance.agreement_hash}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-amber-950/30 border border-amber-500/30 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    <span>Agreement Pending Digital Signature</span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    Prior to completing onboarding or release delivery, the artist must review and accept the official 12-clause agreement, which includes the ₹999 joining fee, ₹1,999 annual renewal, per-track distribution rates, and the 15% label revenue share split.
                  </p>
                  <button
                    onClick={() => setAgreementModalOpen(true)}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
                  >
                    Open & Sign Agreement Now
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Global Modals */}
      <LabelCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        pricing={labelPricing}
        initialItems={checkoutItems}
        currentUser={currentUser}
        onOpenAuth={onOpenAuth}
        onOrderSuccess={(order) => {
          // Automatic invoice and payment are created in db.ts
        }}
      />

      <InvoiceViewerModal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />

      <ArtistAgreementModal
        isOpen={agreementModalOpen}
        onClose={() => setAgreementModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
};
