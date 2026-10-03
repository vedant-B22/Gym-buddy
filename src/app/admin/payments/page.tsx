'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  Download,
  Share2,
  Plus,
  Filter,
  ArrowUpRight,
  Receipt,
  CheckCircle,
} from 'lucide-react';
import { formatINR, formatDate } from '@/lib/business-logic';
import { generateInvoicePdf, getWhatsAppReceiptUrl } from '@/lib/invoice-generator';
import { RecordPaymentModal } from '@/components/admin/QuickModals';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const q = new URLSearchParams();
      if (search) q.append('search', search);
      if (modeFilter !== 'ALL') q.append('mode', modeFilter);

      const res = await fetch(`/api/admin/payments?${q.toString()}`);
      if (res.ok) {
        const d = await res.json();
        setPayments(d.payments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchPayments, 200);
    return () => clearTimeout(timer);
  }, [search, modeFilter]);

  const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

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
        name: pay.member?.user?.name || 'Member',
        phone: pay.member?.user?.phone || '',
        memberCode: pay.member?.memberCode || '',
      },
      items,
    });

    doc.save(`${pay.invoiceNumber}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase text-white tracking-tight">Manual Payment Ledger</h1>
          <p className="text-xs text-slate-400">
            Recorded front desk transactions (Cash, UPI, Card). Automatically issues branded PDF tax receipts.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Record Manual Payment</span>
        </button>
      </div>

      {/* Summary Card & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#121927] border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Total Filtered Collection
            </span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{formatINR(totalCollected)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121927] border border-slate-800 rounded-2xl p-4 shadow-lg sm:col-span-2 flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by invoice #, member, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0A0E1A] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400">Payment Mode:</span>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Modes</option>
              <option value="UPI">UPI</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-[#121927] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D1322] border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Plan / Description</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Mode & Ref</th>
                <th className="py-3.5 px-4">Staff</th>
                <th className="py-3.5 px-4 text-right">Receipts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {p.invoiceNumber}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {formatDate(p.paymentDate)}
                    </td>

                    <td className="py-3.5 px-4">
                      <Link href={`/admin/members/${p.member?.id}`} className="hover:underline">
                        <p className="font-bold text-slate-100">{p.member?.user?.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">{p.member?.memberCode}</p>
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {p.membership?.plan?.name || p.notes || 'General Payment'}
                    </td>

                    <td className="py-3.5 px-4 font-black text-emerald-400 text-sm">
                      {formatINR(p.amount)}
                      {p.discount > 0 && (
                        <span className="block text-[10px] text-slate-500">
                          Disc: {formatINR(p.discount)}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {p.paymentMode}
                      </span>
                      {p.referenceId && (
                        <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                          {p.referenceId}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {p.recordedBy?.name || 'Reception'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDownloadPdf(p)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 text-[11px] font-semibold border border-slate-700 transition-colors"
                          title="Download Tax PDF Invoice"
                        >
                          <Download className="w-3 h-3 text-emerald-400" />
                          <span>PDF</span>
                        </button>

                        {p.member?.user?.phone && (
                          <a
                            href={getWhatsAppReceiptUrl(
                              p.member.user.phone,
                              p.member.user.name,
                              p.invoiceNumber,
                              p.amount
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-lg flex items-center gap-1 text-[11px] font-semibold transition-colors"
                            title="Share on WhatsApp"
                          >
                            <Share2 className="w-3 h-3 text-emerald-400" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RecordPaymentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchPayments}
      />
    </div>
  );
}
