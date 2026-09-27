import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  Sparkles,
  ArrowRight,
  Receipt,
  FileCheck,
  Copy,
  Check,
  Clock,
  Lock,
} from 'lucide-react';
import { LabelPricingConfig, LabelCheckoutItem, User, LabelServiceOrder, PaymentGatewayConfig, PaymentSystemSettings } from '../../types';
import { db } from '../../services/db';
import { DEFAULT_PAYMENT_GATEWAYS, DEFAULT_PAYMENT_SETTINGS } from '../../services/paymentGatewayData';

interface LabelCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  pricing: LabelPricingConfig;
  initialItems?: LabelCheckoutItem[];
  currentUser: User | null;
  onOpenAuth?: () => void;
  onOrderSuccess?: (order: LabelServiceOrder) => void;
}

export const LabelCheckoutModal: React.FC<LabelCheckoutModalProps> = ({
  isOpen,
  onClose,
  pricing,
  initialItems = [],
  currentUser,
  onOpenAuth,
  onOrderSuccess,
}) => {
  const [items, setItems] = useState<LabelCheckoutItem[]>(initialItems);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE_GATEWAY' | 'UPI' | 'CREDIT_DEBIT_CARD' | 'NET_BANKING' | 'BANK_TRANSFER'>('UPI');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [refundAcknowledged, setRefundAcknowledged] = useState(false);
  const [nonRefundPolicyAgreed, setNonRefundPolicyAgreed] = useState(false);
  const [utrNumberInput, setUtrNumberInput] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<LabelServiceOrder | null>(null);
  const [submittedUtr, setSubmittedUtr] = useState<string | null>(null);
  const [artistNameInput, setArtistNameInput] = useState(currentUser?.name || '');
  const [artistEmailInput, setArtistEmailInput] = useState(currentUser?.email || '');
  const [errorMessage, setErrorMessage] = useState('');

  // Payment gateway settings from localStorage/defaults
  const [paymentSettings, setPaymentSettings] = useState<PaymentSystemSettings>(() => {
    try {
      const saved = localStorage.getItem('prantik_payment_settings_v1');
      return saved ? JSON.parse(saved) : DEFAULT_PAYMENT_SETTINGS;
    } catch {
      return DEFAULT_PAYMENT_SETTINGS;
    }
  });

  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>(() => {
    try {
      const saved = localStorage.getItem('prantik_payment_gateways_v1');
      return saved ? JSON.parse(saved) : DEFAULT_PAYMENT_GATEWAYS;
    } catch {
      return DEFAULT_PAYMENT_GATEWAYS;
    }
  });

  const activeGateways = gateways.filter((g) => g.is_enabled);
  const primaryGateway = activeGateways.find((g) => g.id === paymentSettings.default_gateway_id) || activeGateways[0];

  // Set default payment method: if gateways active, default to ONLINE_GATEWAY, else UPI
  useEffect(() => {
    if (activeGateways.length === 0) {
      setPaymentMethod('UPI');
    }
  }, [activeGateways.length]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(paymentSettings.upi_id);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Update items when initialItems prop changes
  React.useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setItems(initialItems);
    }
  }, [initialItems]);

  React.useEffect(() => {
    if (currentUser) {
      if (!artistNameInput) setArtistNameInput(currentUser.name);
      if (!artistEmailInput) setArtistEmailInput(currentUser.email);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const taxPercent = pricing.is_tax_enabled ? pricing.tax_rate_percent : 0;
  const taxAmount = (subtotal * taxPercent) / 100;
  const totalAmount = subtotal + taxAmount;

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: newQty,
            subtotal: item.unit_price * newQty,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleProcessCheckout = () => {
    setErrorMessage('');

    if (!currentUser && (!artistNameInput.trim() || !artistEmailInput.trim())) {
      setErrorMessage('Please provide your artist/contact name and valid email address.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your checkout order is empty. Please select a service.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('Please review and agree to the Record Label Services Agreement.');
      return;
    }

    if (!refundAcknowledged) {
      setErrorMessage('Please acknowledge the service verification & refund disclosure.');
      return;
    }

    if (paymentMethod === 'UPI') {
      if (!utrNumberInput.trim() || utrNumberInput.trim().length < 6) {
        setErrorMessage('Please enter a valid Transaction / UTR Reference Number (minimum 6 digits).');
        return;
      }
      if (!nonRefundPolicyAgreed) {
        setErrorMessage('Please review and agree to the Non-Refundable Payment Policy.');
        return;
      }
    }

    setIsProcessing(true);

    // Call server endpoint or fallback local submission
    const cleanUtr = utrNumberInput.trim() || `UTR-${Date.now().toString(36).toUpperCase()}`;

    setTimeout(async () => {
      try {
        const orderNumber = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

        if (paymentMethod === 'UPI') {
          // Record manual payment on server
          try {
            await fetch('/api/payments/manual/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_number: orderNumber,
                customer_name: currentUser?.name || artistNameInput.trim(),
                customer_email: currentUser?.email || artistEmailInput.trim(),
                amount: totalAmount,
                utr_number: cleanUtr,
                item_description: items.map((i) => i.title).join(', '),
              }),
            });
          } catch (e) {
            console.warn('Backend manual payment sync fallback:', e);
          }

          // Save to local pending payments list
          const pendingItem = {
            id: 'pay_man_' + Date.now(),
            order_number: orderNumber,
            customer_name: currentUser?.name || artistNameInput.trim(),
            customer_email: currentUser?.email || artistEmailInput.trim(),
            amount: totalAmount,
            currency: 'INR',
            payment_method: 'UPI' as const,
            utr_number: cleanUtr,
            item_description: items.map((i) => i.title).join(', '),
            submitted_at: new Date().toISOString(),
            status: 'PENDING_VERIFICATION' as const,
          };

          try {
            const currentList = JSON.parse(localStorage.getItem('prantik_pending_payments_v1') || '[]');
            localStorage.setItem('prantik_pending_payments_v1', JSON.stringify([pendingItem, ...currentList]));
          } catch {
            // safe fallback
          }

          setSubmittedUtr(cleanUtr);
        }

        const order = db.createLabelOrder({
          user_id: currentUser?.id || `guest_${Date.now()}`,
          user_email: currentUser?.email || artistEmailInput.trim(),
          artist_name: currentUser?.name || artistNameInput.trim(),
          items: items,
          subtotal: subtotal,
          tax_percent: taxPercent,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          currency: pricing.currency,
          currency_symbol: pricing.currency_symbol,
          payment_method: paymentMethod === 'ONLINE_GATEWAY' ? 'RAZORPAY_DEMO' : 'UPI',
          payment_status: paymentMethod === 'UPI' ? 'PENDING' : 'COMPLETED',
          terms_accepted: true,
          refund_policy_acknowledged: true,
          distribution_provider: pricing.music_distribution.distribution_provider || 'DITTO',
        });

        setCompletedOrder(order);
        setIsProcessing(false);
        onOrderSuccess?.(order);
      } catch (err: any) {
        setIsProcessing(false);
        setErrorMessage(err?.message || 'Transaction failed. Please try again.');
      }
    }, 850);
  };

  const handleResetAndClose = () => {
    setCompletedOrder(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0c0c11] border border-white/15 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                {completedOrder ? 'Order Confirmation & Receipt' : 'Record Label Checkout'}
              </h2>
              <p className="text-xs text-zinc-400">
                {completedOrder ? `Order #${completedOrder.order_number}` : 'Itemized breakdown & transparent pricing'}
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Completed View */}
        {completedOrder ? (
          <div className="p-6 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                completedOrder.payment_status === 'COMPLETED'
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400'
                  : 'bg-amber-950/60 border border-amber-500/40 text-amber-400'
              }`}
            >
              {completedOrder.payment_status === 'COMPLETED' ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <Clock className="w-8 h-8 animate-pulse" />
              )}
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold text-white">
                {completedOrder.payment_status === 'COMPLETED'
                  ? 'Payment Verified & Confirmed'
                  : 'Payment Submitted · Pending Verification'}
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                {completedOrder.payment_status === 'COMPLETED'
                  ? 'Thank you for choosing Prantik Sarkar Record Label Services. Your order has been activated.'
                  : 'Payment verification is handled by the administrator. Please retain your UTR/payment confirmation until verification is complete.'}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 bg-zinc-950/80 border border-white/10 rounded-xl text-left space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                <span className="text-zinc-400">Order Reference:</span>
                <span className="font-mono font-bold text-white">{completedOrder.order_number}</span>
              </div>
              {submittedUtr && (
                <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                  <span className="text-zinc-400">Submitted UTR / Ref:</span>
                  <span className="font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                    {submittedUtr}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                <span className="text-zinc-400">Status:</span>
                <span
                  className={`font-mono text-[11px] font-bold uppercase ${
                    completedOrder.payment_status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {completedOrder.payment_status === 'COMPLETED' ? '✓ VERIFIED' : '● PENDING REVIEW'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                <span className="text-zinc-400">Artist / Client:</span>
                <span className="font-medium text-white">{completedOrder.artist_name} ({completedOrder.user_email})</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                <span className="text-zinc-400">Distribution Provider:</span>
                <span className="font-semibold text-rose-400">{completedOrder.distribution_provider || 'DITTO'}</span>
              </div>

              {/* Items */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Ordered Services</p>
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-zinc-300">
                    <span>
                      {item.title} {item.quantity > 1 ? `(x${item.quantity})` : ''}
                    </span>
                    <span className="font-semibold text-white">
                      {pricing.currency_symbol}{item.subtotal.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase">Total Amount</span>
                <span className="text-lg font-extrabold text-rose-400">
                  {pricing.currency_symbol}{completedOrder.total_amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 bg-zinc-900 border border-white/10 rounded-xl text-left flex items-start gap-2.5 text-xs text-zinc-300">
              <FileCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Non-Refundable Policy Notice</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Once a payment has been reviewed and verified by the administrator, it is non-refundable, except where a refund is required by applicable law or a specific refund policy applies.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleResetAndClose}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-lg shadow-rose-900/30"
              >
                Done & Return to Portal
              </button>
            </div>
          </div>
        ) : (
          /* Main Checkout Form */
          <div className="p-6 space-y-6">
            {/* Guest / Account Bar */}
            {!currentUser ? (
              <div className="p-3.5 bg-zinc-950 border border-amber-500/30 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Checking out as Guest Artist
                  </span>
                  {onOpenAuth && (
                    <button
                      onClick={onOpenAuth}
                      className="text-xs text-rose-400 hover:underline font-medium cursor-pointer"
                    >
                      Sign In for instant portal sync
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Artist / Stage Name *</label>
                    <input
                      type="text"
                      value={artistNameInput}
                      onChange={(e) => setArtistNameInput(e.target.value)}
                      placeholder="e.g. Neon Horizon"
                      className="w-full px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Contact Email *</label>
                    <input
                      type="email"
                      value={artistEmailInput}
                      onChange={(e) => setArtistEmailInput(e.target.value)}
                      placeholder="artist@example.com"
                      className="w-full px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-zinc-950/60 border border-white/10 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-[10px] font-bold text-rose-300">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-semibold text-white">{currentUser.name}</span>
                    <span className="text-zinc-400 text-[11px] ml-2">({currentUser.email})</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold uppercase">
                  Verified Artist
                </span>
              </div>
            )}

            {/* Line Items Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
                <span>Selected Services</span>
                <span>Subtotal</span>
              </div>

              {items.length === 0 ? (
                <div className="p-6 text-center bg-zinc-950/50 border border-white/10 rounded-xl text-zinc-400 text-xs">
                  No services selected for checkout.
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-zinc-950 border border-white/10 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 flex-1">
                        <p className="font-bold text-white">{item.title}</p>
                        {item.details && <p className="text-[11px] text-zinc-400">{item.details}</p>}
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-1">
                          <span>Unit: {pricing.currency_symbol}{item.unit_price.toLocaleString()}</span>
                          {item.service_type === 'MUSIC_DISTRIBUTION' || item.service_type === 'VIDEO_DISTRIBUTION' || item.service_type === 'VEVO_VIDEO' ? (
                            <div className="flex items-center gap-1.5 ml-2">
                              <span className="text-zinc-300">Qty / Songs:</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="w-5 h-5 rounded bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold hover:bg-zinc-700"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold text-white px-1">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-5 h-5 rounded bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold hover:bg-zinc-700"
                              >
                                +
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <span className="font-mono font-bold text-white text-sm">
                          {pricing.currency_symbol}{item.subtotal.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-zinc-500 hover:text-rose-400 p-1"
                          title="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing Summary Calculation */}
            <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-white">{pricing.currency_symbol}{subtotal.toLocaleString()}</span>
              </div>
              {pricing.is_tax_enabled && (
                <div className="flex items-center justify-between text-zinc-400">
                  <span>GST / Tax ({pricing.tax_rate_percent}%)</span>
                  <span className="font-mono text-zinc-300">{pricing.currency_symbol}{taxAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-zinc-400 pb-1">
                <span>Distribution Provider</span>
                <span className="font-semibold text-rose-400">{pricing.music_distribution.distribution_provider || 'DITTO'}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="font-bold text-white uppercase text-sm">Total Payable</span>
                <span className="font-mono font-extrabold text-lg text-rose-400">
                  {pricing.currency_symbol}{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Payment Method
                </label>
                {activeGateways.length === 0 ? (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    ● No payment gateway configured (Direct UPI / QR Active)
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{primaryGateway?.name || 'Online Gateway Active'}</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {activeGateways.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ONLINE_GATEWAY')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'ONLINE_GATEWAY'
                        ? 'bg-rose-950/50 border-rose-500 text-rose-300 font-bold shadow'
                        : 'bg-zinc-950 border-white/10 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Online Payment (Cards / Netbanking)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'UPI'
                      ? 'bg-rose-950/50 border-rose-500 text-rose-300 font-bold shadow'
                      : 'bg-zinc-950 border-white/10 text-zinc-400 hover:border-white/20'
                  } ${activeGateways.length === 0 ? 'col-span-2' : ''}`}
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>UPI / QR Payment</span>
                </button>
              </div>

              {/* UPI / QR Code Fallback Card */}
              {paymentMethod === 'UPI' && (
                <div className="p-4 bg-[#08080d] border border-amber-500/30 rounded-xl space-y-4 animate-in fade-in">
                  <div className="p-3 bg-white rounded-xl max-w-[210px] mx-auto shadow-2xl">
                    <img
                      src={paymentSettings.qr_code_url}
                      alt="UPI QR Code"
                      className="w-full h-auto aspect-square object-contain mx-auto"
                    />
                  </div>

                  <div className="space-y-1.5 text-center">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase block font-semibold">
                      UPI ID:
                    </span>
                    <div className="inline-flex items-center gap-2 bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-lg">
                      <span className="font-mono text-sm font-bold text-white">{paymentSettings.upi_id}</span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUpi ? 'Copied' : 'Copy UPI ID'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-left space-y-1.5 pt-2 border-t border-white/10">
                    <span className="text-[11px] font-mono text-amber-400 uppercase font-bold block">
                      After Payment:
                    </span>
                    <label className="block text-[11px] text-zinc-300 font-semibold">
                      Transaction / UTR Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={utrNumberInput}
                      onChange={(e) => setUtrNumberInput(e.target.value)}
                      placeholder="e.g. 429381920391 (12 digits from UPI confirmation)"
                      className="w-full px-3 py-2 bg-zinc-950 border border-white/15 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="p-3 bg-zinc-950 border border-white/10 rounded-lg text-left text-[11px] text-zinc-400 leading-relaxed space-y-1">
                    <p className="font-medium text-amber-300/90">
                      Payment verification is handled by the administrator. Please retain your UTR/payment confirmation until verification is complete.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Mandatory Disclosures & Checkboxes */}
            <div className="space-y-2.5 p-3.5 bg-zinc-950/60 border border-white/10 rounded-xl text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer text-zinc-300">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 text-rose-600 focus:ring-rose-500"
                />
                <span>
                  I agree to the <span className="font-semibold text-white">Record Label Services Agreement</span> and the 15% label share revenue policy for applicable eligible royalties.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-zinc-300">
                <input
                  type="checkbox"
                  checked={refundAcknowledged}
                  onChange={(e) => setRefundAcknowledged(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 text-rose-600 focus:ring-rose-500"
                />
                <span>
                  I acknowledge that payments are for distribution and review services, and do not guarantee external platform verification, algorithm placement, or playlist monetization.
                </span>
              </label>

              {paymentMethod === 'UPI' && (
                <label className="flex items-start gap-2.5 cursor-pointer text-zinc-300 pt-1 border-t border-white/5">
                  <input
                    type="checkbox"
                    checked={nonRefundPolicyAgreed}
                    onChange={(e) => setNonRefundPolicyAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-white/20 text-rose-600 focus:ring-rose-500"
                  />
                  <span>
                    <strong className="text-rose-400">Payment Policy:</strong> Once a payment has been reviewed and verified by the administrator, it is non-refundable, except where a refund is required by applicable law or a specific refund policy applies.
                  </span>
                </label>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleProcessCheckout}
                disabled={isProcessing || items.length === 0}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-rose-900/30 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    Pay {pricing.currency_symbol}{totalAmount.toLocaleString()}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
