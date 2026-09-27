import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Gift,
  Coins,
  Bot,
  ShieldCheck,
  Ticket,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Flame,
  HelpCircle,
  Check,
  RefreshCw,
} from 'lucide-react';
import { User, DailyCheckIn, DailyRoll, PlatformRewardItem, RewardClaim, UserWallet } from '../../../types';
import { db, DEFAULT_PLATFORM_REWARDS } from '../../../services/db';

interface UserRewardsViewProps {
  currentUser: User;
  onNavigateTab: (tab: string) => void;
}

export const UserRewardsView: React.FC<UserRewardsViewProps> = ({
  currentUser,
  onNavigateTab,
}) => {
  const [wallet, setWallet] = useState<UserWallet>(() => db.getUserWallet(currentUser.id));
  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(() => db.getTodayCheckIn(currentUser.id));
  const [todayRoll, setTodayRoll] = useState<DailyRoll | null>(() => db.getTodayRoll(currentUser.id));
  const [isRolling, setIsRolling] = useState(false);
  const [rollAnimationIndex, setRollAnimationIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshRewards = () => {
    setWallet(db.getUserWallet(currentUser.id));
    setTodayCheckIn(db.getTodayCheckIn(currentUser.id));
    setTodayRoll(db.getTodayRoll(currentUser.id));
  };

  useEffect(() => {
    refreshRewards();
  }, [currentUser.id]);

  // Claim Daily Check-in
  const handleClaimCheckIn = () => {
    const res = db.claimDailyCheckIn(currentUser.id);
    refreshRewards();
    showToast(res.message);
  };

  // Play Daily Lucky Roll (Strictly non-cash promotional reward game)
  const handlePlayRoll = () => {
    if (todayRoll || isRolling) return;
    setIsRolling(true);

    let counter = 0;
    const interval = setInterval(() => {
      setRollAnimationIndex((prev) => (prev + 1) % 5);
      counter++;
      if (counter > 15) {
        clearInterval(interval);
        const res = db.playDailyRoll(currentUser.id);
        setIsRolling(false);
        refreshRewards();
        showToast(`Lucky Spin Result: Won "${res.result.title}"!`);
      }
    }, 100);
  };

  // Redeem Reward Item
  const handleRedeem = (rewardId: string) => {
    try {
      const res = db.redeemReward(currentUser.id, rewardId);
      refreshRewards();
      showToast(res.message);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Redemption failed');
    }
  };

  const rollOutcomes = [
    { title: '+1 Bonus AI Minute', icon: Bot, color: 'text-emerald-400' },
    { title: '+1 AI Coin Credit', icon: Coins, color: 'text-amber-400' },
    { title: 'Golden Explorer Badge', icon: ShieldCheck, color: 'text-rose-400' },
    { title: '+2 Bonus AI Minutes', icon: Sparkles, color: 'text-purple-400' },
    { title: 'VIP Tour Presale Priority', icon: Ticket, color: 'text-blue-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 border border-rose-500/50 text-white text-xs px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-rose-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-white uppercase tracking-tight">
                DAILY REWARDS & LUCKY ROLL (/dashboard/rewards)
              </h2>
              <p className="text-xs text-zinc-400">
                Claim your daily check-in perks, test your daily spin, and redeem exclusive fan club rewards.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('wallet')}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border border-white/10"
          >
            <span>View Wallet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top 2 Action Cards: Daily Check-in & Daily Lucky Spin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: DAILY CHECK-IN */}
        <div className="p-6 bg-zinc-950 border border-emerald-500/30 rounded-xl space-y-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-emerald-400" />
                <h3 className="font-display font-extrabold text-base text-white uppercase">
                  Daily Check-In
                </h3>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                +1 FREE AI MINUTE
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Check in daily to claim complimentary AI chat minutes and build your fan loyalty streak.
            </p>

            {/* Streak pills */}
            <div className="grid grid-cols-7 gap-1 pt-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                <div
                  key={day}
                  className={`p-2 rounded text-center text-[10px] font-mono ${
                    todayCheckIn && idx === 0
                      ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-400 font-bold'
                      : 'bg-zinc-900 border border-white/5 text-zinc-500'
                  }`}
                >
                  <p>{day}</p>
                  <p className="mt-1">{todayCheckIn && idx === 0 ? '✓' : '•'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            {todayCheckIn ? (
              <div className="w-full py-2.5 bg-zinc-900 border border-emerald-500/30 text-emerald-400 font-bold uppercase tracking-wider rounded-lg text-xs flex items-center justify-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Claimed for Today ({todayCheckIn.date_str})</span>
              </div>
            ) : (
              <button
                onClick={handleClaimCheckIn}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-transform hover:scale-[1.02]"
              >
                <Gift className="w-4 h-4" />
                <span>Claim Daily Check-In (+1 AI Minute)</span>
              </button>
            )}
          </div>
        </div>

        {/* CARD 2: DAILY LUCKY ROLL / SPIN (NON-CASH) */}
        <div className="p-6 bg-zinc-950 border border-amber-500/30 rounded-xl space-y-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-extrabold text-base text-white uppercase">
                  Daily Lucky Spin
                </h3>
              </div>
              <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
                1 FREE ROLL / 24H
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Test your luck on the promotional reward wheel. Strictly non-cash; outcomes are verified on the server.
            </p>

            {/* Roller Slot Box */}
            <div className="p-4 bg-zinc-900/90 border border-white/10 rounded-lg text-center font-mono">
              {todayRoll ? (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase text-zinc-500">Today's Won Prize</p>
                  <p className="text-sm font-bold text-amber-300">{todayRoll.roll_result.title}</p>
                  <p className="text-[10px] text-zinc-400">{todayRoll.roll_result.description}</p>
                </div>
              ) : isRolling ? (
                <div className="space-y-1 animate-pulse">
                  <p className="text-[10px] uppercase text-zinc-500">Spinning Wheel...</p>
                  <p className={`text-sm font-bold ${rollOutcomes[rollAnimationIndex].color}`}>
                    {rollOutcomes[rollAnimationIndex].title}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase text-zinc-500">Prize Pool</p>
                  <p className="text-xs text-zinc-300">
                    +1 or +2 Bonus AI Minutes • +1 AI Coin Credit • Golden Badges
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            {todayRoll ? (
              <div className="w-full py-2.5 bg-zinc-900 border border-amber-500/30 text-amber-400 font-bold uppercase tracking-wider rounded-lg text-xs flex items-center justify-center gap-2 font-mono">
                <Check className="w-4 h-4" />
                <span>Spin Used Today • Next in 24 Hours</span>
              </div>
            ) : (
              <button
                onClick={handlePlayRoll}
                disabled={isRolling}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold uppercase tracking-wider rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-transform hover:scale-[1.02]"
              >
                {isRolling ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Spinning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Spin Daily Wheel (Free)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Non-gambling Transparency Notice */}
      <div className="p-4 bg-zinc-900/40 border border-white/10 rounded-xl text-xs text-zinc-400 flex items-center gap-3">
        <HelpCircle className="w-4 h-4 text-zinc-400 shrink-0" />
        <p className="text-[11px] leading-relaxed">
          <strong className="text-zinc-300">Strict Non-Gambling & Regulatory Compliance Policy:</strong> Daily rewards and spins are complimentary promotional perks only. No monetary betting, wagering, or cash conversions are permitted. All spin results are determined server-side using secure cryptographic random generation and permanently recorded in the database.
        </p>
      </div>

      {/* Platform Rewards Redeem Store */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display font-bold text-base text-white uppercase tracking-wider">
            Redeem Platform Perks & Upgrades
          </h3>
          <p className="text-xs text-zinc-400">
            Redeem eligible digital badges and AI assistant bonuses.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEFAULT_PLATFORM_REWARDS.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-zinc-950 border border-white/10 hover:border-white/20 rounded-xl space-y-3 flex flex-col justify-between transition-colors shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-zinc-900 border border-white/10 text-zinc-400 px-2 py-0.5 rounded font-mono font-bold">
                    {item.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {item.cost_credits} PTS
                  </span>
                </div>

                <h4 className="font-display font-bold text-sm text-white uppercase">{item.name}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
              </div>

              <button
                onClick={() => handleRedeem(item.id)}
                className="w-full py-2 bg-zinc-900 hover:bg-rose-600 text-zinc-300 hover:text-white border border-white/10 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Redeem Perk
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
