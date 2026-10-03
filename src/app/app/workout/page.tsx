'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Dumbbell,
  Play,
  RotateCcw,
  Clock,
  Flame,
  Calendar,
  Layers,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { formatDate } from '@/lib/business-logic';

export default function WorkoutHubPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/member/workouts')
      .then((r) => r.json())
      .then((d) => setWorkouts(d.workouts || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const templates = [
    {
      id: 'ppl-push',
      name: 'Push Day (Chest, Delts & Triceps)',
      focus: 'Push',
      exercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Dumbbell Lateral Raise', 'Tricep Rope Pushdown'],
    },
    {
      id: 'ppl-pull',
      name: 'Pull Day (Back, Rear Delts & Biceps)',
      focus: 'Pull',
      exercises: ['Conventional Deadlift', 'Lat Pulldown (Wide Grip)', 'Seated Cable Row', 'Barbell Bicep Curl'],
    },
    {
      id: 'ppl-legs',
      name: 'Legs & Core Day (Quads & Glutes)',
      focus: 'Legs',
      exercises: ['Barbell Back Squat', 'Romanian Deadlift (RDL)', 'Leg Press 45-Degree', 'Hanging Leg Raises'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black uppercase text-white tracking-tight">Workout Tracker</h1>
        <p className="text-xs text-slate-400">
          Log sets, weights, and rest timers. Works 100% offline at the gym.
        </p>
      </div>

      {/* Primary Action: Quick Start Empty Workout */}
      <Link
        href="/app/workout/active"
        className="block p-5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl text-slate-950 font-black shadow-xl shadow-emerald-500/25 active:scale-98 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950/20 flex items-center justify-center">
              <Play className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <h3 className="text-base uppercase tracking-tight">Quick Start Blank Session</h3>
              <p className="text-xs font-semibold text-slate-900/80">Add exercises on the fly</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-950" />
        </div>
      </Link>

      {/* Workout Routines & Templates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
            Workout Routines & Splits
          </h2>
          <span className="text-[11px] text-emerald-400 font-bold">Programs</span>
        </div>

        <div className="space-y-2.5">
          {templates.map((tpl) => (
            <Link
              key={tpl.id}
              href={`/app/workout/active?template=${tpl.id}`}
              className="block p-4 rounded-2xl bg-[#121927] border border-slate-800 hover:border-slate-700 transition-all active:scale-98"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {tpl.focus}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                  Start Routine <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h4 className="font-bold text-sm text-white">{tpl.name}</h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                {tpl.exercises.join(' • ')}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Past Completed Workouts */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
          Workout History ({workouts.length})
        </h2>

        {loading ? (
          <div className="py-8 text-center text-slate-500 text-xs">Loading workout history...</div>
        ) : workouts.length === 0 ? (
          <div className="p-6 bg-[#121927] rounded-2xl border border-slate-800 text-center">
            <Dumbbell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No logged workouts yet.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Start your first session today to unlock the First Blood badge!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.map((w) => (
              <div
                key={w.id}
                className="p-4 rounded-2xl bg-[#121927] border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">{w.name}</h4>
                    <p className="text-[11px] text-slate-400">
                      {formatDate(w.createdAt)} • {Math.round(w.durationSeconds / 60)} mins
                    </p>
                  </div>

                  <Link
                    href={`/app/workout/active?repeatWorkoutId=${w.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-bold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Repeat</span>
                  </Link>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                  <span>
                    Volume: <strong className="text-emerald-400 font-bold">{w.totalVolumeKg} kg</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Sets: <strong className="text-white">{w.sets?.length || 0}</strong>
                  </span>
                </div>

                {w.sets && w.sets.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {w.sets.slice(0, 4).map((s: any) => (
                      <span
                        key={s.id}
                        className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400"
                      >
                        {s.exercise?.name}: {s.weightKg}kg × {s.reps}
                      </span>
                    ))}
                    {w.sets.length > 4 && (
                      <span className="text-[10px] text-slate-500 self-center">
                        +{w.sets.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
