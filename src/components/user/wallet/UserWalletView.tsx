import React, { useState, useEffect, useMemo } from 'react';
import {
  Coins,
  Clock,
  CreditCard,
  History,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Download,
  Search,
  ArrowRight,
  Plus,
  RefreshCw,
  X,
  Lock,
  DollarSign,
  HelpCircle,
  FileText,
  Info,
} from 'lucide-react';
import { User, UserWallet, AiFreeAllowance, WalletTransaction, CoinPackage } from '../../../types';
import { db, DEFAULT_COIN_PACKAGES } from '../../../services/db';

interface UserWalletViewProps {
  currentUser: User;
  onNavigateTab: (tab: string) => void;
}

export const UserWalletView: React.FC<UserWalletViewProps> = ({
  currentUser,
  onNavigateTab,
}) => {
  const [wallet, setWallet] = useState<UserWallet>(() => db.getUserWallet(currentUser.id));
  const [allowance, setAllowance] = useState<AiFreeAllowance>(() => db.getUserFreeAllowance(currentUser.id));
  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => db.getWalletTransactions(currentUser.id));

  // Modals & Purchase State
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [paymentProvider, setPaymentProvider] = useState<'UPI' | 'CARDS' | 'NETBANKING'>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [purchaseSuccessTx, setPurchaseSuccessTx] = useState<WalletTransaction | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshWallet = () => {
    const w = db.getUserWallet(currentUser.id);
    const a = db.getUserFreeAllowance(currentUser.id);
    const txs = db.getWalletTransactions(currentUser.id);
    setWallet(w);
    setAllowance(a);
    setTransactions(txs);
  };

  useEffect(() => {
    refreshWallet();
  }, [currentUser.id]);

  // Real countdown to server-side 24h reset
  const [countdownStr, setCountdownStr] = useState<string>('');
  useEffect(() => {
    const updateCountdown = () => {
      const nextResetMs = new Date(allowance.next_reset_at).getTime();
      const diff = Math.max(0, nextResetMs - Date.now());
      if (diff === 0) {
        refreshWallet();
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdownStr(
        `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [allowance.next_reset_at, currentUser.id]);

  // Execute Verified Coin Purchase
  const handleConfirmPurchase = () => {
    if (!selectedPackage) return;
    setIsProcessingPayment(true);

    // Simulate real gateway verification and server credential authentication
    setTimeout(() => {
      const paymentRef = `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      try {
        const result = db.purchaseCoins(currentUser.id, selectedPackage.id, paymentRef);
        setIsProcessingPayment(false);
        setPurchaseSuccessTx(result.transaction);
        refreshWallet();
        showToast(`Payment Confirmed! +${result.coinsAdded} Virtual Coins credited to your wallet.`);
      } catch (err: unknown) {
        setIsProcessingPayment(false);
        showToast('Payment processing failed. Please try again.');
      }
    }, 1200);
  };

  // Export Ledger
  const handleExportLedger = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prantik_wallet_ledger_${currentUser.id}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Transaction ledger downloaded.');
  };

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== 'ALL' && t.type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.id.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.payment_ref && t.payment_ref.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [transactions, filterType, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
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
            <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-white uppercase tracking-tight">
                WALLET & AI USAGE COINS (/dashboard/wallet)
              </h2>
              <p className="text-xs text-zinc-400">
                Manage your virtual usage credits, daily complimentary free AI allowance, and immutable transaction ledger.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('ai')}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border border-white/10"
          >
            <span>Open PRANTIK AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Coins Balance */}
        <div className="p-5 bg-zinc-950 border border-amber-500/30 rounded-xl space-y-2 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-400 font-mono">COIN BALANCE</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-black text-white">{wallet.coin_balance}</span>
            <span className="text-xs text-zinc-400 font-mono">Coins</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Equivalent to <strong className="text-amber-300">{wallet.coin_balance * 5} minutes</strong> of active AI usage.
          </p>
        </div>

        {/* Metric 2: Free Daily AI */}
        <div className="p-5 bg-zinc-950 border border-emerald-500/30 rounded-xl space-y-2 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono">FREE AI REMAINING</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-black text-emerald-400 font-mono">
              {String(Math.floor(allowance.free_seconds_remaining / 60)).padStart(2, '0')}:
              {String(allowance.free_seconds_remaining % 60).padStart(2, '0')}
            </span>
            <span className="text-xs text-zinc-400 font-mono">remaining</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            1 min complimentary daily allowance.
          </p>
        </div>

        {/* Metric 3: Next Server Reset */}
        <div className="p-5 bg-zinc-950 border border-white/10 rounded-xl space-y-2 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono">NEXT FREE RESET</span>
            <RefreshCw className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-black text-white font-mono">
              {countdownStr || '23:59:59'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">
            Server-authoritative 24-hour reset cycle.
          </p>
        </div>

        {/* Metric 4: Total Purchased & Earned */}
        <div className="p-5 bg-zinc-950 border border-white/10 rounded-xl space-y-2 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-rose-400 font-mono">LIFETIME USAGE</span>
            <Sparkles className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xs text-zinc-300 space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-zinc-500">Purchased:</span>
              <span className="font-bold text-white">{wallet.total_coins_purchased} coins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Consumed:</span>
              <span className="font-bold text-white">{wallet.total_coins_used} coins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Rewards:</span>
              <span className="font-bold text-emerald-400">+{wallet.total_rewards_earned} earned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Virtual Coins Explainer & Legal Clarity Notice */}
      <div className="p-4 bg-zinc-900/50 border border-white/10 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-zinc-400">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="space-y-0.5">
            <p className="text-white font-bold">Virtual Coin Rules & Transparency</p>
            <p className="text-[11px] text-zinc-400">
              1 Coin = up to 5 minutes of active AI usage (₹100 = 10 Coins, ₹10/Coin). Coins are virtual usage credits only and are <strong className="text-zinc-300">not cash, cryptocurrency, or transferable investments</strong>.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded font-mono font-bold">
            NO SUBSCRIPTION REQUIRED
          </span>
        </div>
      </div>

      {/* Coin Purchase Packages */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-white uppercase tracking-wider">
              Purchase Virtual AI Coins
            </h3>
            <p className="text-xs text-zinc-400">
              Top up your account with instant server-verified virtual coin packages.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEFAULT_COIN_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 transition-all ${
                pkg.popular
                  ? 'bg-rose-950/20 border-rose-500/50 shadow-xl shadow-rose-950/20 relative'
                  : 'bg-zinc-950 border-white/10 hover:border-white/20'
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-2.5 right-4 bg-rose-600 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow">
                  MOST POPULAR
                </span>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-sm text-white uppercase">{pkg.name}</h4>
                  {pkg.badge && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                      {pkg.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black font-display text-white">₹{pkg.inr_price}</span>
                  <span className="text-xs text-zinc-400 font-mono">INR</span>
                </div>

                <div className="text-xs text-zinc-300 space-y-1 pt-1 font-mono">
                  <div className="flex items-center gap-2">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold text-white">{pkg.coins_count} Virtual Coins</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Up to {pkg.minutes_provided} mins AI chat</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedPackage(pkg)}
                className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  pkg.popular
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/10'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Buy {pkg.coins_count} Coins</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Immutable Transaction Ledger */}
      <div className="p-6 bg-zinc-950 border border-white/10 rounded-xl space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-extrabold text-base text-white uppercase flex items-center gap-2">
              <span>Immutable Transaction Ledger</span>
              <span className="text-[10px] bg-zinc-900 border border-white/10 text-zinc-400 px-2 py-0.5 rounded font-mono">
                {filteredTransactions.length} records
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Audit log of all coin purchases, daily free resets, AI usage deductions, and reward distributions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transaction ID or payment ref..."
                className="pl-8 pr-3 py-1.5 bg-zinc-900 border border-white/10 rounded text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Export */}
            <button
              onClick={handleExportLedger}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 rounded text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-rose-500" />
              <span>Export Ledger (.json)</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
          {[
            { id: 'ALL', label: 'All Transactions' },
            { id: 'COIN_PURCHASE', label: 'Purchases' },
            { id: 'AI_USAGE', label: 'AI Usage' },
            { id: 'FREE_AI_USAGE', label: 'Free Allowance' },
            { id: 'REWARD', label: 'Rewards' },
            { id: 'REFERRAL_REWARD', label: 'Referrals' },
            { id: 'DAILY_CHECKIN', label: 'Daily Check-in' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                filterType === f.id
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900 text-zinc-400 uppercase font-mono text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Amount (INR)</th>
                <th className="py-3 px-4">Coins Impact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payment Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500">
                    No transactions matching selected filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{tx.id}</td>
                    <td className="py-3 px-4 text-zinc-400">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tx.type === 'COIN_PURCHASE'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : tx.type === 'AI_USAGE'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            : tx.type === 'FREE_AI_USAGE'
                            ? 'bg-blue-950 text-blue-400 border border-blue-500/30'
                            : 'bg-purple-950 text-purple-400 border border-purple-500/30'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-200 max-w-xs truncate">{tx.description}</td>
                    <td className="py-3 px-4 font-bold text-white">
                      {tx.amount_inr ? `₹${tx.amount_inr}` : '—'}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      {tx.coins_delta > 0 ? (
                        <span className="text-emerald-400">+{tx.coins_delta} coins</span>
                      ) : tx.coins_delta < 0 ? (
                        <span className="text-amber-400">{tx.coins_delta} coins</span>
                      ) : tx.seconds_delta ? (
                        <span className="text-blue-400">+{tx.seconds_delta}s free</span>
                      ) : (
                        <span className="text-zinc-500">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{tx.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 text-[10px]">
                      {tx.payment_ref || 'SYSTEM_INTERNAL'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* COIN PURCHASE CHECKOUT MODAL */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-amber-400">
                <Coins className="w-5 h-5" />
                <h3 className="font-display font-bold text-base text-white uppercase">
                  Checkout: {selectedPackage.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPackage(null)}
                className="text-zinc-400 hover:text-white"
                disabled={isProcessingPayment}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Package Summary Box */}
            <div className="p-4 bg-zinc-900/80 border border-white/10 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Item:</span>
                <span className="font-bold text-white">{selectedPackage.name}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Coins to be Credited:</span>
                <span className="font-bold text-amber-400">+{selectedPackage.coins_count} Coins</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Equivalent AI Usage:</span>
                <span className="font-bold text-emerald-400">Up to {selectedPackage.minutes_provided} Minutes</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold">
                <span className="text-white">Total Amount (INR):</span>
                <span className="text-rose-400">₹{selectedPackage.inr_price}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 text-xs">
              <label className="text-[10px] uppercase font-bold text-zinc-400">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'UPI', label: 'UPI / QR' },
                  { id: 'CARDS', label: 'Debit / Card' },
                  { id: 'NETBANKING', label: 'NetBanking' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentProvider(pm.id as any)}
                    className={`py-2 rounded border text-xs font-bold uppercase transition-colors cursor-pointer ${
                      paymentProvider === pm.id
                        ? 'bg-rose-950/60 border-rose-500 text-white'
                        : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Legal Notice */}
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              By confirming, you agree that virtual coins are non-refundable digital usage credits for PRANTIK AI support chat. Server will verify payment before crediting.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPackage(null)}
                disabled={isProcessingPayment}
                className="px-4 py-2 bg-zinc-900 text-zinc-400 hover:text-white rounded uppercase font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPurchase}
                disabled={isProcessingPayment}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded uppercase font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg"
              >
                {isProcessingPayment ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Server Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay ₹{selectedPackage.inr_price} & Credit Coins</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT SUCCESS RECEIPT MODAL */}
      {purchaseSuccessTx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-emerald-500/50 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="font-display font-extrabold text-lg text-white uppercase">
              Payment Verified & Coins Credited!
            </h3>

            <p className="text-xs text-zinc-400">
              Your transaction has been recorded in the immutable ledger.
            </p>

            <div className="p-4 bg-zinc-900/80 rounded-lg text-xs space-y-2 text-left font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Transaction ID:</span>
                <span className="text-white font-bold">{purchaseSuccessTx.id}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Payment Reference:</span>
                <span className="text-emerald-400">{purchaseSuccessTx.payment_ref}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Coins Added:</span>
                <span className="text-amber-400 font-bold">+{purchaseSuccessTx.coins_delta} Coins</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Amount Paid:</span>
                <span className="text-white font-bold">₹{purchaseSuccessTx.amount_inr}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setPurchaseSuccessTx(null);
                setSelectedPackage(null);
              }}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg uppercase font-bold text-xs cursor-pointer shadow-md"
            >
              Done / Return to Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
