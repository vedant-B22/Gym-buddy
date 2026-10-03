'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Dumbbell, Shield, Check, Eye, EyeOff } from 'lucide-react';

export default function LeaderboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'streaks' | 'volume'>('streaks');
  const [optIn, setOptIn] = useState(true);

  const fetchCommunity = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/member/community');
      if (res.ok) {
        const d = await res.json();
        setData(d);
        setOptIn(d.optInLeaderboard);
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

  const handleToggleOptIn = async () => {
    const nextVal = !optIn;
    setOptIn(nextVal);
    await fetch('/api/member/community', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'TOGGLE_OPT_IN', optIn: nextVal }),
    });
    fetchCommunity();
  };

  const streaks = data?.leaderboard?.streaks || [];
  const volumes = data?.leaderboard?.volume || [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase text-white tracking-tight">Gym Leaderboard</h1>
          <p className="text-xs text-slate-400">See where you stand among fellow Iron Forge athletes.</p>
        </div>

        {/* Privacy Toggle */}
        <button
          onClick={handleToggleOptIn}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
            optIn
              ? 'bg-slate-800 text-emerald-400 border-slate-700'
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}
          title="Toggle Leaderboard Visibility"
        >
          {optIn ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{optIn ? 'Visible' : 'Hidden'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#121927] p-1 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('streaks')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'streaks'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Attendance Streak</span>
        </button>

        <button
          onClick={() => setActiveTab('volume')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'volume'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>Volume Lifted</span>
        </button>
      </div>

      {/* Leaderboard List */}
      <div className="bg-[#121927] border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800/80 shadow-xl">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading rankings...</div>
        ) : activeTab === 'streaks' ? (
          streaks.map((s: any) => (
            <div
              key={s.rank}
              className={`p-4 flex items-center justify-between transition-colors ${
                s.isMe ? 'bg-emerald-950/30' : ''
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                    s.rank === 1
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : s.rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : s.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-850 text-slate-400'
                  }`}
                >
                  {s.rank}
                </span>

                <div>
                  <h4 className="font-bold text-xs text-white">
                    {s.name} {s.isMe && <span className="text-emerald-400">(You)</span>}
                  </h4>
                  <p className="text-[10px] text-slate-400">Consistency Warrior</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 animate-flame-pulse" />
                <span className="font-black text-sm text-white">{s.streak} Days</span>
              </div>
            </div>
          ))
        ) : (
          volumes.map((v: any) => (
            <div
              key={v.rank}
              className={`p-4 flex items-center justify-between transition-colors ${
                v.isMe ? 'bg-emerald-950/30' : ''
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                    v.rank === 1
                      ? 'bg-amber-500 text-slate-950'
                      : v.rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : v.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-850 text-slate-400'
                  }`}
                >
                  {v.rank}
                </span>

                <div>
                  <h4 className="font-bold text-xs text-white">
                    {v.name} {v.isMe && <span className="text-emerald-400">(You)</span>}
                  </h4>
                  <p className="text-[10px] text-slate-400">{v.workouts} workouts completed</p>
                </div>
              </div>

              <span className="font-black text-sm text-emerald-400 font-mono">
                {v.volume.toLocaleString()} kg
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
