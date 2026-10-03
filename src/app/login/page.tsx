'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import Link from 'next/link';
import { Dumbbell, ArrowRight, Lock, Phone, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, switchDemoRole } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(identifier, password);
    setLoading(false);

    if (res.success) {
      const checkRes = await fetch('/api/auth/me');
      const data = await checkRes.json();
      if (data.user?.role === 'MEMBER') {
        router.push('/app');
      } else {
        router.push('/admin');
      }
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  const handleQuickDemo = async (role: string) => {
    setError('');
    await switchDemoRole(role);
  };

  return (
    <div className="min-h-[calc(100vh-38px)] bg-[#090D16] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <Dumbbell className="w-7 h-7" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black tracking-tight text-white block uppercase leading-none">
                IRON FORGE
              </span>
              <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                Fitness & Performance
              </span>
            </div>
          </Link>
          <h1 className="text-xl font-bold text-slate-100">Welcome to Your Gym Portal</h1>
          <p className="text-sm text-slate-400 mt-1">Sign in to track workouts or manage gym operations</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#121927]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Phone Number or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 9811122331 or arjun@gmail.com"
                  className="w-full bg-[#0A0E1A] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <Phone className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-xs text-slate-500">(Default: password123)</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0A0E1A] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-98"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Quick Demo Login Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                1-Click Demo Login:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('OWNER')}
                className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
              >
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <span>👑 Owner</span>
                </div>
                <div className="text-[11px] text-slate-400">Raghav (All Admin)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('MEMBER')}
                className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
              >
                <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <span>📱 Member</span>
                </div>
                <div className="text-[11px] text-slate-400">Arjun (App PWA)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('TRAINER')}
                className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
              >
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>🏋️ Trainer</span>
                </div>
                <div className="text-[11px] text-slate-400">Vikram Rao</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('RECEPTIONIST')}
                className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
              >
                <div className="font-bold text-purple-400 flex items-center gap-1.5">
                  <span>📋 Reception</span>
                </div>
                <div className="text-[11px] text-slate-400">Neha (Desk & QR)</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1 font-medium"
          >
            ← Back to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
