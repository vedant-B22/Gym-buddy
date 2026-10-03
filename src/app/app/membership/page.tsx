'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Download,
  Share2,
  Calendar,
  CheckCircle,
  Clock,
  Send,
  AlertCircle,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { formatINR, formatDate } from '@/lib/business-logic';
import { generateInvoicePdf, getWhatsAppReceiptUrl } from '@/lib/invoice-generator';

export default function MemberMembershipPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewPlan, setRenewPlan] = useState('Annual VIP Iron Pass');
  const [renewNotes, setRenewNotes] = useState('');
  const [renewStatus, setRenewStatus] = useState<string | null>(null);

  const fetchMembership = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/member/membership');
      if (res.ok) {
        const d = await res.json();
        setData(d.member);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembership();
  }, []);

  const handleDownloadPdf = (pay: any) => {
    const inv = pay.invoices?.[0];
    const items = inv?.itemsJson ? JSON.parse(inv.itemsJson) : [{ description: 'Gym Membership', amount: pay.amount }];

    const doc = generateInvoicePdf({
      invoiceNumber: pay.invoiceNumber,
      paymentDate: pay.paymentDate,
      paymentMode: pay.paymentMode,
      referenceId: pay.referenceId,
      amount: pay.amount,
      discount: pay.discount,
      member: {
        name: data?.user?.name || 'Member',
        phone: data?.user?.phone || '',
        memberCode: data?.memberCode || '',
      },
      items,
    });

    doc.save(`${pay.invoiceNumber}.pdf`);
  };

  const handleRequestRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/member/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredPlanName: renewPlan,
          message: renewNotes,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        setRenewStatus(d.message || 'Renewal request sent!');
        setShowRenewModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-xs text-slate-400">Loading your membership record...</p>
      </div>
    );
  }

  const activePlan = data.memberships?.[0]?.plan;
  const daysLeft = data.currentExpiryDate
    ? Math.max(0, Math.ceil((new Date(data.currentExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black uppercase text-white tracking-tight">Membership & Invoices</h1>
        <p className="text-xs text-slate-400">
          Your current pass status, tax receipts recorded by front desk, and renewal requests.
        </p>
      </div>

      {renewStatus && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{renewStatus}</span>
        </div>
      )}

      {/* Current Pass Card */}
      <div className="bg-gradient-to-br from-[#121927] to-[#0E1524] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
            {data.status} PASS
          </span>
          <span className="font-mono text-xs text-slate-400">ID: {data.memberCode}</span>
        </div>

        <div>
          <h2 className="text-2xl font-black text-white">{activePlan?.name || 'Standard Gym Pass'}</h2>
          <p className="text-xs text-slate-400 mt-1">
            Unlimited Floor Access • Free induction • Induction Locker
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Days Remaining</span>
            <span className="text-lg font-black text-emerald-400">{daysLeft} Days</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Expiry Date</span>
            <span className="text-sm font-bold text-white mt-1 block">
              {formatDate(data.currentExpiryDate)}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowRenewModal(true)}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 active:scale-98"
        >
          Request Renewal (Pay at Gym)
        </button>
      </div>

      {/* Payment Receipts Ledger */}
      <div className="bg-[#121927] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
            Recorded Receipts & Tax Invoices
          </h3>
        </div>

        <div className="space-y-2.5">
          {(data.payments || []).map((pay: any) => (
            <div
              key={pay.id}
              className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-white">{pay.invoiceNumber}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {formatDate(pay.paymentDate)} • <span className="text-emerald-400 font-semibold">{pay.paymentMode}</span>
                </p>
                <span className="text-xs font-black text-emerald-400 block mt-1">
                  {formatINR(pay.amount)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDownloadPdf(pay)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center gap-1 text-[11px] font-bold border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PDF</span>
                </button>

                <a
                  href={getWhatsAppReceiptUrl(data.user.phone, data.user.name, pay.invoiceNumber, pay.amount)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-xl"
                  title="Share on WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Renewal Request Modal */}
      {showRenewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121927] border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="font-black text-base text-white uppercase tracking-tight mb-2">
              Request Membership Renewal
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              No online payments. Notify the front desk that you would like to renew your membership and pay cash/UPI at the reception.
            </p>

            <form onSubmit={handleRequestRenewal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Preferred Plan
                </label>
                <select
                  value={renewPlan}
                  onChange={(e) => setRenewPlan(e.target.value)}
                  className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Annual VIP Iron Pass">Annual VIP Iron Pass (₹18,999)</option>
                  <option value="Half-Yearly Elite">Half-Yearly Elite (₹11,499)</option>
                  <option value="Quarterly Pro">Quarterly Pro (₹6,499)</option>
                  <option value="Monthly Kickstart">Monthly Kickstart (₹2,499)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Optional Note for Staff
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Will come in this evening to pay via UPI"
                  value={renewNotes}
                  onChange={(e) => setRenewNotes(e.target.value)}
                  className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRenewModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
