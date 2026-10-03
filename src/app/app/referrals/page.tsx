'use client';

import React, { useState } from 'react';
import { Users, Copy, Check, Share2, Gift, Sparkles } from 'lucide-react';

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const referralCode = 'FORGE1001';

  const shareText = `Hey! I work out at Iron Forge Fitness in Indiranagar. Use my referral code ${referralCode} when you enroll at the gym to get 15% off your membership plus a free trainer induction! Check it out here: https://ironforgegym.in`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black uppercase text-white tracking-tight">Refer a Friend</h1>
        <p className="text-xs text-slate-400">Share fitness with friends and earn free membership extensions.</p>
      </div>

      {/* Hero Reward Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-6 text-slate-950 font-black shadow-xl shadow-emerald-500/25 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-950/20 flex items-center justify-center">
          <Gift className="w-6 h-6 text-slate-950" />
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-900/80">
            Iron Forge Loyalty Program
          </span>
          <h2 className="text-2xl font-black uppercase tracking-tight">
            Earn 15 Days Free Membership
          </h2>
          <p className="text-xs font-semibold text-slate-900/90 mt-1 leading-relaxed">
            When a friend signs up using your code at the front desk, you get 15 bonus days added to your pass and they get 15% off!
          </p>
        </div>
      </div>

      {/* Referral Code Box */}
      <div className="bg-[#121927] border border-slate-800 rounded-3xl p-5 shadow-xl text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Your Unique Referral Code
        </span>

        <div className="p-4 bg-slate-900 border-2 border-dashed border-emerald-500/50 rounded-2xl flex items-center justify-between">
          <span className="text-2xl font-black text-emerald-400 font-mono tracking-widest">
            {referralCode}
          </span>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-98"
        >
          <Share2 className="w-4 h-4" />
          <span>Share via WhatsApp</span>
        </a>
      </div>

      {/* How it works */}
      <div className="bg-[#121927] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3 text-xs">
        <h3 className="font-black text-sm uppercase tracking-wider text-white">How It Works</h3>
        <div className="space-y-2.5 text-slate-300">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0">1</span>
            <span>Share your referral code with your gym buddy or friend.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0">2</span>
            <span>They mention your code or phone number when enrolling at the reception desk.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0">3</span>
            <span>Front desk staff records the referral and automatically extends your pass by 15 days!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
