'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  Plus,
  Trash2,
  Check,
  Clock,
  Dumbbell,
  Search,
  X,
  Volume2,
  Trophy,
  ArrowRight,
  Flame,
  AlertCircle,
} from 'lucide-react';
import { saveWorkoutOffline, playRestTimerBeep } from '@/lib/offline-db';

interface ActiveSet {
  setNumber: number;
  weightKg: number | string;
  reps: number | string;
  rpe?: number | string;
  isWarmup: boolean;
  isDropSet: boolean;
  isCompleted: boolean;
  prevWeight?: number;
  prevReps?: number;
}

interface ActiveExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  sets: ActiveSet[];
}

function ActiveWorkoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const template = searchParams.get('template');

  // Workout state
  const [workoutName, setWorkoutName] = useState('Push Day');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Exercises in current workout
  const [exercises, setExercises] = useState<ActiveExercise[]>([]);

  // Rest Timer State
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number | null>(null);
  const [restDuration, setRestDuration] = useState(90);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Exercise Search Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [allExercises, setAllExercises] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('ALL');

  // Finish Workout Modal & PR celebration
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [finishedPrs, setFinishedPrs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Initial Exercise Setup
  useEffect(() => {
    fetch('/api/member/exercises')
      .then((r) => r.json())
      .then((d) => {
        if (d.exercises) setAllExercises(d.exercises);
      })
      .catch(console.error);

    if (template === 'ppl-pull') {
      setWorkoutName('Pull Day (Back & Biceps)');
      setExercises([
        {
          exerciseId: 'deadlift-seed',
          exerciseName: 'Conventional Deadlift',
          muscleGroup: 'Back',
          sets: [
            { setNumber: 1, weightKg: 100, reps: 5, isWarmup: false, isDropSet: false, isCompleted: false, prevWeight: 95, prevReps: 5 },
            { setNumber: 2, weightKg: 120, reps: 5, isWarmup: false, isDropSet: false, isCompleted: false, prevWeight: 110, prevReps: 5 },
            { setNumber: 3, weightKg: 140, reps: 4, isWarmup: false, isDropSet: false, isCompleted: false, prevWeight: 135, prevReps: 4 },
          ],
        },
        {
          exerciseId: 'lat-seed',
          exerciseName: 'Lat Pulldown (Wide Grip)',
          muscleGroup: 'Back',
          sets: [
            { setNumber: 1, weightKg: 55, reps: 10, isWarmup: false, isDropSet: false, isCompleted: false, prevWeight: 50, prevReps: 10 },
            { setNumber: 2, weightKg: 60, reps: 10, isWarmup: false, isDropSet: false, isCompleted: false, prevWeight: 55, prevReps: 10 },
          ],
        },
      ]);
    } else if (template === 'ppl-legs') {
      setWorkoutName('Legs & Core Day');
      setExercises([
        {
          exerciseId: 'squat-seed',
          exerciseName: 'Barbell Back Squat',
          muscleGroup: 'Legs',
          sets: [
            { setNumber: 1, weightKg: 80, reps: 8, isWarmup: false, isDropSet: false, isCompleted: false, prevWeight: 75, prevReps: 8 },
            { setNumber: 2, weightKg: 100, reps: 6, isWarmup: false, isDropSet: false, isCompleted: false, prevWeight: 95, prevReps: 6 },
          ],
        },
      ]);
    } else {
      setWorkoutName('Push Day (Chest & Shoulders)');
      setExercises([
        {
          exerciseId: 'bench-seed',
          exerciseName: 'Barbell Bench Press',
          muscleGroup: 'Chest',
          sets: [
            { setNumber: 1, weightKg: 60, reps: 10, isWarmup: true, isDropSet: false, isCompleted: false, prevWeight: 60, prevReps: 10 },
            { setNumber: 2, weightKg: 80, reps: 8, isWarmup: false, isDropSet: false, isCompleted: false, prevWeight: 75, prevReps: 8 },
            { setNumber: 3, weightKg: 90, reps: 6, isWarmup: false, isDropSet: false, isCompleted: false, prevWeight: 85, prevReps: 6 },
          ],
        },
        {
          exerciseId: 'incline-seed',
          exerciseName: 'Incline Dumbbell Press',
          muscleGroup: 'Chest',
          sets: [
            { setNumber: 1, weightKg: 26, reps: 10, isWarmup: false, isDropSet: false, isCompleted: false, prevWeight: 24, prevReps: 10 },
            { setNumber: 2, weightKg: 28, reps: 8, isWarmup: false, isDropSet: false, isCompleted: false, prevWeight: 26, prevReps: 8 },
          ],
        },
      ]);
    }
  }, [template]);

  // Stopwatch timer
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Rest Timer countdown
  useEffect(() => {
    if (restSecondsRemaining !== null && restSecondsRemaining > 0) {
      restTimerRef.current = setTimeout(() => {
        setRestSecondsRemaining(restSecondsRemaining - 1);
      }, 1000);
    } else if (restSecondsRemaining === 0) {
      playRestTimerBeep();
      setRestSecondsRemaining(null);
    }
    return () => {
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
    };
  }, [restSecondsRemaining]);

  const formatStopwatch = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleSetComplete = (exIdx: number, setIdx: number) => {
    const updated = [...exercises];
    const currentSet = updated[exIdx].sets[setIdx];
    const nextCompleted = !currentSet.isCompleted;
    currentSet.isCompleted = nextCompleted;
    setExercises(updated);

    if (nextCompleted) {
      setRestSecondsRemaining(restDuration);
    }
  };

  const handleUpdateSet = (exIdx: number, setIdx: number, field: keyof ActiveSet, value: any) => {
    const updated = [...exercises];
    (updated[exIdx].sets[setIdx] as any)[field] = value;
    setExercises(updated);
  };

  const handleAddSet = (exIdx: number) => {
    const updated = [...exercises];
    const currentSets = updated[exIdx].sets;
    const lastSet = currentSets[currentSets.length - 1];

    currentSets.push({
      setNumber: currentSets.length + 1,
      weightKg: lastSet ? lastSet.weightKg : 50,
      reps: lastSet ? lastSet.reps : 10,
      isWarmup: false,
      isDropSet: false,
      isCompleted: false,
      prevWeight: lastSet ? Number(lastSet.weightKg) : 50,
      prevReps: lastSet ? Number(lastSet.reps) : 10,
    });
    setExercises(updated);
  };

  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    const updated = [...exercises];
    updated[exIdx].sets.splice(setIdx, 1);
    updated[exIdx].sets.forEach((s, idx) => {
      s.setNumber = idx + 1;
    });
    setExercises(updated);
  };

  const handleRemoveExercise = (exIdx: number) => {
    const updated = [...exercises];
    updated.splice(exIdx, 1);
    setExercises(updated);
  };

  const handleAddExerciseFromModal = (ex: any) => {
    setExercises([
      ...exercises,
      {
        exerciseId: ex.id,
        exerciseName: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: [
          { setNumber: 1, weightKg: 20, reps: 10, isWarmup: false, isDropSet: false, isCompleted: false },
          { setNumber: 2, weightKg: 20, reps: 10, isWarmup: false, isDropSet: false, isCompleted: false },
          { setNumber: 3, weightKg: 20, reps: 10, isWarmup: false, isDropSet: false, isCompleted: false },
        ],
      },
    ]);
    setShowAddModal(false);
  };

  const handleFinishWorkout = async () => {
    setSaving(true);

    const flattenedSets: any[] = [];
    exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        flattenedSets.push({
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          setNumber: s.setNumber,
          weightKg: parseFloat(s.weightKg as string) || 0,
          reps: parseInt(s.reps as string, 10) || 0,
          rpe: s.rpe ? parseFloat(s.rpe as string) : null,
          isWarmup: s.isWarmup,
          isDropSet: s.isDropSet,
          isCompleted: s.isCompleted,
        });
      });
    });

    const payload = {
      name: workoutName,
      durationSeconds: elapsedSeconds,
      sets: flattenedSets,
    };

    if (typeof window !== 'undefined' && !navigator.onLine) {
      await saveWorkoutOffline(payload);
      setSaving(false);
      alert('Workout saved locally on your device! It will auto-sync when you reconnect to Wi-Fi/4G.');
      router.push('/app/workout');
      return;
    }

    try {
      const res = await fetch('/api/member/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setSaving(false);

      if (data.newPrs && data.newPrs.length > 0) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
        setFinishedPrs(data.newPrs);
        setFinishModalOpen(true);
      } else {
        router.push('/app/workout');
      }
    } catch {
      await saveWorkoutOffline(payload);
      setSaving(false);
      router.push('/app/workout');
    }
  };

  const filteredModalExercises = allExercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'ALL' || ex.muscleGroup === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="space-y-5 pb-20">
      {/* Sticky Top Workout Control Bar */}
      <div className="sticky top-[52px] z-30 bg-[#0D1322]/95 backdrop-blur-md -mx-4 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            className="bg-transparent font-black text-sm text-white focus:outline-none border-b border-transparent focus:border-emerald-500 max-w-[180px] sm:max-w-xs truncate"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatStopwatch(elapsedSeconds)}</span>
          </div>

          <button
            onClick={handleFinishWorkout}
            disabled={saving}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            {saving ? 'Saving...' : 'Finish'}
          </button>
        </div>
      </div>

      {/* Floating Rest Timer */}
      {restSecondsRemaining !== null && (
        <div className="p-3 bg-gradient-to-r from-slate-900 to-slate-850 border border-emerald-500/40 rounded-2xl shadow-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Rest Timer
              </span>
              <span className="text-base font-black text-emerald-400 font-mono">
                {restSecondsRemaining}s remaining
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setRestSecondsRemaining((prev) => (prev ? prev + 30 : 30))}
              className="px-2 py-1 bg-slate-800 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-700"
            >
              +30s
            </button>
            <button
              onClick={() => setRestSecondsRemaining(null)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg border border-slate-700"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Exercise Cards */}
      <div className="space-y-4">
        {exercises.map((ex, exIdx) => (
          <div
            key={ex.exerciseId + exIdx}
            className="bg-[#121927] border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-white">{ex.exerciseName}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  {ex.muscleGroup}
                </span>
              </div>

              <button
                onClick={() => handleRemoveExercise(exIdx)}
                className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800 pb-1">
                  <tr>
                    <th className="w-8 py-1">Set</th>
                    <th className="w-16 py-1">Prev</th>
                    <th className="py-1">Kg</th>
                    <th className="py-1">Reps</th>
                    <th className="w-10 py-1 text-center">✓</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {ex.sets.map((s, setIdx) => (
                    <tr
                      key={setIdx}
                      className={`transition-colors ${
                        s.isCompleted ? 'bg-emerald-950/20' : ''
                      }`}
                    >
                      <td className="py-2.5 text-slate-400 font-bold font-mono">
                        {s.setNumber}
                      </td>

                      <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                        {s.prevWeight ? `${s.prevWeight}×${s.prevReps}` : '—'}
                      </td>

                      <td className="py-2.5 pr-2">
                        <div className="flex items-center bg-[#0A0E1A] border border-slate-700 rounded-xl overflow-hidden">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateSet(
                                exIdx,
                                setIdx,
                                'weightKg',
                                Math.max(0, Number(s.weightKg) - 2.5)
                              )
                            }
                            className="px-2 py-1 text-slate-400 hover:text-white font-bold"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            step="0.5"
                            value={s.weightKg}
                            onChange={(e) =>
                              handleUpdateSet(exIdx, setIdx, 'weightKg', e.target.value)
                            }
                            className="w-12 bg-transparent text-center text-xs font-bold text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateSet(
                                exIdx,
                                setIdx,
                                'weightKg',
                                Number(s.weightKg) + 2.5
                              )
                            }
                            className="px-2 py-1 text-slate-400 hover:text-white font-bold"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="py-2.5 pr-2">
                        <div className="flex items-center bg-[#0A0E1A] border border-slate-700 rounded-xl overflow-hidden">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateSet(
                                exIdx,
                                setIdx,
                                'reps',
                                Math.max(0, Number(s.reps) - 1)
                              )
                            }
                            className="px-2 py-1 text-slate-400 hover:text-white font-bold"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={s.reps}
                            onChange={(e) =>
                              handleUpdateSet(exIdx, setIdx, 'reps', e.target.value)
                            }
                            className="w-10 bg-transparent text-center text-xs font-bold text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateSet(
                                exIdx,
                                setIdx,
                                'reps',
                                Number(s.reps) + 1
                              )
                            }
                            className="px-2 py-1 text-slate-400 hover:text-white font-bold"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSetComplete(exIdx, setIdx)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                            s.isCompleted
                              ? 'bg-emerald-500 text-slate-950 font-bold scale-105 shadow-md shadow-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={() => handleAddSet(exIdx)}
              className="w-full py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Set</span>
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="w-full py-3.5 bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-dashed border-emerald-500/40 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98"
      >
        <Plus className="w-4 h-4" />
        <span>Add Exercise</span>
      </button>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121927] border border-slate-800 rounded-3xl w-full max-w-md h-[80vh] flex flex-col p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-sm text-white uppercase tracking-wider">
                Select Exercise
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative my-3">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search Bench, Squat, Lat Pulldown..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {['ALL', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'].map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMuscle(m)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-colors ${
                    selectedMuscle === m
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 mt-2 pr-1">
              {filteredModalExercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => handleAddExerciseFromModal(ex)}
                  className="w-full p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between transition-colors group"
                >
                  <div>
                    <h4 className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
                      {ex.name}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {ex.muscleGroup} • {ex.equipment}
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PR Modal */}
      {finishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 text-center">
          <div className="bg-[#121927] border border-emerald-500/40 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-pr-celebrate">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-lg shadow-amber-500/20">
              <Trophy className="w-8 h-8 animate-bounce" />
            </div>

            <h3 className="text-xl font-black text-white uppercase tracking-tight">
              NEW PERSONAL RECORD!
            </h3>
            <p className="text-xs text-slate-300 mt-1 mb-4">
              You pushed your limits today! Check out your new PRs:
            </p>

            <div className="space-y-2 mb-6">
              {finishedPrs.map((pr, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-900 border border-amber-500/30 rounded-2xl flex items-center justify-between"
                >
                  <span className="font-bold text-xs text-white text-left">{pr.exerciseName}</span>
                  <span className="font-black text-sm text-amber-400">{pr.value} kg</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/app/workout')}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
            >
              Continue to Workout Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ActiveWorkoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
          Initializing workout session...
        </div>
      }
    >
      <ActiveWorkoutContent />
    </Suspense>
  );
}
