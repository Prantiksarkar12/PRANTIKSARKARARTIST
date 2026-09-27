import React, { useState } from 'react';
import {
  Check,
  Music,
  Video as VideoIcon,
  Tv,
  Youtube,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Info,
  HelpCircle,
  TrendingUp,
  Percent,
  Layers,
  Radio,
  Lock,
  KeyRound,
} from 'lucide-react';
import { LabelPricingConfig, LabelCheckoutItem } from '../../types';

interface LabelPricingTableProps {
  pricing: LabelPricingConfig;
  onSelectService: (item: LabelCheckoutItem) => void;
  onSelectBundle?: (items: LabelCheckoutItem[]) => void;
}

export const LabelPricingTable: React.FC<LabelPricingTableProps> = ({
  pricing,
  onSelectService,
  onSelectBundle,
}) => {
  const [songCount, setSongCount] = useState<number>(1);
  const [videoCount, setVideoCount] = useState<number>(1);
  const [vevoVideoCount, setVevoVideoCount] = useState<number>(1);

  const {
    artist_join_plan,
    music_distribution,
    video_distribution,
    video_channel,
    vevo_services,
    revenue_share,
    currency_symbol,
  } = pricing;

  // Handlers for instant ordering
  const handleJoinPlan = () => {
    onSelectService({
      id: `item_join_${Date.now()}`,
      title: `${artist_join_plan.plan_name} (Joining Onboarding)`,
      service_type: 'JOIN_FEE',
      quantity: 1,
      unit_price: artist_join_plan.join_fee_inr,
      subtotal: artist_join_plan.join_fee_inr,
      details: `One-time joining fee of ${currency_symbol}${artist_join_plan.join_fee_inr.toLocaleString()} upon acceptance. Annual membership applies at ${currency_symbol}${artist_join_plan.annual_fee_inr.toLocaleString()}/year.`,
    });
  };

  const handleMusicDist = () => {
    onSelectService({
      id: `item_music_${Date.now()}`,
      title: `Music Distribution (${songCount} ${songCount === 1 ? 'Song' : 'Songs'})`,
      service_type: 'MUSIC_DISTRIBUTION',
      quantity: songCount,
      unit_price: music_distribution.price_per_song_inr,
      subtotal: music_distribution.price_per_song_inr * songCount,
      details: `Worldwide distribution across 150+ DSPs via ${music_distribution.distribution_provider || 'DITTO'}.`,
    });
  };

  const handleVideoDist = () => {
    onSelectService({
      id: `item_video_${Date.now()}`,
      title: `Video Song Distribution (${videoCount} ${videoCount === 1 ? 'Video' : 'Videos'})`,
      service_type: 'VIDEO_DISTRIBUTION',
      quantity: videoCount,
      unit_price: video_distribution.price_per_video_song_inr,
      subtotal: video_distribution.price_per_video_song_inr * videoCount,
      details: 'Music video distribution to global video streaming partner networks.',
    });
  };

  const handleVideoChannel = () => {
    onSelectService({
      id: `item_channel_${Date.now()}`,
      title: video_channel.title,
      service_type: 'VIDEO_CHANNEL',
      quantity: 1,
      unit_price: video_channel.price_inr,
      subtotal: video_channel.price_inr,
      details: video_channel.description,
    });
  };

  const handleVevoChannel = () => {
    onSelectService({
      id: `item_vevo_chan_${Date.now()}`,
      title: vevo_services.vevo_channel_title,
      service_type: 'VEVO_CHANNEL',
      quantity: 1,
      unit_price: vevo_services.vevo_channel_setup_inr,
      subtotal: vevo_services.vevo_channel_setup_inr,
      details: vevo_services.vevo_channel_description,
    });
  };

  const handleVevoVideo = () => {
    onSelectService({
      id: `item_vevo_vid_${Date.now()}`,
      title: `${vevo_services.vevo_music_video_title} (${vevoVideoCount} ${vevoVideoCount === 1 ? 'Video' : 'Videos'})`,
      service_type: 'VEVO_VIDEO',
      quantity: vevoVideoCount,
      unit_price: vevo_services.vevo_music_video_inr,
      subtotal: vevo_services.vevo_music_video_inr * vevoVideoCount,
      details: vevo_services.vevo_music_video_description,
    });
  };

  return (
    <div className="space-y-12">
      {/* 1. Primary Highlight: Label Artist Plan (Invite-Only Roster) */}
      <div className="relative rounded-2xl bg-zinc-950 border-2 border-rose-600/60 p-6 sm:p-8 overflow-hidden shadow-2xl shadow-rose-950/20">
        <div className="absolute top-0 right-0 px-4 py-1.5 bg-rose-600 text-white text-[11px] font-extrabold uppercase tracking-wider rounded-bl-xl shadow flex items-center gap-1.5">
          <Lock className="w-3 h-3" />
          <span>Invite-Only Roster</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{artist_join_plan.plan_name} — Max 40 Artists</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Official Label Artist Membership
            </h3>

            <p className="text-sm text-zinc-400 leading-relaxed">
              {artist_join_plan.description} Admission to the roster is strictly invite-only. Membership cannot be purchased by the general public.
            </p>

            {/* Included Management Capabilities */}
            <div className="pt-2">
              <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Included Artist Management & Portal Features:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                {artist_join_plan.included_features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm bg-[#070709] border border-white/15 rounded-2xl p-6 text-center space-y-4 shadow-xl">
              {/* Join & Annual Fee Breakdown */}
              <div className="space-y-3 pb-3 border-b border-white/10">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Onboarding Fee</span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white">
                    {currency_symbol}{artist_join_plan.join_fee_inr.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-zinc-400">Payable only upon official invitation & approval</span>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Annual Membership</span>
                  <div className="text-xl sm:text-2xl font-bold text-zinc-200">
                    {currency_symbol}{artist_join_plan.annual_fee_inr.toLocaleString()}<span className="text-xs text-zinc-400 font-normal"> / year</span>
                  </div>
                </div>
              </div>

              <a
                href="#/label/invitation"
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-900/40 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Enter Invitation Token</span>
              </a>

              <p className="text-[10px] text-zinc-500 leading-normal">
                Strict capacity limit of 40 active artists. Applications without a valid token are rejected automatically.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Services & Distribution Catalog Grid */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Distribution & Channel Services
          </h3>
          <p className="text-xs text-zinc-400">
            Per-song distribution, video networks, and channel setup options.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card A: Music Distribution */}
          <div className="bg-zinc-950 border border-white/10 hover:border-white/20 rounded-2xl p-6 flex flex-col justify-between space-y-6 transition-all shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Music className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-400">
                  Per Song
                </span>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">Music Distribution</h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-white">
                    {currency_symbol}{music_distribution.price_per_song_inr.toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-400">/ song</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {music_distribution.description}
                </p>
              </div>

              {/* Dynamic Song Calculator */}
              <div className="p-3 bg-zinc-900/60 border border-white/5 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span>Number of Songs:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSongCount(Math.max(1, songCount - 1))}
                      className="w-5 h-5 rounded bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold hover:bg-zinc-700 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-white w-4 text-center">{songCount}</span>
                    <button
                      type="button"
                      onClick={() => setSongCount(songCount + 1)}
                      className="w-5 h-5 rounded bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold hover:bg-zinc-700 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <span className="text-zinc-400">Calculated Fee:</span>
                  <span className="font-mono font-extrabold text-rose-400">
                    {currency_symbol}{(music_distribution.price_per_song_inr * songCount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleMusicDist}
              className="w-full py-2.5 bg-zinc-900 hover:bg-rose-600 text-zinc-200 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Distribute {songCount} {songCount === 1 ? 'Song' : 'Songs'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card B: Video / Music Video Distribution */}
          <div className="bg-zinc-950 border border-white/10 hover:border-white/20 rounded-2xl p-6 flex flex-col justify-between space-y-6 transition-all shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <VideoIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-400">
                  Per Video
                </span>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">Video Song Distribution</h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-white">
                    {currency_symbol}{video_distribution.price_per_video_song_inr.toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-400">/ video song</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {video_distribution.description} Separate from audio distribution.
                </p>
              </div>

              {/* Dynamic Video Calculator */}
              <div className="p-3 bg-zinc-900/60 border border-white/5 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span>Number of Video Songs:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setVideoCount(Math.max(1, videoCount - 1))}
                      className="w-5 h-5 rounded bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold hover:bg-zinc-700 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-white w-4 text-center">{videoCount}</span>
                    <button
                      type="button"
                      onClick={() => setVideoCount(videoCount + 1)}
                      className="w-5 h-5 rounded bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold hover:bg-zinc-700 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <span className="text-zinc-400">Calculated Fee:</span>
                  <span className="font-mono font-extrabold text-purple-400">
                    {currency_symbol}{(video_distribution.price_per_video_song_inr * videoCount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleVideoDist}
              className="w-full py-2.5 bg-zinc-900 hover:bg-purple-600 text-zinc-200 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Distribute {videoCount} {videoCount === 1 ? 'Video' : 'Videos'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card C: Video Channel Service */}
          <div className="bg-zinc-950 border border-white/10 hover:border-white/20 rounded-2xl p-6 flex flex-col justify-between space-y-6 transition-all shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Tv className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-400">
                  One-Time
                </span>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">{video_channel.title}</h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-white">
                    {currency_symbol}{video_channel.price_inr.toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-400">one-time</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {video_channel.description}
                </p>
              </div>

              <div className="p-3 bg-zinc-900/40 border border-white/5 rounded-xl flex items-start gap-2 text-[11px] text-zinc-400">
                <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <span>{video_channel.disclaimer}</span>
              </div>
            </div>

            <button
              onClick={handleVideoChannel}
              className="w-full py-2.5 bg-zinc-900 hover:bg-red-600 text-zinc-200 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Setup Video Channel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card D: VEVO Channel Setup */}
          <div className="bg-zinc-950 border border-white/10 hover:border-white/20 rounded-2xl p-6 flex flex-col justify-between space-y-6 transition-all shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Youtube className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-400">
                  VEVO Service
                </span>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">{vevo_services.vevo_channel_title}</h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-white">
                    {currency_symbol}{vevo_services.vevo_channel_setup_inr.toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-400">/ channel</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {vevo_services.vevo_channel_description}
                </p>
              </div>

              <div className="p-3 bg-zinc-900/40 border border-white/5 rounded-xl flex items-start gap-2 text-[11px] text-zinc-400">
                <Info className="w-3.5 h-3.5 text-amber-500/80 shrink-0 mt-0.5" />
                <span>{vevo_services.disclaimer}</span>
              </div>
            </div>

            <button
              onClick={handleVevoChannel}
              className="w-full py-2.5 bg-zinc-900 hover:bg-amber-600 text-zinc-200 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Provision VEVO Channel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card E: VEVO Music Video */}
          <div className="bg-zinc-950 border border-white/10 hover:border-white/20 rounded-2xl p-6 flex flex-col justify-between space-y-6 transition-all shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-pink-950/60 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Radio className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-400">
                  VEVO Video
                </span>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">{vevo_services.vevo_music_video_title}</h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-white">
                    {currency_symbol}{vevo_services.vevo_music_video_inr.toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-400">/ video song</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {vevo_services.vevo_music_video_description}
                </p>
              </div>

              {/* Dynamic Vevo Video Calculator */}
              <div className="p-3 bg-zinc-900/60 border border-white/5 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span>Number of VEVO Videos:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setVevoVideoCount(Math.max(1, vevoVideoCount - 1))}
                      className="w-5 h-5 rounded bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold hover:bg-zinc-700 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-white w-4 text-center">{vevoVideoCount}</span>
                    <button
                      type="button"
                      onClick={() => setVevoVideoCount(vevoVideoCount + 1)}
                      className="w-5 h-5 rounded bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold hover:bg-zinc-700 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <span className="text-zinc-400">Calculated Fee:</span>
                  <span className="font-mono font-extrabold text-pink-400">
                    {currency_symbol}{(vevo_services.vevo_music_video_inr * vevoVideoCount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleVevoVideo}
              className="w-full py-2.5 bg-zinc-900 hover:bg-pink-600 text-zinc-200 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Submit {vevoVideoCount} VEVO Video</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card F: Summary Table & Revenue Share Indicator */}
          <div className="bg-zinc-950 border border-rose-500/30 rounded-2xl p-6 flex flex-col justify-between space-y-6 transition-all shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Percent className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
                  Transparent Split
                </span>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">Label Revenue Share</h4>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-emerald-400">
                    {revenue_share.artist_share_percent}%
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold">Artist Share</span>
                  <span className="text-xs text-zinc-500">/</span>
                  <span className="text-base font-bold text-zinc-400">
                    {revenue_share.label_share_percent}% Label
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {revenue_share.agreement_terms}
                </p>
              </div>

              <div className="space-y-1.5 p-3 bg-zinc-900/60 border border-white/5 rounded-xl text-xs text-zinc-300">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Gross Royalties</span>
                  <span className="font-semibold text-white">100%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">DSP / Distributor Deductions</span>
                  <span className="font-semibold text-zinc-400">As Incurred</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/10 text-emerald-300 font-bold">
                  <span>Artist Net Payout</span>
                  <span>{revenue_share.artist_share_percent}%</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-zinc-900 border border-white/10 rounded-xl text-center text-xs text-zinc-400">
              Provider: <span className="font-bold text-white">{music_distribution.distribution_provider || 'DITTO'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
