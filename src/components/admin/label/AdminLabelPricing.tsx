import React, { useState } from 'react';
import {
  Save,
  RotateCcw,
  CheckCircle,
  Percent,
  Music,
  Video,
  Tv,
  Youtube,
  Globe,
  DollarSign,
  FileText,
  Users,
  Receipt,
  Sparkles,
  Shield,
  Layers,
  AlertTriangle,
  Eye,
  Check,
  X,
  Clock,
} from 'lucide-react';
import { db } from '../../../services/db';
import { useRealtimeData } from '../../../hooks/useRealtimeData';
import { LabelPricingConfig, LabelServiceOrder, LabelArtistMembership, LabelDistributionSubmission, ArtistInvoice } from '../../../types';
import { InvoiceViewerModal } from '../../label/InvoiceViewerModal';

export const AdminLabelPricing: React.FC = () => {
  const { labelPricing, labelOrders, labelMemberships, labelSubmissions, artistInvoices, pricingHistory, currentUser } = useRealtimeData();

  const [activeTab, setActiveTab] = useState<'pricing' | 'orders' | 'artists' | 'submissions' | 'history'>('pricing');
  const [formData, setFormData] = useState<LabelPricingConfig>(labelPricing);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<ArtistInvoice | null>(null);

  // Sync formData when labelPricing changes externally
  React.useEffect(() => {
    setFormData(labelPricing);
  }, [labelPricing]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedBy = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Administrator';
    db.updateLabelPricingWithHistory(formData, updatedBy, 'Admin pricing schedule updated');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all label prices, plans, and service configurations to system defaults?')) {
      const updatedBy = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Administrator';
      const reset = db.resetLabelPricing(updatedBy);
      setFormData(reset);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED') => {
    db.updateLabelOrderStatus(orderId, newStatus);
  };

  const handleUpdateSubmissionStatus = (
    submissionId: string,
    status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'IN_DELIVERY' | 'LIVE' | 'REJECTED',
    notes?: string
  ) => {
    db.updateLabelSubmission(submissionId, { status, review_notes: notes });
  };

  const handleToggleMembershipStatus = (membershipId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PENDING_ONBOARDING' : 'ACTIVE';
    db.updateLabelMembership(membershipId, { status: nextStatus as any, join_fee_paid: nextStatus === 'ACTIVE' });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-zinc-950 border border-white/10 rounded-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Configurable Pricing Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Record Label — Plans, Fees & Services Console
          </h2>
          <p className="text-xs text-zinc-400">
            Route: <code className="text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded">/admin/label/pricing</code>. Manage artist membership fees, distribution rates, revenue share splits, and orders.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-zinc-900 border border-white/10 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'pricing' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Pricing & Services
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'orders' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Orders ({labelOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('artists')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'artists' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Artists ({labelMemberships.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'submissions' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Releases ({labelSubmissions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>History ({pricingHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Label pricing configuration successfully updated across the entire platform.</span>
        </div>
      )}

      {/* TAB 1: PRICING CONFIGURATION FORM */}
      {activeTab === 'pricing' && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Artist Join Plan */}
          <div className="p-6 bg-zinc-950 border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <div className="w-7 h-7 rounded-lg bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  1. Artist Join Plan & Annual Membership
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Joining fee charged upon onboarding acceptance; annual membership fee on renewal.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Plan Name</label>
                <input
                  type="text"
                  value={formData.artist_join_plan.plan_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      artist_join_plan: { ...formData.artist_join_plan, plan_name: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Joining Fee (₹ One-Time)</label>
                <input
                  type="number"
                  value={formData.artist_join_plan.join_fee_inr}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      artist_join_plan: { ...formData.artist_join_plan, join_fee_inr: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Annual Membership Fee (₹ / Year)</label>
                <input
                  type="number"
                  value={formData.artist_join_plan.annual_fee_inr}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      artist_join_plan: { ...formData.artist_join_plan, annual_fee_inr: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1 font-medium">Plan Description</label>
              <textarea
                rows={2}
                value={formData.artist_join_plan.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    artist_join_plan: { ...formData.artist_join_plan, description: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Section 2: Distribution Music & Video Rates */}
          <div className="p-6 bg-zinc-950 border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <div className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  2. Music & Video Distribution (Per Song Rates)
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Calculated dynamically per track in multi-song releases.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Music Distribution (₹ / Song)</label>
                <input
                  type="number"
                  value={formData.music_distribution.price_per_song_inr}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      music_distribution: {
                        ...formData.music_distribution,
                        price_per_song_inr: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Video Song Distribution (₹ / Video)</label>
                <input
                  type="number"
                  value={formData.video_distribution.price_per_video_song_inr}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      video_distribution: {
                        ...formData.video_distribution,
                        price_per_video_song_inr: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Default Distribution Provider</label>
                <input
                  type="text"
                  value={formData.music_distribution.distribution_provider}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      music_distribution: {
                        ...formData.music_distribution,
                        distribution_provider: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. DITTO"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500 font-bold text-rose-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Channel Setup & VEVO Services */}
          <div className="p-6 bg-zinc-950 border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <div className="w-7 h-7 rounded-lg bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400">
                <Tv className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  3. Video Channel & VEVO Services
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Channel configuration and VEVO network submission pricing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Video Channel Setup (₹ One-Time)</label>
                <input
                  type="number"
                  value={formData.video_channel.price_inr}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      video_channel: { ...formData.video_channel, price_inr: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">VEVO Channel Setup (₹ / Channel)</label>
                <input
                  type="number"
                  value={formData.vevo_services.vevo_channel_setup_inr}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vevo_services: {
                        ...formData.vevo_services,
                        vevo_channel_setup_inr: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">VEVO Music Video (₹ / Video Song)</label>
                <input
                  type="number"
                  value={formData.vevo_services.vevo_music_video_inr}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vevo_services: {
                        ...formData.vevo_services,
                        vevo_music_video_inr: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Video Channel Disclaimer</label>
                <textarea
                  rows={2}
                  value={formData.video_channel.disclaimer}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      video_channel: { ...formData.video_channel, disclaimer: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">VEVO Services Disclaimer</label>
                <textarea
                  rows={2}
                  value={formData.vevo_services.disclaimer}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vevo_services: { ...formData.vevo_services, disclaimer: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Custom Artist Website & Revenue Share */}
          <div className="p-6 bg-zinc-950 border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  4. Custom Artist Website Service & Label Revenue Split
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Custom website multi-site deployment fee and agreement revenue share policy.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Custom Website Price (₹ One-Time)</label>
                <input
                  type="number"
                  value={formData.custom_artist_website.price_inr}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      custom_artist_website: {
                        ...formData.custom_artist_website,
                        price_inr: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Label Revenue Share (%)</label>
                <input
                  type="number"
                  value={formData.revenue_share.label_share_percent}
                  onChange={(e) => {
                    const labelShare = Number(e.target.value);
                    setFormData({
                      ...formData,
                      revenue_share: {
                        ...formData.revenue_share,
                        label_share_percent: labelShare,
                        artist_share_percent: 100 - labelShare,
                      },
                    });
                  }}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Artist Revenue Share (%)</label>
                <input
                  type="number"
                  disabled
                  value={formData.revenue_share.artist_share_percent}
                  className="w-full px-3 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-emerald-400 font-bold text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1 font-medium">Refund Policy & Non-Guarantee Notice</label>
              <textarea
                rows={2}
                value={formData.refund_policy_notice}
                onChange={(e) => setFormData({ ...formData, refund_policy_notice: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-rose-900/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Pricing Configuration</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: ORDERS & INVOICES */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Label Service Orders & Invoices ({labelOrders.length})
            </h3>
            <span className="text-xs text-zinc-400">
              Total Recorded Revenue: <strong className="text-emerald-400">{labelPricing.currency_symbol}{labelOrders.reduce((sum, o) => o.payment_status === 'COMPLETED' ? sum + o.total_amount : sum, 0).toLocaleString()}</strong>
            </span>
          </div>

          {labelOrders.length === 0 ? (
            <div className="p-8 text-center bg-zinc-950 border border-white/10 rounded-2xl text-zinc-400 text-xs">
              No orders recorded yet. When artists checkout services, receipts appear here in real time.
            </div>
          ) : (
            <div className="space-y-3">
              {labelOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 bg-zinc-950 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{order.order_number}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.payment_status === 'COMPLETED'
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </div>
                    <p className="text-zinc-300">
                      Artist: <strong className="text-white">{order.artist_name}</strong> ({order.user_email})
                    </p>
                    <p className="text-zinc-500 text-[11px]">
                      Items: {order.items.map((i) => `${i.title} (x${i.quantity})`).join(', ')}
                    </p>
                    <p className="text-zinc-500 text-[10px]">
                      Date: {new Date(order.created_at).toLocaleString()} • Method: {order.payment_method}
                    </p>
                  </div>

                  <div className="text-right space-y-2 self-end sm:self-center">
                    <div className="text-base font-mono font-extrabold text-white">
                      {order.currency_symbol}{order.total_amount.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {order.payment_status === 'COMPLETED' && (
                        <button
                          onClick={() => {
                            const inv = artistInvoices.find((i) => i.order_id === order.id);
                            if (inv) setViewingInvoice(inv);
                          }}
                          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 text-[10px] font-bold rounded cursor-pointer"
                        >
                          Invoice
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
                        className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold rounded cursor-pointer"
                      >
                        Mark Paid
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'REFUNDED')}
                        className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-[10px] font-bold rounded cursor-pointer"
                      >
                        Refund
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: APPROVED ARTISTS & MEMBERSHIPS */}
      {activeTab === 'artists' && (
        <div className="space-y-4">
          <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Label Artist Roster & Plan Memberships ({labelMemberships.length})
            </h3>
            <span className="text-xs text-zinc-400">
              Active Members: <strong className="text-rose-400">{labelMemberships.filter((m) => m.status === 'ACTIVE').length}</strong>
            </span>
          </div>

          {labelMemberships.length === 0 ? (
            <div className="p-8 text-center bg-zinc-950 border border-white/10 rounded-2xl text-zinc-400 text-xs">
              No label artist memberships recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {labelMemberships.map((mem) => (
                <div
                  key={mem.id}
                  className="p-4 bg-zinc-950 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{mem.artist_name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          mem.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                        }`}
                      >
                        {mem.status}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-[11px]">{mem.user_email}</p>
                    <p className="text-zinc-400 text-[11px]">
                      Plan: <strong className="text-rose-300">{mem.plan_name}</strong> • Joining Fee:{' '}
                      <span className={mem.join_fee_paid ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {mem.join_fee_paid ? 'Paid' : 'Pending'}
                      </span>
                    </p>
                    <p className="text-zinc-500 text-[10px]">
                      Renewal Date: {new Date(mem.membership_renewal_date).toLocaleDateString()} • Provider:{' '}
                      {mem.distribution_provider} • Split: {mem.revenue_share_artist_percent}% Artist / {mem.revenue_share_label_percent}% Label
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleMembershipStatus(mem.id, mem.status)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {mem.status === 'ACTIVE' ? 'Set Pending' : 'Activate Onboarding'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DISTRIBUTION SUBMISSIONS */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Release Distribution Submissions Queue ({labelSubmissions.length})
            </h3>
          </div>

          {labelSubmissions.length === 0 ? (
            <div className="p-8 text-center bg-zinc-950 border border-white/10 rounded-2xl text-zinc-400 text-xs">
              No release submissions queued yet. Artists can submit releases directly from their User Studio.
            </div>
          ) : (
            <div className="space-y-3">
              {labelSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 bg-zinc-950 border border-white/10 rounded-2xl space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{sub.release_title}</span>
                        <span className="px-2 py-0.5 bg-zinc-900 border border-white/10 rounded text-[10px] text-zinc-400">
                          {sub.release_type} • {sub.tracks_count} {sub.tracks_count === 1 ? 'Track' : 'Tracks'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            sub.status === 'APPROVED' || sub.status === 'LIVE'
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-[11px]">
                        Artist: <strong className="text-white">{sub.artist_name}</strong> ({sub.user_email}) • Provider: {sub.distribution_provider}
                      </p>
                    </div>

                    <div className="text-right font-mono text-sm font-bold text-rose-400">
                      {labelPricing.currency_symbol}{sub.total_calculated_fee.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => handleUpdateSubmissionStatus(sub.id, 'APPROVED')}
                      className="px-3 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Approve Release
                    </button>
                    <button
                      onClick={() => handleUpdateSubmissionStatus(sub.id, 'LIVE')}
                      className="px-3 py-1 bg-blue-950 hover:bg-blue-900 border border-blue-500/40 text-blue-300 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Mark Live on DSPs
                    </button>
                    <button
                      onClick={() => handleUpdateSubmissionStatus(sub.id, 'REJECTED')}
                      className="px-3 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PRICING HISTORY & AUDIT PRESERVATION */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Preserved Pricing History & Schedule Snapshots ({pricingHistory.length})
              </h3>
              <p className="text-xs text-zinc-400">
                Audit trail of price changes. Historical invoice unit rates are preserved without overwrite.
              </p>
            </div>
          </div>

          {pricingHistory.length === 0 ? (
            <div className="p-8 text-center bg-zinc-950 border border-white/10 rounded-2xl text-zinc-400 text-xs">
              No historical price modifications recorded yet. Prior price snapshots are preserved automatically whenever an administrator adjusts live pricing.
            </div>
          ) : (
            <div className="space-y-3">
              {pricingHistory.map((hist) => (
                <div
                  key={hist.id}
                  className="p-5 bg-zinc-950 border border-white/10 rounded-2xl space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{hist.id}</span>
                      <span className="px-2 py-0.5 bg-zinc-900 border border-white/10 text-zinc-300 text-[10px] rounded font-mono">
                        {new Date(hist.changed_at).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-zinc-400 text-[11px]">Changed by: <strong className="text-white">{hist.changed_by}</strong></span>
                  </div>

                  {hist.reason && <p className="text-zinc-400 italic text-[11px]">Reason: {hist.reason}</p>}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5 font-mono text-[11px]">
                    <div className="p-2 bg-zinc-900/60 rounded">
                      <span className="text-zinc-500 block text-[9px] uppercase">Join Fee</span>
                      <span className="text-white">₹{hist.previous_pricing.artist_join_plan?.join_fee_inr}</span>
                    </div>
                    <div className="p-2 bg-zinc-900/60 rounded">
                      <span className="text-zinc-500 block text-[9px] uppercase">Annual Fee</span>
                      <span className="text-white">₹{hist.previous_pricing.artist_join_plan?.annual_fee_inr}</span>
                    </div>
                    <div className="p-2 bg-zinc-900/60 rounded">
                      <span className="text-zinc-500 block text-[9px] uppercase">Music / Song</span>
                      <span className="text-rose-400">₹{hist.previous_pricing.music_distribution?.price_per_song_inr}</span>
                    </div>
                    <div className="p-2 bg-zinc-900/60 rounded">
                      <span className="text-zinc-500 block text-[9px] uppercase">Label Share</span>
                      <span className="text-emerald-400">{hist.previous_pricing.revenue_share?.label_share_percent}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invoice Viewer Overlay */}
      <InvoiceViewerModal
        isOpen={Boolean(viewingInvoice)}
        onClose={() => setViewingInvoice(null)}
        invoice={viewingInvoice}
      />
    </div>
  );
};
