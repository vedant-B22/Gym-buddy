'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Users,
  CreditCard,
  QrCode,
  Calendar,
  AlertTriangle,
  TrendingUp,
  UserPlus,
  ArrowUpRight,
  Clock,
  Activity,
  DollarSign,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { formatINR, formatDate } from '@/lib/business-logic';
import { AddMemberModal, RecordPaymentModal, QuickCheckInModal } from '@/components/admin/QuickModals';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddMember, setShowAddMember] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-xs text-slate-400">Loading Gym Intelligence...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const recent = data?.recentActivity || {};

  const crowdPercentage = Math.min(100, Math.round(((kpis.currentCrowd || 0) / (kpis.maxCapacity || 80)) * 100));

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#121927] to-[#0F172A] p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
              Live Operations
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-400">
            Iron Forge Indiranagar • {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddMember(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10 active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>

          <button
            onClick={() => setShowRecordPayment(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-all border border-slate-700 active:scale-95"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={() => setShowCheckIn(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-all border border-slate-700 active:scale-95"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Desk Check-in</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Active Members */}
        <div className="bg-[#121927] border border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
              Active Members
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-white">{kpis.activeMembers || 0}</p>
            <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" /> +{kpis.newJoinsThisMonth || 0} joined this month
            </p>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-[#121927] border border-amber-500/30 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-400">
              Expiring in 7 Days
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-amber-400">{kpis.expiringIn7Days || 0}</p>
            <Link
              href="/admin/members?status=EXPIRING_SOON"
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 mt-1"
            >
              Send WhatsApp renewals →
            </Link>
          </div>
        </div>

        {/* Revenue This Month */}
        <div className="bg-[#121927] border border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
              Revenue (This Month)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-emerald-400">
              {formatINR(kpis.revenueThisMonth || 0)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Outstanding Dues: <span className="text-amber-400 font-bold">{formatINR(kpis.duesOutstanding || 0)}</span>
            </p>
          </div>
        </div>

        {/* Today's Check-ins */}
        <div className="bg-[#121927] border border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
              Today&apos;s Check-ins
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-white">{kpis.todayCheckIns || 0}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              {kpis.expiredMembers || 0} expired members total
            </p>
          </div>
        </div>
      </div>

      {/* Crowd Indicator Meter & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crowd Indicator Card */}
        <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  Live Gym Crowd
                </h3>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                crowdPercentage > 75 ? 'bg-red-950/80 text-red-400 border border-red-800' :
                crowdPercentage > 45 ? 'bg-amber-950/80 text-amber-400 border border-amber-800' :
                'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
              }`}>
                {crowdPercentage > 75 ? 'High Rush' : crowdPercentage > 45 ? 'Moderate' : 'Low Traffic'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-black text-white">{kpis.currentCrowd || 0}</span>
              <span className="text-xs text-slate-400">/ {kpis.maxCapacity || 80} Max Capacity</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  crowdPercentage > 75 ? 'bg-red-500' :
                  crowdPercentage > 45 ? 'bg-amber-500' :
                  'bg-emerald-500'
                }`}
                style={{ width: `${crowdPercentage}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-500 mb-4">
              <span>0 (Empty)</span>
              <span>40 (Normal)</span>
              <span>80 (Packed)</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-400">
            <span className="text-slate-300 font-semibold">Typical Busy Hours:</span>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span>🌅 Morning Rush: 06:30 - 09:30</span>
              <span>🌆 Evening Rush: 18:00 - 21:00</span>
            </div>
          </div>
        </div>

        {/* Peak Hours Heatmap Distribution */}
        <div className="lg:col-span-2 bg-[#121927] border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                Peak Hours Rush Distribution
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Hourly Footfall Pattern</span>
          </div>

          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 items-end h-32 pt-4">
            {Object.entries(charts.hourlyDistribution || {}).map(([hour, count]: [string, any]) => {
              const maxVal = 40;
              const heightPct = Math.min(100, Math.round((count / maxVal) * 100));
              const isPeak = count >= 25;
              return (
                <div key={hour} className="flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 bg-slate-900 border border-slate-700 text-[10px] text-white px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                    {hour}: {count} visits
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-t h-24 flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t transition-all ${
                        isPeak ? 'bg-amber-500' : 'bg-emerald-500/80 group-hover:bg-emerald-400'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono scale-90 -rotate-45 origin-left sm:rotate-0">
                    {hour.split(':')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Standard Traffic
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500" /> High Rush Hours
              </span>
            </div>
            <Link href="/admin/attendance" className="text-emerald-400 hover:underline font-semibold">
              Open Reception Kiosk →
            </Link>
          </div>
        </div>
      </div>

      {/* Revenue Trend & Plan Popularity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 6-Month Revenue Trend */}
        <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                6-Month Revenue Growth (₹)
              </h3>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold">Consistent Growth</span>
          </div>

          <div className="grid grid-cols-6 gap-3 items-end h-36 pt-4">
            {(charts.revenueTrend || []).map((item: any) => {
              const maxRev = 260000;
              const heightPct = Math.min(100, Math.round((item.revenue / maxRev) * 100));
              return (
                <div key={item.month} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-slate-300 font-bold">
                    {(item.revenue / 1000).toFixed(0)}k
                  </span>
                  <div className="w-full bg-slate-800/80 rounded-t h-24 flex items-end overflow-hidden">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan Popularity Distribution */}
        <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Membership Plan Breakdown
            </h3>
            <Link href="/admin/plans" className="text-xs text-emerald-400 hover:underline font-semibold">
              Manage Plans
            </Link>
          </div>

          <div className="space-y-3">
            {(charts.planPopularity || []).map((p: any) => (
              <div key={p.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">{p.name}</span>
                  <span className="text-slate-400">
                    <strong className="text-white">{p.activeMembers}</strong> members ({formatINR(p.price)})
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, p.activeMembers * 15)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Payments Ledger & Today's Attendance Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Recent Payments (Manual Receipts)
            </h3>
            <Link href="/admin/payments" className="text-xs text-emerald-400 hover:underline font-semibold">
              View All ({kpis.activeMembers})
            </Link>
          </div>

          <div className="space-y-2">
            {(recent.payments || []).map((pay: any) => (
              <div
                key={pay.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs text-white">{pay.member?.user?.name || 'Member'}</p>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.2 rounded">
                      {pay.invoiceNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {formatDate(pay.paymentDate)} • <span className="text-emerald-400 font-medium">{pay.paymentMode}</span>
                  </p>
                </div>
                <span className="font-black text-sm text-emerald-400">
                  {formatINR(pay.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Live Check-ins
            </h3>
            <Link href="/admin/attendance" className="text-xs text-emerald-400 hover:underline font-semibold">
              View Log
            </Link>
          </div>

          <div className="space-y-2">
            {(recent.attendance || []).map((att: any) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400">
                    {att.member?.user?.name?.charAt(0) || 'M'}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white">{att.member?.user?.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {att.checkInMethod === 'QR_SCAN' ? '📱 Mobile QR Scan' : '📋 Reception Check-in'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-300">
                  {new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Modals */}
      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onSuccess={fetchDashboard}
      />
      <RecordPaymentModal
        isOpen={showRecordPayment}
        onClose={() => setShowRecordPayment(false)}
        onSuccess={fetchDashboard}
      />
      <QuickCheckInModal
        isOpen={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        onSuccess={fetchDashboard}
      />
    </div>
  );
}
