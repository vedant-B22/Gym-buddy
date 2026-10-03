'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';

export default function MemberClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

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

  const handleToggleBooking = async (classItem: any) => {
    setStatusMsg(null);
    const action = classItem.isBookedByMe ? 'CANCEL_SLOT' : 'BOOK_SLOT';

    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, classId: classItem.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ text: data.message });
        fetchClasses();
      } else {
        setStatusMsg({ text: data.error || 'Failed to update booking', error: true });
      }
    } catch {
      setStatusMsg({ text: 'Network connection error', error: true });
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black uppercase text-white tracking-tight">Classes & Timetable</h1>
        <p className="text-xs text-slate-400">
          Book your studio spots for Zumba, HIIT, Power Yoga, and Strength sessions.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
            statusMsg.error
              ? 'bg-red-950/80 border border-red-800 text-red-300'
              : 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
          }`}
        >
          {statusMsg.error ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Day Selector Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
              selectedDay === d
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Class Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading classes...</div>
        ) : classes.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">No classes scheduled on this day.</div>
        ) : (
          classes.map((c) => (
            <div
              key={c.id}
              className={`p-4 rounded-3xl bg-[#121927] border transition-all ${
                c.isBookedByMe
                  ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: c.color || '#10B981' }}
                >
                  {c.dayOfWeek}
                </span>

                <span className="text-xs font-mono font-bold text-white flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> {c.startTime} - {c.endTime}
                </span>
              </div>

              <h3 className="font-black text-base text-white">{c.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{c.description}</p>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-xs">
                <div>
                  <p className="text-slate-300 font-semibold">{c.trainer?.name || 'Coach'}</p>
                  <p className="text-[10px] text-slate-500">{c.room}</p>
                </div>

                <div className="text-right">
                  <span className={`text-[11px] font-bold block ${c.isFull ? 'text-red-400' : 'text-emerald-400'}`}>
                    {c.spotsLeft} spots left
                  </span>
                  <span className="text-[10px] text-slate-500">{c.capacity} max</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-3 pt-2">
                {c.isBookedByMe ? (
                  <button
                    onClick={() => handleToggleBooking(c)}
                    className="w-full py-2.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/60 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel My Booking
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleBooking(c)}
                    disabled={c.isFull}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 active:scale-98"
                  >
                    {c.isFull ? 'Class Full (Join Waitlist)' : 'Book Free Slot'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
