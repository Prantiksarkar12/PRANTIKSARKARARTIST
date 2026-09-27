import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Music,
  Video,
  Calculator,
  ArrowRight,
  Percent,
  CheckCircle2,
  Info,
  Lock,
  Radio,
  Tv,
  Youtube,
  KeyRound,
} from 'lucide-react';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { LabelPricingTable } from '../components/label/LabelPricingTable';
import { LabelCheckoutModal } from '../components/label/LabelCheckoutModal';
import { LabelCheckoutItem } from '../types';

interface LabelPricingPageProps {
  onNavigate: (route: string) => void;
  onOpenAuth?: () => void;
}

export const LabelPricingPage: React.FC<LabelPricingPageProps> = ({
  onNavigate,
  onOpenAuth,
}) => {
  const { labelPricing, currentUser } = useRealtimeData();

  // Checkout modal state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<LabelCheckoutItem[]>([]);

  // Interactive Calculator State (Public services: Music, Video, Channel, VEVO)
  const [calcSongCount, setCalcSongCount] = useState(1);
  const [calcVideoSongCount, setCalcVideoSongCount] = useState(0);
  const [calcVideoChannel, setCalcVideoChannel] = useState(false);
  const [calcVevoChannel, setCalcVevoChannel] = useState(false);
  const [calcVevoVideoCount, setCalcVevoVideoCount] = useState(0);

  const {
    artist_join_plan,
    music_distribution,
    video_distribution,
    video_channel,
    vevo_services,
    revenue_share,
    currency_symbol,
  } = labelPricing;

  // Calculate live estimate in widget
  const calcMusicSubtotal = calcSongCount * music_distribution.price_per_song_inr;
  const calcVideoSubtotal = calcVideoSongCount * video_distribution.price_per_video_song_inr;
  const calcChannelSubtotal = calcVideoChannel ? video_channel.price_inr : 0;
  const calcVevoChanSubtotal = calcVevoChannel ? vevo_services.vevo_channel_setup_inr : 0;
  const calcVevoVidSubtotal = calcVevoVideoCount * vevo_services.vevo_music_video_inr;

  const totalCalculated =
    calcMusicSubtotal +
    calcVideoSubtotal +
    calcChannelSubtotal +
    calcVevoChanSubtotal +
    calcVevoVidSubtotal;

  const handleLaunchCalculatorCheckout = () => {
    const items: LabelCheckoutItem[] = [];

    if (calcSongCount > 0) {
      items.push({
        id: `item_music_${Date.now()}`,
        title: `Music Distribution (${calcSongCount} Songs)`,
        service_type: 'MUSIC_DISTRIBUTION',
        quantity: calcSongCount,
        unit_price: music_distribution.price_per_song_inr,
        subtotal: calcMusicSubtotal,
        details: `DSP submission via ${music_distribution.distribution_provider || 'DITTO'}`,
      });
    }

    if (calcVideoSongCount > 0) {
      items.push({
        id: `item_vid_${Date.now()}`,
        title: `Video Song Distribution (${calcVideoSongCount} Videos)`,
        service_type: 'VIDEO_DISTRIBUTION',
        quantity: calcVideoSongCount,
        unit_price: video_distribution.price_per_video_song_inr,
        subtotal: calcVideoSubtotal,
      });
    }

    if (calcVideoChannel) {
      items.push({
        id: `item_chan_${Date.now()}`,
        title: video_channel.title,
        service_type: 'VIDEO_CHANNEL',
        quantity: 1,
        unit_price: video_channel.price_inr,
        subtotal: calcChannelSubtotal,
      });
    }

    if (calcVevoChannel) {
      items.push({
        id: `item_vevo_c_${Date.now()}`,
        title: vevo_services.vevo_channel_title,
        service_type: 'VEVO_CHANNEL',
        quantity: 1,
        unit_price: vevo_services.vevo_channel_setup_inr,
        subtotal: calcVevoChanSubtotal,
      });
    }

    if (calcVevoVideoCount > 0) {
      items.push({
        id: `item_vevo_v_${Date.now()}`,
        title: `${vevo_services.vevo_music_video_title} (${calcVevoVideoCount} Videos)`,
        service_type: 'VEVO_VIDEO',
        quantity: calcVevoVideoCount,
        unit_price: vevo_services.vevo_music_video_inr,
        subtotal: calcVevoVidSubtotal,
      });
    }

    if (items.length === 0) return;

    setCheckoutItems(items);
    setCheckoutOpen(true);
  };

  const handleSelectSingleService = (item: LabelCheckoutItem) => {
    setCheckoutItems([item]);
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 pt-24 pb-20 selection:bg-rose-600 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Record Label — Services & Distribution Rates</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight uppercase font-display">
            Transparent Label Pricing
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Standard distribution fees, VEVO channel provisioning, and music video ingestion rates. Transparent per-release accounting with no hidden markups.
          </p>
        </div>

        {/* Invite-Only Advisory Banner */}
        <div className="bg-gradient-to-r from-rose-950/40 via-zinc-950 to-zinc-950 border border-rose-500/30 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-950 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white uppercase tracking-wider">Invite-Only Record Label</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 border border-rose-500/40 text-rose-300 font-bold">
                  Capacity: Max 40 Artists
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Artist roster membership cannot be purchased publicly. Only invited artists with an authentic cryptographic invitation token may access private application onboarding.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/label/invitation')}
            className="w-full md:w-auto px-5 py-2.5 bg-zinc-900 hover:bg-rose-950 hover:border-rose-500/60 border border-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-rose-400" />
            <span>Have an Invitation Code?</span>
          </button>
        </div>

        {/* Interactive Custom Release & Service Calculator */}
        <div className="bg-gradient-to-b from-zinc-950 to-[#0c0c11] border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  Interactive Distribution & Channel Calculator
                </h2>
                <p className="text-xs text-zinc-400">
                  Select your requested release services for an instant transparent fee breakdown.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Primary Partner:</span>
              <span className="px-2.5 py-1 bg-zinc-900 border border-white/10 rounded-lg text-xs font-bold text-white">
                {music_distribution.distribution_provider || 'DITTO'}
              </span>
            </div>
          </div>

          {/* Grid of Interactive Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Control 1: Music Distribution Songs */}
            <div className="p-4 bg-zinc-900/60 border border-white/10 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Music Distribution</span>
                <span className="text-xs font-mono font-bold text-rose-400">
                  {currency_symbol}{calcMusicSubtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span>Number of Songs:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcSongCount(Math.max(0, calcSongCount - 1))}
                    className="w-6 h-6 rounded bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold hover:bg-zinc-700 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-white w-6 text-center">{calcSongCount}</span>
                  <button
                    type="button"
                    onClick={() => setCalcSongCount(calcSongCount + 1)}
                    className="w-6 h-6 rounded bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold hover:bg-zinc-700 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500">
                {currency_symbol}{music_distribution.price_per_song_inr.toLocaleString()} per song across 150+ DSPs.
              </p>
            </div>

            {/* Control 2: Video Song Distribution */}
            <div className="p-4 bg-zinc-900/60 border border-white/10 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Video Song Dist.</span>
                <span className="text-xs font-mono font-bold text-purple-400">
                  {currency_symbol}{calcVideoSubtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span>Video Songs:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcVideoSongCount(Math.max(0, calcVideoSongCount - 1))}
                    className="w-6 h-6 rounded bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold hover:bg-zinc-700 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-white w-6 text-center">{calcVideoSongCount}</span>
                  <button
                    type="button"
                    onClick={() => setCalcVideoSongCount(calcVideoSongCount + 1)}
                    className="w-6 h-6 rounded bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold hover:bg-zinc-700 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500">
                {currency_symbol}{video_distribution.price_per_video_song_inr.toLocaleString()} per video song.
              </p>
            </div>

            {/* Control 3: Video Channel Setup */}
            <div className="p-4 bg-zinc-900/60 border border-white/10 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Video Channel Setup</span>
                <span className="text-xs font-mono font-bold text-red-400">
                  {currency_symbol}{calcChannelSubtotal.toLocaleString()}
                </span>
              </div>
              <label className="flex items-center gap-3 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={calcVideoChannel}
                  onChange={(e) => setCalcVideoChannel(e.target.checked)}
                  className="rounded border-white/20 text-red-600 focus:ring-red-500"
                />
                <span>Add Channel Setup ({currency_symbol}{video_channel.price_inr.toLocaleString()})</span>
              </label>
              <p className="text-[11px] text-zinc-500">
                One-time artist channel setup and distribution ingestion.
              </p>
            </div>

            {/* Control 4: VEVO Services (Channel + Videos) */}
            <div className="p-4 bg-zinc-900/60 border border-white/10 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">VEVO Services</span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {currency_symbol}{(calcVevoChanSubtotal + calcVevoVidSubtotal).toLocaleString()}
                </span>
              </div>
              <label className="flex items-center gap-3 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={calcVevoChannel}
                  onChange={(e) => setCalcVevoChannel(e.target.checked)}
                  className="rounded border-white/20 text-amber-600 focus:ring-amber-500"
                />
                <span>VEVO Channel ({currency_symbol}{vevo_services.vevo_channel_setup_inr.toLocaleString()})</span>
              </label>
              <div className="flex items-center justify-between text-xs text-zinc-300 pt-1">
                <span>VEVO Videos ({currency_symbol}{vevo_services.vevo_music_video_inr.toLocaleString()}/ea):</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcVevoVideoCount(Math.max(0, calcVevoVideoCount - 1))}
                    className="w-6 h-6 rounded bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold hover:bg-zinc-700 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-white w-6 text-center">{calcVevoVideoCount}</span>
                  <button
                    type="button"
                    onClick={() => setCalcVevoVideoCount(calcVevoVideoCount + 1)}
                    className="w-6 h-6 rounded bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold hover:bg-zinc-700 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Calculator Bottom Summary & Checkout Trigger */}
          <div className="p-6 bg-black/60 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Estimated Total Subtotal</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {currency_symbol}{totalCalculated.toLocaleString()}
                </span>
                <span className="text-xs text-zinc-400">INR</span>
              </div>
            </div>

            <button
              onClick={handleLaunchCalculatorCheckout}
              disabled={totalCalculated === 0}
              className="w-full sm:w-auto px-8 py-3.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-900/40 cursor-pointer"
            >
              <span>Proceed to Itemized Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Full Comprehensive Pricing Table */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Individual Plans & Service Rates
            </h2>
            <p className="text-xs text-zinc-400">
              Configured directly by Platform Administrators. Live verified pricing.
            </p>
          </div>

          <LabelPricingTable
            pricing={labelPricing}
            onSelectService={handleSelectSingleService}
          />
        </div>

        {/* Revenue Share Model Explanation */}
        <div className="p-8 bg-zinc-950 border border-white/10 rounded-3xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{revenue_share.artist_share_percent}% / {revenue_share.label_share_percent}% Label Revenue Share Model</h3>
              <p className="text-xs text-zinc-400">How earnings are transparently split and disbursed.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-xl space-y-2">
              <span className="font-bold text-white uppercase text-[11px] tracking-wider">1. Eligible Gross Streams</span>
              <p className="text-zinc-400 leading-relaxed">
                Royalties generated from digital DSPs (Spotify, Apple Music, YouTube Music, JioSaavn) are collected via the distribution pipeline.
              </p>
            </div>

            <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-xl space-y-2">
              <span className="font-bold text-rose-400 uppercase text-[11px] tracking-wider">2. Label Share: {revenue_share.label_share_percent}%</span>
              <p className="text-zinc-400 leading-relaxed">
                {revenue_share.label_share_percent}% label share applies strictly according to signed agreements to cover administration and pipeline maintenance.
              </p>
            </div>

            <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-xl space-y-2">
              <span className="font-bold text-emerald-400 uppercase text-[11px] tracking-wider">3. Artist Share: {revenue_share.artist_share_percent}%</span>
              <p className="text-zinc-400 leading-relaxed">
                The artist retains {revenue_share.artist_share_percent}% of net eligible royalties with quarterly reporting and direct settlement.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-zinc-400">
              Clear answers regarding distribution submission, fees, and membership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-5 bg-zinc-950 border border-white/10 rounded-2xl space-y-2">
              <h4 className="font-bold text-white">How does the invite-only onboarding process work?</h4>
              <p className="text-zinc-400 leading-relaxed">
                Prantik Sarkar Artist Record is strictly invite-only, capped at 40 approved artists. Eligible artists receive a secure cryptographic invitation token from label leadership. Once submitted, each application is reviewed personally before approval.
              </p>
            </div>

            <div className="p-5 bg-zinc-950 border border-white/10 rounded-2xl space-y-2">
              <h4 className="font-bold text-white">When is the ₹999 joining fee charged?</h4>
              <p className="text-zinc-400 leading-relaxed">
                The ₹999 onboarding fee is only payable after an artist invitation application has been reviewed and officially approved by label administrators.
              </p>
            </div>

            <div className="p-5 bg-zinc-950 border border-white/10 rounded-2xl space-y-2">
              <h4 className="font-bold text-white">How does the ₹3,000 per-song distribution work?</h4>
              <p className="text-zinc-400 leading-relaxed">
                Distribution is calculated on a per-song basis (e.g. 1 song = ₹3,000, 2 songs = ₹6,000). A release with multiple tracks calculates the fee based on track count.
              </p>
            </div>

            <div className="p-5 bg-zinc-950 border border-white/10 rounded-2xl space-y-2">
              <h4 className="font-bold text-white">Does paying the fee guarantee VEVO or platform verification?</h4>
              <p className="text-zinc-400 leading-relaxed">
                No. Fees cover ingestion and distribution pipeline processing. Channel approval, badge verification, and playlist placement remain subject to external DSP platform guidelines and editorial discretion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Checkout Modal */}
      <LabelCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        pricing={labelPricing}
        initialItems={checkoutItems}
        currentUser={currentUser}
        onOpenAuth={onOpenAuth}
        onOrderSuccess={() => {
          // Success handled in modal
        }}
      />
    </div>
  );
};
