'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Dumbbell,
  Info,
  X,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('ALL');
  const [selectedEquipment, setSelectedEquipment] = useState('ALL');
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);

  const muscleGroups = ['ALL', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];
  const equipmentTypes = ['ALL', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight'];

  useEffect(() => {
    const q = new URLSearchParams();
    if (search) q.append('search', search);
    if (selectedMuscle !== 'ALL') q.append('muscleGroup', selectedMuscle);
    if (selectedEquipment !== 'ALL') q.append('equipment', selectedEquipment);

    fetch(`/api/member/exercises?${q.toString()}`)
      .then((r) => r.json())
      .then((d) => setExercises(d.exercises || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, selectedMuscle, selectedEquipment]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black uppercase text-white tracking-tight">Exercise Library</h1>
        <p className="text-xs text-slate-400">
          Over 100+ exercises with technique instructions, tips & muscle targets.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by exercise or muscle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#121927] border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-md"
        />
      </div>

      {/* Muscle Group Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {muscleGroups.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMuscle(m)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
              selectedMuscle === m
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Equipment Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {equipmentTypes.map((eq) => (
          <button
            key={eq}
            onClick={() => setSelectedEquipment(eq)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold shrink-0 border transition-colors ${
              selectedEquipment === eq
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/40'
                : 'border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {eq}
          </button>
        ))}
      </div>

      {/* Exercises List */}
      <div className="space-y-2 pt-1">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading exercise library...</div>
        ) : exercises.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">No matching exercises found.</div>
        ) : (
          exercises.map((ex) => (
            <button
              key={ex.id}
              onClick={() => setSelectedExercise(ex)}
              className="w-full p-3.5 rounded-2xl bg-[#121927] border border-slate-800/80 hover:border-slate-700 text-left flex items-center justify-between transition-all active:scale-98 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
                    {ex.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    <span className="text-emerald-400 font-semibold">{ex.muscleGroup}</span> • {ex.equipment} • {ex.difficulty}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </button>
          ))
        )}
      </div>

      {/* Exercise Details Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121927] border border-slate-800 rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  {selectedExercise.muscleGroup}
                </span>
                <h3 className="font-black text-lg text-white mt-1">{selectedExercise.name}</h3>
              </div>
              <button
                onClick={() => setSelectedExercise(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Equipment</span>
                  <span className="font-bold text-white">{selectedExercise.equipment}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Difficulty</span>
                  <span className="font-bold text-emerald-400">{selectedExercise.difficulty}</span>
                </div>
              </div>

              {selectedExercise.secondaryMuscles && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Secondary Muscles
                  </span>
                  <p className="text-slate-300 font-semibold">{selectedExercise.secondaryMuscles}</p>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  How To Perform
                </span>
                <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  {selectedExercise.instructions}
                </p>
              </div>

              {selectedExercise.tips && (
                <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-amber-200">
                  <strong className="block text-[10px] uppercase tracking-wider text-amber-400 mb-1">
                    💡 Form & Safety Tip
                  </strong>
                  <p className="leading-relaxed">{selectedExercise.tips}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedExercise(null)}
              className="w-full mt-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
