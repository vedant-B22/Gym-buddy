'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Users,
  Clock,
  MapPin,
  CheckCircle,
  X,
  AlertCircle,
} from 'lucide-react';

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: 'Power Yoga & Mobility',
    description: 'Deep stretching, core decompression and balance for lifters.',
    trainerId: '',
    dayOfWeek: 'Monday',
    startTime: '07:00',
    endTime: '08:00',
    capacity: '20',
    room: 'Studio 1 (Mirror Deck)',
    color: '#10B981',
  });

  const days = ['ALL', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/classes?day=${selectedDay}`);
      if (res.ok) {
        const d = await res.json();
        setClasses(d.classes || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [selectedDay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        fetchClasses();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase text-white tracking-tight">
            Group Classes & Scheduling
          </h1>
          <p className="text-xs text-slate-400">
            Manage studio timetable, capacity limits, trainer assignments, and booking waitlists.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Class</span>
        </button>
      </div>

      {/* Day Selector Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
              selectedDay === d
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                : 'bg-[#121927] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-500 text-xs">
            Loading class timetable...
          </div>
        ) : classes.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-slate-500 text-xs">
            No classes scheduled for {selectedDay}. Click &quot;Schedule New Class&quot; above to create one.
          </div>
        ) : (
          classes.map((c) => (
            <div
              key={c.id}
              className="bg-[#121927] border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: c.color || '#10B981' }}
                  >
                    {c.dayOfWeek}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {c.startTime} - {c.endTime}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white">{c.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Users className="w-3.5 h-3.5 text-slate-500" /> Trainer:
                    </span>
                    <strong className="text-white">{c.trainer?.name || 'Assigned Staff'}</strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> Room / Area:
                    </span>
                    <span>{c.room}</span>
                  </div>
                </div>
              </div>

              {/* Bookings Capacity Bar */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-slate-400">Booked Seats</span>
                  <span className="font-bold text-emerald-400">
                    {c.bookedCount} / {c.capacity} spots ({c.spotsLeft} remaining)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (c.bookedCount / c.capacity) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Class Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121927] border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-sm text-white uppercase tracking-wider">
                Schedule Gym Class
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Class Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HIIT Bootcamp"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Day of Week
                  </label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {days.filter((d) => d !== 'ALL').map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Capacity (Seats)
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Studio / Room
                </label>
                <input
                  type="text"
                  placeholder="Studio 1 / Turf Deck"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Schedule Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
