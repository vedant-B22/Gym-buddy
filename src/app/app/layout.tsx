'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Home,
  Dumbbell,
  BookOpen,
  TrendingUp,
  MoreHorizontal,
  QrCode,
  Flame,
  WifiOff,
  RefreshCw,
  Bell,
} from 'lucide-react';
import { syncOfflineWorkouts } from '@/lib/offline-db';

interface BottomNavTab {
  name: string;
  href: string;
  icon: any;
  exact?: boolean;
}

const navTabs: BottomNavTab[] = [
  { name: 'Home', href: '/app', icon: Home, exact: true },
  { name: 'Workout', href: '/app/workout', icon: Dumbbell },
  { name: 'Exercises', href: '/app/exercises', icon: BookOpen },
  { name: 'Progress', href: '/app/progress', icon: TrendingUp },
  { name: 'More', href: '/app/more', icon: MoreHorizontal },
];

export default function MemberAppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);
  const [syncedCount, setSyncedCount] = useState(0);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineWorkouts().then((r) => {
        if (r.syncedCount > 0) {
          setSyncedCount(r.syncedCount);
          setTimeout(() => setSyncedCount(0), 4000);
        }
      });
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync check
    syncOfflineWorkouts();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col max-w-md mx-auto relative shadow-2xl border-x border-slate-900">
      {/* Offline Status Pill */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-3 py-1 text-center text-xs font-bold flex items-center justify-center gap-1.5 z-40 sticky top-0">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode • Workouts save locally & auto-sync</span>
        </div>
      )}

      {syncedCount > 0 && (
        <div className="bg-emerald-500 text-slate-950 px-3 py-1 text-center text-xs font-bold flex items-center justify-center gap-1.5 z-40 sticky top-0 animate-bounce">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Synced {syncedCount} offline workout(s) successfully!</span>
        </div>
      )}

      {/* Top Mobile App Header */}
      <header className="sticky top-0 z-30 bg-[#0D1322]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <Link href="/app" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20 shrink-0">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-wider uppercase text-white leading-tight">
              IRON FORGE
            </h1>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              Indiranagar
            </p>
          </div>
        </Link>

        {/* Right Action Icons: QR Check-in & Notifications */}
        <div className="flex items-center gap-2">
          <Link
            href="/app/attendance"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold border border-emerald-500/30 transition-all active:scale-95"
            title="Open Check-in QR"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Check In</span>
          </Link>

          {user && user.role !== 'MEMBER' && (
            <Link
              href="/admin"
              className="px-2 py-1 bg-slate-800 text-amber-400 rounded-lg text-[10px] font-bold border border-slate-700"
              title="Return to Staff Admin"
            >
              Admin
            </Link>
          )}
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 pb-24 px-4 pt-4 overflow-y-auto">
        {children}
      </main>

      {/* Thumb-friendly Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0D1322]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 flex items-center justify-around z-40 pb-safe">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-emerald-500/15' : 'transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
