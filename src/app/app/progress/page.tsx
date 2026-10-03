'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Trophy,
  Scale,
  Plus,
  Flame,
  Calendar,
  X,
  CheckCircle,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';
import { formatDate } from '@/lib/business-logic';

export default function MemberProgressPage() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [prs, setPrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  // New metric form
  const [weightKg, setWeightKg] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [chestCm, setChestCm] = useState('');
  const [armsCm, setArmsCm] = useState('');
  const [bodyFatPercent, setBodyFatPercent] = useState('');
  const [saving, setSaving] = useState(false);

  // Photo slider comparison state (0 to 100%)
  const [sliderPosition, setSliderPosition] = useState(50);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const [mRes, wRes] = await Promise.all([
        fetch('/api/member/metrics'),
        fetch('/api/member/workouts'),
      ]);

      if (mRes.ok) {
        const mData = await mRes.json();
        setMetrics(mData.metrics || []);
        if (mData.currentWeight) setWeightKg(mData.currentWeight.toString());
      }

      if (wRes.ok) {
        const wData = await wRes.json();
        setPrs(wData.personalRecords || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleSaveMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/member/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weightKg,
          waistCm,
          chestCm,
          armsCm,
          bodyFatPercent,
        }),
      });

      if (res.ok) {
        setShowLogModal(false);
        fetchProgress();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // SVG Chart calculation for Weight Trend
  const validWeights = metrics.filter((m) => m.weightKg).map((m) => m.weightKg);
  const minWeight = validWeights.length ? Math.floor(Math.min(...validWeights) - 2) : 65;
  const maxWeight = validWeights.length ? Math.ceil(Math.max(...validWeights) + 2) : 85;

  const chartPoints = metrics.map((m, idx) => {
    const x = metrics.length === 1 ? 150 : (idx / (metrics.length - 1)) * 300;
    const yPct = (m.weightKg - minWeight) / Math.max(1, maxWeight - minWeight);
    const y = 120 - yPct * 90; // inverted for SVG coordinates
    return { x, y, weight: m.weightKg, date: m.date };
  });

  const pathD = chartPoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const latestMetric = metrics[metrics.length - 1] || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase text-white tracking-tight">Progress & Records</h1>
          <p className="text-xs text-slate-400">Track body composition, weight milestones & lift PRs.</p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Log Weight</span>
        </button>
      </div>

      {/* Personal Records Showcase */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
            Personal Bests (PRs)
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(prs.length > 0 ? prs.slice(0, 4) : [
            { exercise: { name: 'Barbell Bench Press' }, value: 100 },
            { exercise: { name: 'Barbell Back Squat' }, value: 140 },
            { exercise: { name: 'Conventional Deadlift' }, value: 180 },
            { exercise: { name: 'Military Press' }, value: 65 },
          ]).map((pr, i) => (
            <div
              key={i}
              className="p-3.5 bg-gradient-to-br from-[#121927] to-[#0E1524] border border-amber-500/20 rounded-2xl flex flex-col justify-between shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate max-w-[100px]">
                  {pr.exercise?.name || 'Lift'}
                </span>
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-2xl font-black text-amber-400">{pr.value} kg</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body Weight Trend Chart */}
      <div className="bg-[#121927] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Current Weight
            </span>
            <span className="text-2xl font-black text-emerald-400">
              {latestMetric.weightKg ? `${latestMetric.weightKg} kg` : '76.0 kg'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Fat Loss Progress
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
              - 5.5 kg Total
            </span>
          </div>
        </div>

        {/* SVG Responsive Line Chart */}
        <div className="w-full h-36 relative">
          <svg viewBox="0 0 300 130" className="w-full h-full overflow-visible">
            {/* Grid horizontal lines */}
            <line x1="0" y1="30" x2="300" y2="30" stroke="#1E293B" strokeDasharray="3 3" />
            <line x1="0" y1="75" x2="300" y2="75" stroke="#1E293B" strokeDasharray="3 3" />
            <line x1="0" y1="120" x2="300" y2="120" stroke="#1E293B" strokeDasharray="3 3" />

            {/* Line Path */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#10B981"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Dot markers */}
            {chartPoints.map((pt, i) => (
              <g key={i}>
                <circle cx={pt.x} cy={pt.y} r="5" fill="#10B981" />
                <circle cx={pt.x} cy={pt.y} r="2.5" fill="#090D16" />
                <text
                  x={pt.x}
                  y={pt.y - 10}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {pt.weight}k
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
          <span>90 Days Ago</span>
          <span>60 Days Ago</span>
          <span>30 Days Ago</span>
          <span className="text-emerald-400 font-bold">Today</span>
        </div>
      </div>

      {/* Body Measurements Tracker */}
      <div className="bg-[#121927] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
          Latest Circumference Measurements
        </h3>

        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Waist</span>
            <span className="text-sm font-black text-white">{latestMetric.waistCm || 81} cm</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Chest</span>
            <span className="text-sm font-black text-white">{latestMetric.chestCm || 103} cm</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Arms</span>
            <span className="text-sm font-black text-white">{latestMetric.armsCm || 38} cm</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Progress Photo Comparison Slider */}
      <div className="bg-[#121927] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Transformation Visualizer
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Drag slider to compare</span>
        </div>

        {/* Interactive Comparison Slider */}
        <div className="relative w-full h-64 rounded-2xl overflow-hidden select-none border border-slate-800">
          {/* "After" Image (Background) */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600")',
            }}
          >
            <span className="absolute bottom-3 right-3 bg-emerald-950/90 text-emerald-400 font-black text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider border border-emerald-800">
              Today (Day 90)
            </span>
          </div>

          {/* "Before" Image (Clipped Left) */}
          <div
            className="absolute inset-0 bg-cover bg-center overflow-hidden border-r-2 border-emerald-400"
            style={{
              width: `${sliderPosition}%`,
              backgroundImage: 'url("https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600")',
            }}
          >
            <span className="absolute bottom-3 left-3 bg-slate-950/90 text-slate-200 font-black text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider border border-slate-700">
              Day 1 (Start)
            </span>
          </div>

          {/* Divider Handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 flex items-center justify-center pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg font-black text-xs">
              ↔
            </div>
          </div>

          {/* Invisible Range Input over container for smooth mobile drag */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
          />
        </div>
      </div>

      {/* Log Metric Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121927] border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-sm text-white uppercase tracking-wider">
                Log Body Metrics
              </h3>
              <button onClick={() => setShowLogModal(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMetric} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Body Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 76.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Waist (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="81"
                    value={waistCm}
                    onChange={(e) => setWaistCm(e.target.value)}
                    className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Chest (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="103"
                    value={chestCm}
                    onChange={(e) => setChestCm(e.target.value)}
                    className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Arms (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="38"
                    value={armsCm}
                    onChange={(e) => setArmsCm(e.target.value)}
                    className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Body Fat %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="15.5"
                    value={bodyFatPercent}
                    onChange={(e) => setBodyFatPercent(e.target.value)}
                    className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs"
                >
                  {saving ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
