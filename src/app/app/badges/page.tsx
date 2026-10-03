'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Trophy,
  Flame,
  Zap,
  Crown,
  Sun,
  Lock,
  CheckCircle,
  Plus,
} from 'lucide-react';

export default function BadgesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCommunity = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/member/community');
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
    fetchCommunity();
  }, []);

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const res = await fetch('/api/member/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'JOIN_CHALLENGE', challengeId }),
      });
      if (res.ok) fetchCommunity();
    } catch (e) {
      console.error(e);
    }
  };

  const badges = data?.badges || [];
  const challenges = data?.challenges || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black uppercase text-white tracking-tight">Badges & Challenges</h1>
        <p className="text-xs text-slate-400">Unlock gym achievements and compete in monthly challenges.</p>
      </div>

      {/* Monthly Challenges */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
          Monthly Gym Challenges
        </h2>

        {challenges.map((c: any) => (
          <div
            key={c.id}
            className="p-5 rounded-3xl bg-gradient-to-br from-[#121927] to-[#0D1424] border border-amber-500/30 shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
                Active Challenge
              </span>
              <span className="text-xs font-bold text-amber-400">
                Reward: 15% Off Renewal
              </span>
            </div>

            <div>
              <h3 className="font-black text-base text-white">{c.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{c.description}</p>
            </div>

            {/* Progress Bar */}
            <div className="pt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Your Progress</span>
                <span className="font-bold text-white">
                  {c.myProgress} / {c.targetGoal} Days
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (c.myProgress / c.targetGoal) * 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-1">
              {c.isJoined ? (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> You are participating in this challenge!
                </span>
              ) : (
                <button
                  onClick={() => handleJoinChallenge(c.id)}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all"
                >
                  Join Challenge Free
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
          Gym Achievements ({badges.filter((b: any) => b.unlocked).length} / {badges.length} Unlocked)
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {badges.map((b: any) => (
            <div
              key={b.id}
              className={`p-4 rounded-3xl border flex flex-col items-center text-center transition-all ${
                b.unlocked
                  ? 'bg-[#121927] border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900/40 border-slate-800/60 opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-md ${
                  b.unlocked
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {b.unlocked ? <Award className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
              </div>

              <h4 className="font-bold text-xs text-white">{b.name}</h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">{b.description}</p>

              <span
                className={`text-[9px] font-black uppercase tracking-wider mt-3 px-2 py-0.5 rounded-full ${
                  b.unlocked
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {b.unlocked ? 'Unlocked' : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
