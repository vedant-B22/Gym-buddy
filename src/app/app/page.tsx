'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Flame,
  Dumbbell,
  QrCode,
  Calendar,
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Play,
  CheckCircle,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { formatDate } from '@/lib/business-logic';

export default function MemberDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/member/dashboard');
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
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-xs text-slate-400">Loading your workout portal...</p>
      </div>
    );
  }

  const member = data?.member || {};
  const crowd = data?.crowd || {};
  const todayWorkout = data?.todayWorkout || {};
  const weekAttendance = data?.weekAttendance || [];
  const checkedInToday = data?.checkedInToday;

  const isExpiringSoon = member.status === 'EXPIRING_SOON';
  const isExpired = member.status === 'EXPIRED';

  return (
    <div className="space-y-5">
      {/* Member Greeting & Streak */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400">Ready to train,</span>
          <h2 className="text-xl font-black text-white">{member.name?.split(' ')[0]}!</h2>
        </div>

        {/* Streak Counter Pill */}
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 px-3 py-1.5 rounded-2xl shadow-lg shadow-amber-500/10">
          <Flame className="w-5 h-5 text-amber-400 animate-flame-pulse" />
          <div className="text-left">
            <span className="block text-xs font-black text-amber-300 leading-tight">
              {member.streakCurrent || 0} DAY STREAK
            </span>
            <span className="block text-[9px] text-amber-400/80 font-semibold uppercase">
              Keep it up!
            </span>
          </div>
        </div>
      </div>

      {/* Membership Status Bar */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isExpiringSoon
            ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
            : isExpired
            ? 'bg-red-950/40 border-red-500/50 text-red-200'
            : 'bg-[#121927] border-slate-800 text-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {member.planName}
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              isExpired
                ? 'bg-red-900/80 text-red-300'
                : isExpiringSoon
                ? 'bg-amber-900/80 text-amber-300'
                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}
          >
            {member.status}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-lg font-black text-white">
              {isExpired ? 'Membership Expired' : `${member.daysRemaining} Days Left`}
            </p>
            <p className="text-[11px] text-slate-400">
              Valid until {formatDate(member.currentExpiryDate)}
            </p>
          </div>

          <Link
            href="/app/membership"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-emerald-400 border border-slate-700 transition-colors"
          >
            {isExpiringSoon || isExpired ? 'Renew Now' : 'View Pass'}
          </Link>
        </div>
      </div>

      {/* Hero: Today's Workout Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#131C2E] via-[#0E1524] to-[#0A0E1A] border border-emerald-500/30 rounded-3xl p-5 shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
            Today&apos;s Workout Routine
          </span>
        </div>

        <h3 className="text-lg font-black text-white leading-snug">
          {todayWorkout?.dayName || 'Push Day (Chest, Shoulders & Triceps)'}
        </h3>

        <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" /> ~50 mins
          </span>
          <span className="flex items-center gap-1">
            <Dumbbell className="w-3.5 h-3.5 text-slate-500" /> 5 Exercises
          </span>
        </div>

        <Link
          href="/app/workout/active"
          className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-98"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>Start Today&apos;s Workout</span>
        </Link>
      </div>

      {/* Week Attendance Activity Rings */}
      <div className="bg-[#121927] border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            This Week&apos;s Attendance
          </span>
          <span className="text-[11px] text-emerald-400 font-semibold">
            {checkedInToday ? '✓ Checked in today' : 'Not yet checked in'}
          </span>
        </div>

        <div className="flex justify-between items-center px-1">
          {weekAttendance.map((day: any) => (
            <div key={day.date} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                  day.attended
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                    : day.isToday
                    ? 'border-2 border-dashed border-emerald-500 text-emerald-400'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {day.attended ? '✓' : day.day}
              </div>
              <span className={`text-[10px] ${day.isToday ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                {day.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Gym Crowd Meter */}
      <div className="bg-[#121927] border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Gym Crowd Right Now
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
            crowd.rushLevel === 'High' ? 'bg-red-950 text-red-400 border border-red-800' :
            crowd.rushLevel === 'Moderate' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
            'bg-emerald-950 text-emerald-400 border border-emerald-800'
          }`}>
            {crowd.rushLevel} Traffic
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-black text-white">{crowd.count || 12}</span>
          <span className="text-xs text-slate-400">/ {crowd.capacity || 80} active members inside</span>
        </div>

        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${Math.min(100, ((crowd.count || 12) / (crowd.capacity || 80)) * 100)}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-500">
          Best time to workout today: <strong>11:00 AM - 4:00 PM</strong> (Lowest footfall)
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/app/attendance"
          className="p-3.5 rounded-2xl bg-[#121927] border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-3 active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Scan Entry QR</h4>
            <p className="text-[10px] text-slate-400">Check into gym</p>
          </div>
        </Link>

        <Link
          href="/app/progress"
          className="p-3.5 rounded-2xl bg-[#121927] border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-3 active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Log Weight</h4>
            <p className="text-[10px] text-slate-400">Track measurements</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
