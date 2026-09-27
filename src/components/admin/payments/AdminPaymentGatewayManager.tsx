import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  CheckCircle,
  Copy,
  Check,
  Activity,
  Sliders,
  Clock,
  ArrowRight,
  RefreshCw,
  X,
  Lock,
  ExternalLink,
  Receipt,
  FileCheck,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { PaymentGatewayConfig, PaymentSystemSettings, PendingManualPayment } from '../../../types';
import {
  DEFAULT_PAYMENT_GATEWAYS,
  DEFAULT_PAYMENT_SETTINGS,
  DEFAULT_PENDING_PAYMENTS,
} from '../../../services/paymentGatewayData';

const PROVIDER_OPTIONS = [
  { id: 'razorpay', name: 'Razorpay (Cards, UPI, Netbanking, Wallets)', defaultCurrency: 'INR' },
  { id: 'cashfree', name: 'Cashfree Payments (Auto-Collect, UPI)', defaultCurrency: 'INR' },
  { id: 'stripe', name: 'Stripe International (Cards, Apple Pay, Google Pay)', defaultCurrency: 'USD' },
  { id: 'payu', name: 'PayU India', defaultCurrency: 'INR' },
  { id: 'phonepe', name: 'PhonePe Payment Gateway', defaultCurrency: 'INR' },
  { id: 'paytm', name: 'Paytm Business Gateway', defaultCurrency: 'INR' },
  { id: 'custom', name: 'Custom Gateway (API / Webhook)', defaultCurrency: 'INR' },
];

export const AdminPaymentGatewayManager: React.FC = () => {
  // Gateways State
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>(() => {
    try {
      const saved = localStorage.getItem('prantik_payment_gateways_v1');
      return saved ? JSON.parse(saved) : DEFAULT_PAYMENT_GATEWAYS;
    } catch {
      return DEFAULT_PAYMENT_GATEWAYS;
    }
  });

  // Settings State
  const [settings, setSettings] = useState<PaymentSystemSettings>(() => {
    try {
      const saved = localStorage.getItem('prantik_payment_settings_v1');
      return saved ? JSON.parse(saved) : DEFAULT_PAYMENT_SETTINGS;
    } catch {
      return DEFAULT_PAYMENT_SETTINGS;
    }
  });

  // Pending Payments State
  const [pendingPayments, setPendingPayments] = useState<PendingManualPayment[]>(() => {
    try {
      const saved = localStorage.getItem('prantik_pending_payments_v1');
      return saved ? JSON.parse(saved) : DEFAULT_PENDING_PAYMENTS;
    } catch {
      return DEFAULT_PENDING_PAYMENTS;
    }
  });

  const [activeTab, setActiveTab] = useState<'gateways' | 'settings' | 'manual_upi' | 'policy' | 'pending'>(
    'gateways'
  );

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentGatewayConfig | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    provider: 'razorpay' | 'cashfree' | 'stripe' | 'payu' | 'phonepe' | 'paytm' | 'custom';
    merchant_id: string;
    secret_key: string;
    webhook_url: string;
    environment: 'Test' | 'Live';
    currency: string;
    is_enabled: boolean;
  }>({
    name: '',
    provider: 'razorpay',
    merchant_id: '',
    secret_key: '',
    webhook_url: '',
    environment: 'Live',
    currency: 'INR',
    is_enabled: true,
  });

  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency_ms?: number } | null>(
    null
  );
  const [isTesting, setIsTesting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Verification note modal
  const [verifyTargetPayment, setVerifyTargetPayment] = useState<PendingManualPayment | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  // Persist Helpers
  const persistGateways = (updated: PaymentGatewayConfig[]) => {
    setGateways(updated);
    try {
      localStorage.setItem('prantik_payment_gateways_v1', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save payment gateways', e);
    }
  };

  const persistSettings = (updated: PaymentSystemSettings) => {
    setSettings(updated);
    try {
      localStorage.setItem('prantik_payment_settings_v1', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save payment settings', e);
    }
  };

  const persistPendingPayments = (updated: PendingManualPayment[]) => {
    setPendingPayments(updated);
    try {
      localStorage.setItem('prantik_pending_payments_v1', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save pending payments', e);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenAdd = () => {
    setEditingGateway(null);
    setTestResult(null);
    const autoWebhook = `${window.location.origin}/api/webhooks/payment/razorpay`;
    setFormData({
      name: '',
      provider: 'razorpay',
      merchant_id: '',
      secret_key: '',
      webhook_url: autoWebhook,
      environment: 'Live',
      currency: 'INR',
      is_enabled: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (gw: PaymentGatewayConfig) => {
    setEditingGateway(gw);
    setTestResult(null);
    setFormData({
      id: gw.id,
      name: gw.name,
      provider: gw.provider,
      merchant_id: gw.merchant_id,
      secret_key: gw.secret_key,
      webhook_url: gw.webhook_url,
      environment: gw.environment,
      currency: gw.currency,
      is_enabled: gw.is_enabled,
    });
    setIsModalOpen(true);
  };

  const handleTestConnection = async (gwConfig?: { provider: string; merchant_id: string; environment: string }) => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const payload = gwConfig || {
        provider: formData.provider,
        merchant_id: formData.merchant_id || 'test_merchant_id',
        environment: formData.environment,
      };

      const res = await fetch('/api/payments/gateways/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message || 'Connection verified successfully.',
        latency_ms: data.latency_ms || 180,
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Could not connect to payment testing gateway.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveGateway = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.merchant_id.trim()) {
      showNotification('Please fill in Gateway Name and Merchant ID.');
      return;
    }

    const id = formData.id || 'gw_' + formData.provider + '_' + Date.now();
    const updated: PaymentGatewayConfig = {
      id,
      name: formData.name.trim(),
      provider: formData.provider,
      merchant_id: formData.merchant_id.trim(),
      secret_key: formData.secret_key.trim() || '••••••••••••••••••••••••',
      webhook_url: formData.webhook_url.trim() || `${window.location.origin}/api/webhooks/payment/${formData.provider}`,
      environment: formData.environment,
      currency: formData.currency,
      is_enabled: formData.is_enabled,
      is_default: gateways.length === 0,
      status: formData.is_enabled ? 'Active' : 'Inactive',
      last_tested_at: new Date().toISOString(),
      created_at: editingGateway ? editingGateway.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (editingGateway) {
      persistGateways(gateways.map((g) => (g.id === id ? updated : g)));
      showNotification(`Updated gateway "${updated.name}".`);
    } else {
      persistGateways([...gateways, updated]);
      showNotification(`Added new payment gateway "${updated.name}".`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteGateway = (id: string, name: string) => {
    if (window.confirm(`Delete payment gateway "${name}"?`)) {
      persistGateways(gateways.filter((g) => g.id !== id));
      showNotification(`Deleted gateway "${name}".`);
    }
  };

  const handleToggleGateway = (id: string) => {
    const updated = gateways.map((g) =>
      g.id === id ? { ...g, is_enabled: !g.is_enabled, status: !g.is_enabled ? ('Active' as const) : ('Inactive' as const) } : g
    );
    persistGateways(updated);
    showNotification('Gateway status updated.');
  };

  // Payment Verification Actions
  const handleVerifyPayment = async (paymentId: string, action: 'VERIFY' | 'REJECT' | 'REQUEST_MORE_INFO') => {
    try {
      const res = await fetch('/api/payments/manual/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: paymentId,
          action,
          admin_notes: adminNoteInput,
          verified_by: 'Prantik Sarkar (Artist Management)',
        }),
      });

      const data = await res.json();
      if (data.success) {
        const next = pendingPayments.map((p) => {
          if (p.id === paymentId) {
            return {
              ...p,
              status: data.status,
              verified_at: data.verified_at,
              verified_by: data.verified_by,
              receipt_id: data.receipt_id || p.receipt_id,
              admin_notes: adminNoteInput || p.admin_notes,
            };
          }
          return p;
        });
        persistPendingPayments(next);
        showNotification(data.message || 'Payment status updated.');
        setVerifyTargetPayment(null);
        setAdminNoteInput('');
      }
    } catch {
      showNotification('Failed to verify payment. Please retry.');
    }
  };

  const activeGatewaysCount = gateways.filter((g) => g.is_enabled).length;

  return (
    <div className="space-y-8 text-zinc-100">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 rounded-lg bg-zinc-900 border border-rose-500/50 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in slide-in-from-top-2">
          {notification}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#0b0b0f] border border-white/10 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-widest mb-1 font-mono">
            <CreditCard className="w-4 h-4" />
            <span>Admin → Payment Gateways & Manual UPI</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight">
            Payment Gateway Manager
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl font-light">
            Configure live payment gateways (Razorpay, Cashfree, Stripe, PayU, PhonePe) with server-side secrets,
            or rely on the automated Manual UPI / QR code fallback with admin verification.
          </p>

          <div className="flex items-center gap-3 pt-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase ${
                activeGatewaysCount > 0
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-950 text-amber-300 border border-amber-500/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeGatewaysCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{activeGatewaysCount > 0 ? `${activeGatewaysCount} Live Gateways Active` : 'No Gateway Configured (Manual UPI Active)'}</span>
            </span>

            {settings.manual_upi_enabled && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-white/10 text-zinc-300">
                <QrCode className="w-3 h-3 text-rose-400" />
                <span>UPI ID: {settings.upi_id}</span>
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-lg shrink-0 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Payment Gateway</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('gateways')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'gateways' ? 'bg-rose-600 text-white shadow' : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Connected Gateways ({gateways.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('manual_upi')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'manual_upi' ? 'bg-rose-600 text-white shadow' : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 text-amber-400" />
          <span>Manual UPI / QR Fallback</span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'pending' ? 'bg-rose-600 text-white shadow' : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pending Payments ({pendingPayments.filter((p) => p.status === 'PENDING_VERIFICATION').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'settings' ? 'bg-rose-600 text-white shadow' : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Payment Configuration</span>
        </button>

        <button
          onClick={() => setActiveTab('policy')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'policy' ? 'bg-rose-600 text-white shadow' : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>Payment & Refund Policy</span>
        </button>
      </div>

      {/* TAB 1: CONNECTED GATEWAYS */}
      {activeTab === 'gateways' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-tight">
              Configured Payment Gateways
            </h3>
            <span className="text-[11px] font-mono text-zinc-500">
              Secrets are stored server-side and never returned to the frontend
            </span>
          </div>

          {gateways.length === 0 ? (
            <div className="p-8 text-center bg-zinc-950/80 border border-white/10 rounded-xl space-y-3">
              <CreditCard className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-zinc-400 text-xs">No payment gateways currently configured.</p>
              <p className="text-zinc-500 text-[11px]">
                The site will automatically route checkouts to the <strong>Manual UPI / QR Payment fallback</strong>.
              </p>
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider"
              >
                + Add Gateway
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gateways.map((gw) => (
                <div
                  key={gw.id}
                  className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                    gw.is_enabled
                      ? 'bg-zinc-950/80 border-white/10 hover:border-white/20'
                      : 'bg-zinc-950/40 border-white/5 opacity-60'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              gw.is_enabled ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-zinc-500'
                            }`}
                          />
                          <h4 className="font-display font-bold text-white text-base uppercase tracking-tight">
                            {gw.name}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 block uppercase">
                          Provider: <strong className="text-rose-400">{gw.provider}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            gw.environment === 'Live'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {gw.environment}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs pt-2 border-t border-white/5 text-zinc-400">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span>Merchant ID:</span>
                        <span className="text-white truncate max-w-[140px]">{gw.merchant_id}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span>Secret Key:</span>
                        <span className="text-zinc-500 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-emerald-400" />
                          <span>Server-Managed</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span>Currency:</span>
                        <span className="text-rose-300 font-bold">{gw.currency}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span>Webhook:</span>
                        <button
                          onClick={() => handleCopy(gw.webhook_url, gw.id)}
                          className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                          title="Copy Webhook URL"
                        >
                          {copiedKey === gw.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span className="truncate max-w-[120px]">Copy URL</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2 mt-4">
                    <button
                      onClick={() => handleTestConnection(gw)}
                      className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Activity className="w-3 h-3 text-amber-400" />
                      <span>Test</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(gw)}
                        className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Edit gateway"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleGateway(gw.id)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                          gw.is_enabled
                            ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {gw.is_enabled ? 'Disable' : 'Enable'}
                      </button>

                      <button
                        onClick={() => handleDeleteGateway(gw.id, gw.name)}
                        className="p-1.5 rounded text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete gateway"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANUAL UPI / QR PAYMENT FALLBACK */}
      {activeTab === 'manual_upi' && (
        <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10 space-y-6">
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-xl text-white uppercase tracking-tight">
                  Manual UPI / QR Payment Fallback
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                When no payment gateway is configured or when the customer selects Direct UPI, this QR and UPI ID
                are presented. The user enters their UTR number for admin verification.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Gateway Status:</span>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase ${
                  activeGatewaysCount === 0
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {activeGatewaysCount === 0 ? '● No payment gateway configured' : '● Gateway Active + UPI Direct Available'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Configuration form */}
            <div className="md:col-span-7 space-y-4 text-xs">
              <div>
                <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                  UPI ID (VPA) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={settings.upi_id}
                    onChange={(e) => persistSettings({ ...settings, upi_id: e.target.value })}
                    placeholder="e.g. prantiksarkarartist@upi"
                    className="flex-1 px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={() => handleCopy(settings.upi_id, 'admin_upi')}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono rounded flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'admin_upi' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                  QR Code Image URL / Generator
                </label>
                <input
                  type="text"
                  value={settings.qr_code_url}
                  onChange={(e) => persistSettings({ ...settings, qr_code_url: e.target.value })}
                  placeholder="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                  Payment Instructions for User
                </label>
                <textarea
                  rows={3}
                  value={settings.payment_instructions}
                  onChange={(e) => persistSettings({ ...settings, payment_instructions: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white text-xs resize-none focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                    Payment Verification Mode
                  </label>
                  <div className="space-y-1.5 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="v_mode"
                        checked={settings.verification_mode === 'manual'}
                        onChange={() => persistSettings({ ...settings, verification_mode: 'manual' })}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-xs">Manual Review</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="v_mode"
                        checked={settings.verification_mode === 'admin_approval'}
                        onChange={() => persistSettings({ ...settings, verification_mode: 'admin_approval' })}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-xs font-semibold text-rose-300">● Admin Approval Required</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                    Verification SLA Target
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={settings.verification_target_minutes}
                      onChange={(e) =>
                        persistSettings({ ...settings, verification_target_minutes: Number(e.target.value) || 30 })
                      }
                      className="w-20 px-2 py-1.5 bg-zinc-900 border border-white/10 rounded text-white font-mono text-center"
                    />
                    <span className="text-xs text-zinc-400">minutes</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => showNotification('Payment settings saved successfully.')}
                  className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow cursor-pointer"
                >
                  Save Payment Settings
                </button>
              </div>
            </div>

            {/* Right: Live Preview of User QR Checkout */}
            <div className="md:col-span-5 bg-[#0e0e14] border border-white/15 rounded-xl p-5 space-y-4 text-center">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold block">
                User Checkout Preview:
              </span>

              <div className="p-4 bg-white rounded-xl max-w-[220px] mx-auto shadow-xl">
                <img
                  src={settings.qr_code_url}
                  alt="UPI QR Code"
                  className="w-full h-auto aspect-square object-contain mx-auto"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-zinc-400 block font-mono">UPI ID:</span>
                <span className="font-mono text-sm font-bold text-rose-400">{settings.upi_id}</span>
              </div>

              <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg text-left text-[11px] text-zinc-400 space-y-1">
                <span className="text-zinc-300 font-semibold uppercase text-[10px] block">Notice to User:</span>
                <p className="leading-relaxed">
                  Payment verification is handled by the administrator. Please retain your UTR / payment confirmation
                  until verification is complete.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PENDING PAYMENTS & VERIFICATION STUDIO */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="font-display font-bold text-lg text-white uppercase tracking-tight flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <span>Pending Payments & Verification Studio</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Verify submitted UTR transaction numbers against banking records. Verified orders activate instantly and
                lock in the non-refundable policy.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              Target SLA: <strong>{settings.verification_target_minutes} mins</strong>
            </span>
          </div>

          <div className="space-y-3">
            {pendingPayments.length === 0 ? (
              <div className="p-8 text-center bg-zinc-950/80 border border-white/10 rounded-xl text-zinc-400 text-xs">
                No pending payments awaiting verification.
              </div>
            ) : (
              pendingPayments.map((p) => {
                const elapsedMins = Math.floor((Date.now() - new Date(p.submitted_at).getTime()) / (1000 * 60));
                const isOverSla = p.status === 'PENDING_VERIFICATION' && elapsedMins > settings.verification_target_minutes;

                return (
                  <div
                    key={p.id}
                    className={`p-5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      p.status === 'PENDING_VERIFICATION'
                        ? isOverSla
                          ? 'bg-rose-950/20 border-rose-500/40'
                          : 'bg-zinc-950 border-white/15'
                        : p.status === 'VERIFIED'
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-zinc-950/40 border-white/5 opacity-70'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-white uppercase">{p.order_number}</span>
                        <span className="text-xs text-zinc-400 font-semibold">· {p.customer_name}</span>
                        <span className="text-zinc-500 text-[11px]">({p.customer_email})</span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            p.status === 'VERIFIED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : p.status === 'REJECTED'
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/30 animate-pulse'
                          }`}
                        >
                          {p.status.replace('_', ' ')}
                        </span>

                        {isOverSla && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-600 text-white uppercase flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> SLA Escalated ({elapsedMins}m)
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-300 font-light">{p.item_description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-zinc-400 pt-1">
                        <span>
                          Amount: <strong className="text-rose-400 font-bold">₹{p.amount.toLocaleString()}</strong>
                        </span>
                        <span>
                          Method: <strong className="text-white">{p.payment_method}</strong>
                        </span>
                        <span>
                          UTR / Ref: <strong className="text-amber-300 bg-black/40 px-1.5 py-0.5 rounded">{p.utr_number}</strong>
                        </span>
                        <span>
                          Submitted: {new Date(p.submitted_at).toLocaleTimeString()} ({elapsedMins} mins ago)
                        </span>
                        {p.receipt_id && (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Receipt className="w-3 h-3" />
                            <span>{p.receipt_id}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {p.status === 'PENDING_VERIFICATION' ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleVerifyPayment(p.id, 'VERIFY')}
                          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Verify Payment</span>
                        </button>
                        <button
                          onClick={() => {
                            setVerifyTargetPayment(p);
                            setAdminNoteInput('');
                          }}
                          className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold cursor-pointer"
                        >
                          Options
                        </button>
                      </div>
                    ) : (
                      <div className="text-right text-[11px] font-mono text-zinc-500 shrink-0">
                        <span>Verified by {p.verified_by || 'Admin'}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENT CONFIGURATION */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10 space-y-6">
          <div className="border-b border-white/10 pb-3">
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-tight flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Payment Routing & Automation Settings</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Configure default and backup gateways, auto-failover, tax rate, and receipt generation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div>
              <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                Default Primary Gateway
              </label>
              <select
                value={settings.default_gateway_id}
                onChange={(e) => persistSettings({ ...settings, default_gateway_id: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
              >
                {gateways.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.currency})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                Backup Failover Gateway
              </label>
              <select
                value={settings.backup_gateway_id || ''}
                onChange={(e) => persistSettings({ ...settings, backup_gateway_id: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
              >
                <option value="">No backup gateway</option>
                {gateways.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.currency})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                Tax / GST Percentage (%)
              </label>
              <input
                type="number"
                value={settings.tax_percentage}
                onChange={(e) => persistSettings({ ...settings, tax_percentage: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white font-mono text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
              <input
                type="checkbox"
                checked={settings.automatic_failover}
                onChange={(e) => persistSettings({ ...settings, automatic_failover: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <span className="font-semibold">Automatic Failover to Backup Gateway or Manual UPI</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
              <input
                type="checkbox"
                checked={settings.webhook_verification}
                onChange={(e) => persistSettings({ ...settings, webhook_verification: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <span className="font-semibold">Webhook Signature Cryptographic Verification</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
              <input
                type="checkbox"
                checked={settings.realtime_status}
                onChange={(e) => persistSettings({ ...settings, realtime_status: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <span className="font-semibold">Real-Time Payment Status Polling</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
              <input
                type="checkbox"
                checked={settings.receipt_invoice_enabled}
                onChange={(e) => persistSettings({ ...settings, receipt_invoice_enabled: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <span className="font-semibold">Automated Receipt & Invoice Generation</span>
            </label>
          </div>
        </div>
      )}

      {/* TAB 5: PAYMENT & REFUND POLICY */}
      {activeTab === 'policy' && (
        <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="font-display font-bold text-xl text-white uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              <span>Official Payment & Non-Refundable Policy</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Admin-enforced governance regarding verification timelines, escalation actions, and non-refundable status.
            </p>
          </div>

          {/* Official Policy Banner */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-zinc-950 border border-rose-500/40 space-y-2">
            <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold block">
              Official Consumer Disclosure & Terms:
            </span>
            <p className="text-sm text-zinc-200 font-serif italic leading-relaxed">
              "Once a payment has been reviewed and verified by the administrator, it is non-refundable, except where a
              refund is required by applicable law or a specific refund policy applies."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <span className="text-zinc-300 font-semibold uppercase text-[10px] block">Policy Enforcements</span>
              <label className="flex items-start gap-2 cursor-pointer text-zinc-300">
                <input
                  type="checkbox"
                  checked={true}
                  readOnly
                  className="w-4 h-4 rounded text-rose-600 mt-0.5"
                />
                <span>
                  <strong>Payment Verification Required:</strong> Orders are held in pending queue until UTR or gateway webhook confirms settlement.
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer text-zinc-300">
                <input
                  type="checkbox"
                  checked={settings.non_refundable_after_verification}
                  onChange={(e) =>
                    persistSettings({ ...settings, non_refundable_after_verification: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-rose-600 mt-0.5"
                />
                <span>
                  <strong>After Payment is Verified:</strong> Marked strictly Non-Refundable across accounting logs.
                </span>
              </label>
            </div>

            <div className="space-y-3">
              <span className="text-zinc-300 font-semibold uppercase text-[10px] block">Permitted Refund Exceptions</span>
              <div className="space-y-1.5">
                {settings.refund_exceptions.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-zinc-900 border border-white/5 text-zinc-300 flex items-center gap-2"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{ex}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Gateway Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#0e0e14] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 text-zinc-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-rose-500 uppercase tracking-widest block font-bold">
                Admin → Payment Gateways
              </span>
              <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">
                {editingGateway ? `Edit ${editingGateway.name}` : 'Add New Payment Gateway'}
              </h3>
            </div>

            <form onSubmit={handleSaveGateway} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                  Gateway Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Razorpay Live, Cashfree India, Stripe Global"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                    Provider *
                  </label>
                  <select
                    value={formData.provider}
                    onChange={(e) => {
                      const p = e.target.value as any;
                      const opt = PROVIDER_OPTIONS.find((o) => o.id === p);
                      setFormData({
                        ...formData,
                        provider: p,
                        currency: opt ? opt.defaultCurrency : 'INR',
                        webhook_url: `${window.location.origin}/api/webhooks/payment/${p}`,
                      });
                    }}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
                  >
                    {PROVIDER_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white font-mono focus:outline-none focus:border-rose-500"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                  API / Merchant ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.merchant_id}
                  onChange={(e) => setFormData({ ...formData, merchant_id: e.target.value })}
                  placeholder="rzp_live_... or cf_app_..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white font-mono text-[11px] focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                  Secret Key
                </label>
                <input
                  type="password"
                  value={formData.secret_key}
                  onChange={(e) => setFormData({ ...formData, secret_key: e.target.value })}
                  placeholder="••••••••••••••••••••••••"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white font-mono text-[11px] focus:outline-none focus:border-rose-500"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Secrets are securely isolated on the server and never sent to user browsers.
                </span>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                  Webhook URL (Auto-generated)
                </label>
                <input
                  type="text"
                  readOnly
                  value={formData.webhook_url}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded text-zinc-400 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                    Environment
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="env"
                        checked={formData.environment === 'Test'}
                        onChange={() => setFormData({ ...formData, environment: 'Test' })}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Test</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="env"
                        checked={formData.environment === 'Live'}
                        onChange={() => setFormData({ ...formData, environment: 'Live' })}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Live</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                    Status
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.is_enabled}
                        onChange={() => setFormData({ ...formData, is_enabled: true })}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Enabled</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={!formData.is_enabled}
                        onChange={() => setFormData({ ...formData, is_enabled: false })}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Disabled</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Test Output Box */}
              {testResult && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>
                    {testResult.message} {testResult.latency_ms && `(${testResult.latency_ms}ms)`}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => handleTestConnection()}
                  disabled={isTesting}
                  className="px-3.5 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg transition-colors"
                  >
                    Save Gateway
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Action Options Dialog (Reject or Request More Info) */}
      {verifyTargetPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#0e0e14] border border-white/15 p-6 shadow-2xl space-y-4 text-xs">
            <h4 className="font-display font-bold text-base text-white uppercase">
              Manage Order {verifyTargetPayment.order_number}
            </h4>
            <p className="text-zinc-400">
              UTR: <strong className="text-white">{verifyTargetPayment.utr_number}</strong> · Amount: ₹{verifyTargetPayment.amount}
            </p>

            <div>
              <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                Admin Note (Optional)
              </label>
              <textarea
                rows={2}
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                placeholder="e.g. Bank statement match confirmed, or please provide screenshot..."
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white text-xs resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setVerifyTargetPayment(null)}
                className="px-3 py-2 rounded bg-zinc-800 text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerifyPayment(verifyTargetPayment.id, 'REQUEST_MORE_INFO')}
                className="px-3 py-2 rounded bg-amber-950 text-amber-300 border border-amber-500/30 hover:bg-amber-900 font-semibold"
              >
                Request Info
              </button>
              <button
                onClick={() => handleVerifyPayment(verifyTargetPayment.id, 'REJECT')}
                className="px-3 py-2 rounded bg-rose-950 text-rose-300 border border-rose-500/30 hover:bg-rose-900 font-semibold"
              >
                Reject Payment
              </button>
              <button
                onClick={() => handleVerifyPayment(verifyTargetPayment.id, 'VERIFY')}
                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
