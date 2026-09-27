import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Lock,
  Calendar,
  Percent,
  AlertCircle,
  Download,
} from 'lucide-react';
import { ArtistAgreement, ArtistAgreementAcceptance, User } from '../../types';
import { db } from '../../services/db';

interface ArtistAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAccepted?: (acceptance: ArtistAgreementAcceptance) => void;
}

export const ArtistAgreementModal: React.FC<ArtistAgreementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAccepted,
}) => {
  const agreement = db.getArtistAgreement();
  const existingAcceptance = currentUser ? db.getAgreementAcceptance(currentUser.id) : null;

  const [signerName, setSignerName] = useState(currentUser?.name || '');
  const [signerEmail, setSignerEmail] = useState(currentUser?.email || '');
  const [agreedClauses, setAgreedClauses] = useState(false);
  const [signatureText, setSignatureText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAcceptance, setSubmittedAcceptance] = useState<ArtistAgreementAcceptance | null>(
    existingAcceptance
  );
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    if (currentUser) {
      if (!signerName) setSignerName(currentUser.name);
      if (!signerEmail) setSignerEmail(currentUser.email);
      const acc = db.getAgreementAcceptance(currentUser.id);
      if (acc) setSubmittedAcceptance(acc);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSignAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!signerName.trim() || !signerEmail.trim()) {
      setErrorMsg('Please specify full legal name and email address.');
      return;
    }

    if (!agreedClauses) {
      setErrorMsg('You must check the agreement acknowledgment box.');
      return;
    }

    if (!signatureText.trim()) {
      setErrorMsg('Please type your full legal name as your digital signature.');
      return;
    }

    setIsSubmitting(true);
    try {
      const artistId = currentUser?.id || `artist_guest_${Date.now()}`;
      const acceptance = db.acceptArtistAgreement(
        artistId,
        signerName.trim(),
        signerEmail.trim(),
        agreement.version,
        signatureText.trim()
      );

      setSubmittedAcceptance(acceptance);
      setIsSubmitting(false);
      onAccepted?.(acceptance);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'Failed to submit agreement.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0c0c11] border border-white/20 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Record Label Artist Agreement
                </h2>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-rose-300 font-bold">
                  {agreement.version}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Official terms, fees, rights reversion & 15% revenue share policy
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Agreement Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-xs text-zinc-300 leading-relaxed">
          {/* Status Banner */}
          {submittedAcceptance ? (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Agreement Digitally Executed & Bound</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Signed by <strong className="text-white">{submittedAcceptance.artist_name}</strong> on{' '}
                {new Date(submittedAcceptance.accepted_timestamp).toLocaleString()}.
              </p>
              <p className="text-[10px] font-mono text-zinc-500">
                Hash: {submittedAcceptance.agreement_hash} • IP: {submittedAcceptance.ip_address}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-rose-950/30 border border-rose-500/30 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-rose-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                <span>Mandatory Label Artist Execution</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                This agreement governs membership fees, release distribution charges, and revenue splits. All pricing is configuration-driven.
              </p>
            </div>
          )}

          {/* Pricing & Fee Summary Grid */}
          <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white block">
              Configured Fee Schedule & Royalty Split Summary
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-zinc-900/60 rounded border border-white/5">
                <span className="text-[10px] text-zinc-500 block uppercase">Joining Fee</span>
                <span className="text-white font-bold">₹{agreement.joining_fee_inr} (one-time)</span>
              </div>
              <div className="p-2.5 bg-zinc-900/60 rounded border border-white/5">
                <span className="text-[10px] text-zinc-500 block uppercase">Annual Membership</span>
                <span className="text-white font-bold">₹{agreement.annual_fee_inr} / year</span>
              </div>
              <div className="p-2.5 bg-zinc-900/60 rounded border border-white/5">
                <span className="text-[10px] text-zinc-500 block uppercase">Distribution Music</span>
                <span className="text-rose-400 font-bold">₹{agreement.distribution_per_song_inr} / song</span>
              </div>
              <div className="p-2.5 bg-zinc-900/60 rounded border border-white/5">
                <span className="text-[10px] text-zinc-500 block uppercase">Royalty Split</span>
                <span className="text-emerald-400 font-bold">
                  {agreement.revenue_share_artist_percent}% Artist / {agreement.revenue_share_label_percent}% Label
                </span>
              </div>
            </div>
          </div>

          {/* Agreement Clauses */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-white/10">
              Contract Terms & Operational Obligations
            </h3>

            {agreement.clauses.map((clause) => (
              <div key={clause.id} className="p-4 bg-zinc-950/60 border border-white/5 rounded-xl space-y-1.5">
                <h4 className="font-bold text-white text-xs flex items-center justify-between">
                  <span>{clause.title}</span>
                  {clause.is_mandatory && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded">
                      MANDATORY
                    </span>
                  )}
                </h4>
                <p className="text-zinc-400 text-xs leading-relaxed">{clause.content}</p>
              </div>
            ))}
          </div>

          {/* Refund, Takedowns & Termination Policies */}
          <div className="space-y-3 pt-2">
            <div className="p-3.5 bg-zinc-950 border border-white/10 rounded-xl space-y-1">
              <span className="font-bold text-white uppercase text-[11px]">Refund & Disclaimers</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">{agreement.refund_policy}</p>
            </div>
            <div className="p-3.5 bg-zinc-950 border border-white/10 rounded-xl space-y-1">
              <span className="font-bold text-white uppercase text-[11px]">Takedown Guidelines</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">{agreement.takedown_rules}</p>
            </div>
            <div className="p-3.5 bg-zinc-950 border border-white/10 rounded-xl space-y-1">
              <span className="font-bold text-white uppercase text-[11px]">Termination & Reversion</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">{agreement.termination_rules}</p>
            </div>
          </div>
        </div>

        {/* Footer / Digital Signing Block */}
        <div className="p-6 border-t border-white/10 bg-zinc-950 shrink-0">
          {submittedAcceptance ? (
            <div className="flex items-center justify-between">
              <div className="text-xs text-zinc-400">
                <span>Agreement is officially signed and active.</span>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
              >
                Close Agreement
              </button>
            </div>
          ) : (
            <form onSubmit={handleSignAgreement} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-2.5 bg-rose-950/60 border border-rose-500/50 rounded-lg text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 text-[11px]">Full Legal Artist Name *</label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="Legal name"
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 text-[11px]">Signer Email Address *</label>
                  <input
                    type="email"
                    value={signerEmail}
                    onChange={(e) => setSignerEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 text-[11px]">
                  Digital Signature (Type your full legal name) *
                </label>
                <input
                  type="text"
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  placeholder="e.g. Prantik Sarkar"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer text-zinc-300 text-[11px]">
                <input
                  type="checkbox"
                  checked={agreedClauses}
                  onChange={(e) => setAgreedClauses(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 text-rose-600 focus:ring-rose-500"
                />
                <span>
                  I have read, understood, and hereby agree to all 12 clauses, the 15% label revenue share split, fee schedules, and non-guarantee platform policies of this Agreement.
                </span>
              </label>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] font-mono text-zinc-500">
                  Version: {agreement.version} • Hash: {agreement.agreement_hash.substring(0, 12)}...
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-lg shadow-rose-900/30"
                >
                  {isSubmitting ? 'Signing...' : 'Sign & Execute Agreement'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
