'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Apple,
  Calendar,
  Trophy,
  Award,
  Users,
  CreditCard,
  Phone,
  LogOut,
  ChevronRight,
  Shield,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export default function MemberMoreMenuPage() {
  const { user, logout } = useAuth();

  const menuSections = [
    {
      title: 'Fitness & Lifestyle',
      items: [
        { name: 'Nutrition & Macro Tracker', href: '/app/nutrition', icon: Apple, desc: 'Daily calories & Indian food logger' },
        { name: 'Classes & Timetable', href: '/app/classes', icon: Calendar, desc: 'Book Zumba, HIIT & Power Yoga slots' },
        { name: 'Leaderboard & Streaks', href: '/app/leaderboard', icon: Trophy, desc: 'See gym rankings & attendance' },
        { name: 'Badges & Achievements', href: '/app/badges', icon: Award, desc: 'Unlock milestones & consistency trophies' },
        { name: 'Refer a Friend', href: '/app/referrals', icon: Users, desc: 'Share referral code & earn free days' },
      ],
    },
    {
      title: 'Account & Membership',
      items: [
        { name: 'My Membership & Receipts', href: '/app/membership', icon: CreditCard, desc: 'Plan expiry & downloadable PDF tax receipts' },
        { name: 'Public Marketing Website', href: '/', icon: ExternalLink, desc: 'View timetable, trainers & prices' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Member Profile Card */}
      <div className="bg-[#121927] border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-black text-slate-950 text-xl shadow-md">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <h2 className="font-black text-base text-white">{user?.name || 'Arjun Mehta'}</h2>
            <p className="text-xs text-slate-400 font-mono">Member ID: IF-1001</p>
          </div>
        </div>

        {user && user.role !== 'MEMBER' && (
          <Link
            href="/admin"
            className="px-3 py-1.5 bg-slate-800 text-amber-400 font-bold rounded-xl text-xs border border-slate-700"
          >
            Staff Admin
          </Link>
        )}
      </div>

      {/* Menu Sections */}
      {menuSections.map((sec, idx) => (
        <div key={idx} className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
            {sec.title}
          </span>
          <div className="bg-[#121927] border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800/80 shadow-xl">
            {sec.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="p-4 flex items-center justify-between hover:bg-slate-850/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {/* Gym Support & Hours Info */}
      <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-xs text-slate-400 space-y-1">
        <strong className="text-white block font-bold">IRON FORGE FITNESS • INDIRANAGAR</strong>
        <p>42, 100 Feet Road, Indiranagar, Bengaluru 560038</p>
        <p>Helpdesk: +91 98765 43210 (5:30 AM - 10:30 PM)</p>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full py-3 bg-red-950/40 hover:bg-red-900/40 border border-red-800/50 text-red-300 font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out of Member App</span>
      </button>
    </div>
  );
}
