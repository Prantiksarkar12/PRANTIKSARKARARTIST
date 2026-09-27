import React, { useState, useEffect } from 'react';
import {
  Users,
  Copy,
  Check,
  Sparkles,
  Gift,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { User, ReferralCode, Referral } from '../../../types';
import { db } from '../../../services/db';

interface UserReferralsViewProps {
  currentUser: User;
  onNavigateTab: (tab: string) => void;
}

export const UserReferralsView: React.FC<UserReferralsViewProps> = ({
  currentUser,
  onNavigateTab,
}) => {
  const [referralCode, setReferralCode] = useState<ReferralCode>(() => db.getUserReferralCode(currentUser.id));
  const [referrals, setReferrals] = useState<Referral[]>(() => db.getUserReferrals(currentUser.id));
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshReferrals = () => {
    setReferralCode(db.getUserReferralCode(currentUser.id));
    setReferrals(db.getUserReferrals(currentUser.id));
  };

  useEffect(() => {
    refreshReferrals();
  }, [currentUser.id]);

  const referralLink = `${window.location.origin}/signup?ref=${referralCode.code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Referral link copied to clipboard!');
  };

  const stats = db.getUserReferralStats(currentUser.id);

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 border border-emerald-500/50 text-white text-xs px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-white uppercase tracking-tight">
                FAN REFERRALS & BONUS AI PROGRAM (/dashboard/referrals)
              </h2>
              <p className="text-xs text-zinc-400">
                Invite fellow fans to the official portal. Earn +1 Bonus Free AI Minute for every verified account.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('wallet')}
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border border-white/10"
        >
          <span>View Wallet</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Referral Code Share Banner */}
      <div className="p-6 bg-gradient-to-r from-purple-950/40 via-zinc-950 to-zinc-950 border border-purple-500/40 rounded-xl space-y-4 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-purple-400 font-mono">YOUR EXCLUSIVE REFERRAL CODE</span>
            <div className="text-2xl font-mono font-black text-white tracking-wider flex items-center gap-3">
              <span>{referralCode.code}</span>
              <span className="text-[10px] bg-purple-950 border border-purple-500/50 text-purple-300 px-2 py-0.5 rounded font-mono font-bold">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Share this link with friends. When they create a free account, both of you receive +1 Bonus AI Minute immediately.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg transition-transform hover:scale-105"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Copy Referral Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Referral Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-1">
          <p className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Total Friends Invited</p>
          <p className="text-2xl font-display font-black text-white">{stats.total}</p>
        </div>

        <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-1">
          <p className="text-[10px] uppercase font-bold text-amber-400 font-mono">Pending Verification</p>
          <p className="text-2xl font-display font-black text-amber-400">{stats.pending}</p>
        </div>

        <div className="p-4 bg-zinc-950 border border-emerald-500/30 rounded-xl space-y-1">
          <p className="text-[10px] uppercase font-bold text-emerald-400 font-mono">Qualified Referrals</p>
          <p className="text-2xl font-display font-black text-emerald-400">{stats.qualified}</p>
        </div>

        <div className="p-4 bg-zinc-950 border border-purple-500/30 rounded-xl space-y-1">
          <p className="text-[10px] uppercase font-bold text-purple-400 font-mono">Bonus AI Earned</p>
          <p className="text-2xl font-display font-black text-purple-400">+{stats.totalRewardsEarned}m</p>
        </div>
      </div>

      {/* Referrals History Table */}
      <div className="p-6 bg-zinc-950 border border-white/10 rounded-xl space-y-4 shadow-2xl">
        <h3 className="font-display font-bold text-base text-white uppercase tracking-wider">
          Referral Invitee History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900 text-zinc-400 uppercase font-mono text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Invited User</th>
                <th className="py-3 px-4">Referral Code</th>
                <th className="py-3 px-4">Attribution Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reward Credited</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    No referrals yet. Copy your referral link above and share with your friends!
                  </td>
                </tr>
              ) : (
                referrals.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      {r.referred_user_name} ({r.referred_user_email_masked})
                    </td>
                    <td className="py-3 px-4 text-purple-400">{r.referral_code}</td>
                    <td className="py-3 px-4 text-zinc-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold uppercase">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">
                      +{r.reward_value} Bonus AI Minute
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
