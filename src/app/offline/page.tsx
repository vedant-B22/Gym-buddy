'use client';

import React from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, Dumbbell } from 'lucide-react';

export default function OfflinePage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-6 text-emerald-400 shadow-lg shadow-emerald-500/10">
        <WifiOff className="w-10 h-10 animate-pulse text-amber-400" />
      </div>

      <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">You are Offline</h1>
      <p className="text-slate-400 max-w-sm mb-8 text-sm leading-relaxed">
        No internet connection detected. Don&apos;t worry—your active workout, exercise library, and logged sets are cached locally on this device.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={handleReload}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>

        <Link
          href="/app/workout/active"
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all active:scale-95"
        >
          <Dumbbell className="w-4 h-4 text-emerald-400" />
          Continue Workout
        </Link>
      </div>

      <p className="mt-12 text-xs text-slate-500">
        Iron Forge PWA • Offline First Architecture
      </p>
    </div>
  );
}
