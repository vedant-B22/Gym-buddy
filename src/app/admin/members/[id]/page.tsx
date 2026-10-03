'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  QrCode,
  Flame,
  PauseCircle,
  PlayCircle,
  Clock,
  Dumbbell,
  Trophy,
  Activity,
  Download,
  Share2,
  Lock,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { formatINR, formatDate } from '@/lib/business-logic';
import { generateInvoicePdf, getWhatsAppReceiptUrl } from '@/lib/invoice-generator';
import { RecordPaymentModal } from '@/components/admin/QuickModals';

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'membership' | 'attendance' | 'workouts' | 'metrics' | 'plans'>('membership');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/members/${id}`);
      if (res.ok) {
        const d = await res.json();
        setMember(d.member);
      } else {
        router.push('/admin/members');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMember();
  }, [id]);

  const handleAction = async (action: string, payload: any = {}) => {
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: data.message || 'Action executed successfully' });
        fetchMember();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Action failed' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network request error' });
    }
  };

  const handleDownloadInvoice = (pay: any) => {
    const inv = pay.invoices?.[0];
    const items = inv?.itemsJson ? JSON.parse(inv.itemsJson) : [{ description: 'Membership Fees', amount: pay.amount }];

    const doc = generateInvoicePdf({
      invoiceNumber: pay.invoiceNumber,
      paymentDate: pay.paymentDate,
      paymentMode: pay.paymentMode,
      referenceId: pay.referenceId,
      amount: pay.amount,
      discount: pay.discount,
      member: {
        name: member.user.name,
        phone: member.user.phone,
        memberCode: member.memberCode,
      },
      items,
    });

    doc.save(`${pay.invoiceNumber}_${member.user.name.replace(/\s+/g, '_')}.pdf`);
  };

  if (loading || !member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-xs text-slate-400">Loading member file...</p>
      </div>
    );
  }

  const isFrozen = member.status === 'FROZEN';
  const isExpired = member.status === 'EXPIRED';
  const latestPlan = member.memberships?.[0]?.plan;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Member Directory
        </Link>
      </div>

      {actionMessage && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
              : 'bg-red-950/80 border border-red-800 text-red-300'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Member Header Card */}
      <div className="bg-[#121927] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & Info */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-emerald-500/20 shrink-0">
              {member.user.name.charAt(0)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white">{member.user.name}</h1>
                <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {member.memberCode}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isFrozen
                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                      : isExpired
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}
                >
                  {member.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                <a
                  href={`https://wa.me/91${member.user.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-emerald-400 text-slate-300 font-mono"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> +91 {member.user.phone}
                </a>

                {member.user.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-500" /> {member.user.email}
                  </span>
                )}

                <span>Goal: <strong className="text-white">{member.fitnessGoal || 'General Fitness'}</strong></span>
                <span>Referral Code: <strong className="text-amber-400 font-mono">{member.referralCode}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <CreditCard className="w-4 h-4" /> Record Payment
            </button>

            {isFrozen ? (
              <button
                onClick={() => handleAction('UNFREEZE')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-semibold rounded-xl text-xs transition-all"
              >
                <PlayCircle className="w-4 h-4" /> Unfreeze Membership
              </button>
            ) : (
              <button
                onClick={() => {
                  const reason = prompt('Reason for freezing membership:');
                  if (reason !== null) handleAction('FREEZE', { reason });
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all border border-slate-700"
              >
                <PauseCircle className="w-4 h-4 text-cyan-400" /> Freeze Clock
              </button>
            )}

            <button
              onClick={() => {
                const days = prompt('Enter number of days to extend membership:', '15');
                if (days) handleAction('EXTEND', { days });
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all border border-slate-700"
            >
              <Clock className="w-4 h-4 text-amber-400" /> Extend Expiry
            </button>

            <button
              onClick={() => {
                if (confirm('Reset this member\'s password to default: password123?')) {
                  handleAction('RESET_PASSWORD', { password: 'password123' });
                }
              }}
              title="Reset Password to password123"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400">Current Plan</span>
            <p className="text-sm font-bold text-white mt-0.5">{latestPlan?.name || 'No Plan'}</p>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400">Expiry Date</span>
            <p className="text-sm font-bold text-emerald-400 mt-0.5">
              {formatDate(member.currentExpiryDate)}
            </p>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400">Attendance Streak</span>
            <p className="text-sm font-bold text-white mt-0.5 flex items-center gap-1">
              <Flame className="w-4 h-4 text-amber-500" /> {member.streakCurrent} days
            </p>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400">Workouts Logged</span>
            <p className="text-sm font-bold text-white mt-0.5 flex items-center gap-1">
              <Dumbbell className="w-4 h-4 text-emerald-400" /> {member.workouts?.length || 0} sessions
            </p>
          </div>
        </div>

        {member.healthNotes && (
          <div className="mt-4 p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl text-xs text-amber-300">
            <strong>⚠️ Health & Trainer Notes:</strong> {member.healthNotes}
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 gap-6 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('membership')}
          className={`pb-3 transition-colors ${
            activeTab === 'membership'
              ? 'border-b-2 border-emerald-500 text-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Payments & Receipts ({member.payments?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 transition-colors ${
            activeTab === 'attendance'
              ? 'border-b-2 border-emerald-500 text-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Attendance ({member.attendance?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('workouts')}
          className={`pb-3 transition-colors ${
            activeTab === 'workouts'
              ? 'border-b-2 border-emerald-500 text-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Workouts & PRs ({member.workouts?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`pb-3 transition-colors ${
            activeTab === 'metrics'
              ? 'border-b-2 border-emerald-500 text-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Body Metrics
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`pb-3 transition-colors ${
            activeTab === 'plans'
              ? 'border-b-2 border-emerald-500 text-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Assigned Programs
        </button>
      </div>

      {/* Tab 1: Payments & Receipts */}
      {activeTab === 'membership' && (
        <div className="bg-[#121927] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Payment History & Tax Invoices
            </h3>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="text-xs text-emerald-400 hover:underline font-bold"
            >
              + Record Payment
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D1322] border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Ref / Txn ID</th>
                <th className="py-3 px-4">Recorded By</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(member.payments || []).map((pay: any) => (
                <tr key={pay.id} className="hover:bg-slate-850/50">
                  <td className="py-3 px-4 font-mono font-bold text-white">{pay.invoiceNumber}</td>
                  <td className="py-3 px-4 text-slate-300">{formatDate(pay.paymentDate)}</td>
                  <td className="py-3 px-4 font-bold text-emerald-400">{formatINR(pay.amount)}</td>
                  <td className="py-3 px-4 text-slate-300 font-semibold">{pay.paymentMode}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {pay.referenceId || '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{pay.recordedBy?.name || 'Staff'}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDownloadInvoice(pay)}
                        title="Download Branded PDF Receipt"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 text-[11px]"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>PDF</span>
                      </button>

                      <a
                        href={getWhatsAppReceiptUrl(member.user.phone, member.user.name, pay.invoiceNumber, pay.amount)}
                        target="_blank"
                        rel="noreferrer"
                        title="Share Receipt on WhatsApp"
                        className="p-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-lg flex items-center gap-1 text-[11px]"
                      >
                        <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Attendance Log */}
      {activeTab === 'attendance' && (
        <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Recent Check-in Records
            </h3>
            <span className="text-xs text-slate-400">Total Visits: {member.attendance?.length || 0}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(member.attendance || []).map((att: any) => (
              <div
                key={att.id}
                className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-white">{formatDate(att.checkInTime)}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {att.checkOutTime && ` → ${new Date(att.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  {att.checkInMethod === 'QR_SCAN' ? 'QR Scan' : 'Desk'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Workouts & PRs */}
      {activeTab === 'workouts' && (
        <div className="space-y-6">
          {/* PRs Showcase */}
          <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                Personal Records (PRs)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(member.personalRecords || []).map((pr: any) => (
                <div
                  key={pr.id}
                  className="p-4 bg-slate-900 border border-amber-500/20 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-xs text-white">{pr.exercise?.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{pr.recordType.replace('_', ' ')}</p>
                  </div>
                  <span className="text-xl font-black text-amber-400">{pr.value} kg</span>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Workouts */}
          <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Workout Sessions Logged
            </h3>

            <div className="space-y-3">
              {(member.workouts || []).map((w: any) => (
                <div key={w.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{w.name}</h4>
                      <p className="text-xs text-slate-400">
                        {formatDate(w.createdAt)} • Duration: {Math.round(w.durationSeconds / 60)} mins • Volume:{' '}
                        <strong className="text-emerald-400">{w.totalVolumeKg} kg</strong>
                      </p>
                    </div>
                    {w.notes && <p className="text-xs text-slate-400 italic">&ldquo;{w.notes}&rdquo;</p>}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
                    {(w.sets || []).map((s: any) => (
                      <span
                        key={s.id}
                        className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono"
                      >
                        {s.exercise?.name}: {s.weightKg}kg × {s.reps}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Body Metrics */}
      {activeTab === 'metrics' && (
        <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">
            Body Composition & Measurement Trend
          </h3>

          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D1322] border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Weight (kg)</th>
                <th className="py-2.5 px-3">Chest (cm)</th>
                <th className="py-2.5 px-3">Waist (cm)</th>
                <th className="py-2.5 px-3">Arms (cm)</th>
                <th className="py-2.5 px-3">Body Fat %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(member.bodyMetrics || []).map((m: any) => (
                <tr key={m.id} className="hover:bg-slate-850">
                  <td className="py-2.5 px-3 font-semibold text-white">{formatDate(m.date)}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">{m.weightKg || '—'} kg</td>
                  <td className="py-2.5 px-3 text-slate-300">{m.chestCm || '—'}</td>
                  <td className="py-2.5 px-3 text-slate-300">{m.waistCm || '—'}</td>
                  <td className="py-2.5 px-3 text-slate-300">{m.armsCm || '—'}</td>
                  <td className="py-2.5 px-3 text-amber-400 font-semibold">{m.bodyFatPercent ? `${m.bodyFatPercent}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Assigned Plans */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Workout Program */}
          <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-emerald-400" /> Assigned Workout Routine
            </h3>

            {member.planAssignments?.[0]?.plan ? (
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <h4 className="font-bold text-base text-emerald-400">
                  {member.planAssignments[0].plan.name}
                </h4>
                <p className="text-xs text-slate-300">{member.planAssignments[0].plan.description}</p>
                <div className="flex gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>Days/Week: {member.planAssignments[0].plan.daysPerWeek}</span>
                  <span>•</span>
                  <span>Goal: {member.planAssignments[0].plan.targetGoal}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No workout plan assigned yet.</p>
            )}
          </div>

          {/* Diet Plan */}
          <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Assigned Diet Chart
            </h3>

            {member.dietPlans?.[0] ? (
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <h4 className="font-bold text-base text-emerald-400">{member.dietPlans[0].name}</h4>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-slate-800 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Calories</span>
                    <strong className="text-xs text-white">{member.dietPlans[0].dailyCaloriesTarget}</strong>
                  </div>
                  <div className="bg-slate-800 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Protein</span>
                    <strong className="text-xs text-emerald-400">{member.dietPlans[0].proteinTarget}g</strong>
                  </div>
                  <div className="bg-slate-800 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Carbs</span>
                    <strong className="text-xs text-amber-400">{member.dietPlans[0].carbsTarget}g</strong>
                  </div>
                  <div className="bg-slate-800 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Fat</span>
                    <strong className="text-xs text-blue-400">{member.dietPlans[0].fatTarget}g</strong>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No diet plan assigned yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={showPaymentModal}
        defaultMemberId={member.id}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={fetchMember}
      />
    </div>
  );
}
