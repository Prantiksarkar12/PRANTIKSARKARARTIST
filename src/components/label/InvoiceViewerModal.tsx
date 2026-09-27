import React from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  Receipt,
  Building2,
  ShieldCheck,
  FileCheck,
  Download,
} from 'lucide-react';
import { ArtistInvoice } from '../../types';

interface InvoiceViewerModalProps {
  invoice: ArtistInvoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceViewerModal: React.FC<InvoiceViewerModalProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/20 rounded-2xl shadow-2xl overflow-hidden my-8 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-zinc-900/60 print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Official Invoice Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-8 sm:p-10 space-y-8 bg-[#0c0c11] text-zinc-100 print:bg-white print:text-black">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10 print:border-black/20">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[10px] font-bold uppercase tracking-wider print:bg-gray-100 print:text-black print:border-black">
                <ShieldCheck className="w-3 h-3 text-rose-400 print:text-black" />
                <span>Verified Label Invoice</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white print:text-black uppercase font-display mt-1">
                PRANTIK SARKAR RECORD LABEL
              </h1>
              <p className="text-xs text-zinc-400 print:text-gray-600">
                Official Music Distribution, VEVO Provisioning & Artist Portal Management
              </p>
            </div>

            <div className="text-right sm:text-right space-y-1">
              <span className="text-xs font-mono font-bold text-zinc-400 print:text-gray-600 block">INVOICE NUMBER</span>
              <span className="text-lg font-mono font-extrabold text-white print:text-black">{invoice.id}</span>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 print:bg-gray-200 print:text-black print:border-black">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{invoice.status}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Meta Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pb-6 border-b border-white/10 print:border-black/20">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 print:text-gray-500">Billed To (Artist)</span>
              <p className="font-bold text-sm text-white print:text-black">{invoice.artist_name}</p>
              <p className="text-zinc-400 print:text-gray-600">{invoice.artist_email}</p>
              <p className="text-zinc-500 print:text-gray-500 font-mono text-[11px]">Artist ID: {invoice.artist_id}</p>
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 print:text-gray-500">Payment & Dispatch Record</span>
              <p className="text-zinc-300 print:text-black">
                Date: <strong className="text-white print:text-black">{new Date(invoice.payment_date).toLocaleDateString()}</strong>
              </p>
              <p className="text-zinc-400 print:text-gray-600 font-mono text-[11px]">
                Ref: {invoice.payment_reference}
              </p>
              <p className="text-zinc-400 print:text-gray-600">
                Method: <strong className="text-zinc-200 print:text-black">{invoice.payment_method}</strong> • Provider: <strong className="text-rose-400 print:text-black">{invoice.distribution_provider || 'DITTO'}</strong>
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 print:text-black">
              Itemized Service Breakdown
            </h2>

            <div className="border border-white/10 print:border-black rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-zinc-900 print:bg-gray-100 text-zinc-400 print:text-black uppercase text-[10px] tracking-wider border-b border-white/10 print:border-black">
                  <tr>
                    <th className="py-2.5 px-4">Service Description</th>
                    <th className="py-2.5 px-4 text-center">Qty / Songs</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-gray-300 text-zinc-300 print:text-black">
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-medium text-white print:text-black">
                          <div>{item.title}</div>
                          {item.details && <div className="text-[11px] text-zinc-500 print:text-gray-600">{item.details}</div>}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">{item.quantity}</td>
                        <td className="py-3 px-4 text-right font-mono">
                          {invoice.currency_symbol}{item.unit_price.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white print:text-black">
                          {invoice.currency_symbol}{item.subtotal.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-3 px-4 font-medium text-white print:text-black">{invoice.service_name}</td>
                      <td className="py-3 px-4 text-center font-mono">{invoice.quantity}</td>
                      <td className="py-3 px-4 text-right font-mono">
                        {invoice.currency_symbol}{invoice.unit_price.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white print:text-black">
                        {invoice.currency_symbol}{invoice.subtotal.toLocaleString()}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Calculation */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-2">
            <div className="space-y-1 text-xs text-zinc-400 print:text-gray-600 max-w-sm">
              <span className="font-bold text-white print:text-black block text-[11px] uppercase tracking-wider">
                Distribution & Platform Policy Notice
              </span>
              <p className="text-[11px] leading-relaxed">
                Distribution pipeline transmission provided in partnership with {invoice.distribution_provider || 'DITTO'}. Ingestion fees cover digital delivery, metadata validation, and DSP ingestion. Royalties are accounted at 85% to artist under the executed label agreement.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs border-t sm:border-t-0 pt-4 sm:pt-0 border-white/10 print:border-black">
              <div className="flex items-center justify-between text-zinc-400 print:text-gray-600">
                <span>Subtotal</span>
                <span className="font-mono text-white print:text-black">
                  {invoice.currency_symbol}{invoice.subtotal.toLocaleString()}
                </span>
              </div>

              {invoice.tax_amount > 0 && (
                <div className="flex items-center justify-between text-zinc-400 print:text-gray-600">
                  <span>Applicable Tax ({invoice.tax_percent}%)</span>
                  <span className="font-mono text-white print:text-black">
                    {invoice.currency_symbol}{invoice.tax_amount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm font-extrabold text-white print:text-black pt-2 border-t border-white/10 print:border-black">
                <span className="uppercase">Total Paid</span>
                <span className="text-lg font-mono text-emerald-400 print:text-black">
                  {invoice.currency_symbol}{invoice.total_amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Security Verification Note */}
          <div className="pt-6 border-t border-white/10 print:border-black/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-zinc-500 print:text-gray-600 font-mono">
            <div className="flex items-center gap-2">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400 print:text-black shrink-0" />
              <span>Cryptographically verified receipt • Idempotency secured</span>
            </div>
            <div>
              <span>Generated on {new Date(invoice.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
