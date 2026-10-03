'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useTheme } from '../theme/ThemeProvider';
import { Shield, Sun, Moon, Palette, ChevronDown, Check } from 'lucide-react';

export default function DemoBar() {
  const { user, switchDemoRole } = useAuth();
  const { mode, toggleMode, accent, setAccent } = useTheme();
  const [showAccentPicker, setShowAccentPicker] = useState(false);

  const roles = [
    { key: 'OWNER', label: '👑 Owner (Raghav)', color: 'text-amber-400' },
    { key: 'MANAGER', label: '💼 Manager (Aman)', color: 'text-blue-400' },
    { key: 'TRAINER', label: '🏋️ Trainer (Vikram)', color: 'text-emerald-400' },
    { key: 'RECEPTIONIST', label: '📋 Reception (Neha)', color: 'text-purple-400' },
    { key: 'MEMBER', label: '📱 Member (Arjun)', color: 'text-cyan-400' },
  ];

  return (
    <aside aria-label="Demo Bar" className="bg-slate-950/95 border-b border-slate-800/80 px-3 py-1.5 text-xs text-slate-300 flex items-center justify-between gap-2 overflow-x-auto z-50 sticky top-0 backdrop-blur-md">
      <div className="flex items-center gap-2 shrink-0">
        <span className="flex items-center gap-1 font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
          <Shield className="w-3 h-3" /> Demo Mode
        </span>
        <span className="hidden sm:inline text-slate-400">Current:</span>
        <span className="font-semibold text-white bg-slate-800 px-2 py-0.5 rounded">
          {user ? `${user.name} (${user.role})` : 'Guest'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <span className="hidden md:inline text-slate-500">Switch Role:</span>
        {roles.map((r) => (
          <button
            key={r.key}
            onClick={() => switchDemoRole(r.key)}
            className={`px-2 py-0.5 rounded transition-all font-medium text-[11px] ${
              user?.role === r.key
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-850 hover:bg-slate-800 text-slate-300'
            }`}
          >
            {r.label.split(' ')[0]} {r.key}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Theme mode toggle */}
        <button
          onClick={toggleMode}
          className="p-1 text-slate-400 hover:text-white rounded bg-slate-900 border border-slate-800"
          title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {mode === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
        </button>

        {/* Accent Color Picker */}
        <div className="relative">
          <button
            onClick={() => setShowAccentPicker(!showAccentPicker)}
            className="p-1 text-slate-400 hover:text-white rounded bg-slate-900 border border-slate-800 flex items-center gap-1"
            title="Switch Gym Accent Theme"
          >
            <Palette className="w-3.5 h-3.5 text-emerald-400" />
            <ChevronDown className="w-2.5 h-2.5" />
          </button>

          {showAccentPicker && (
            <div className="absolute right-0 mt-1 w-36 bg-slate-900 border border-slate-800 rounded-lg p-2 shadow-xl z-50 flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase px-1">Accent Theme</span>
              <button
                onClick={() => { setAccent('emerald'); setShowAccentPicker(false); }}
                className="flex items-center justify-between text-[11px] px-2 py-1 rounded hover:bg-slate-800 text-emerald-400"
              >
                <span>Electric Emerald</span>
                {accent === 'emerald' && <Check className="w-3 h-3" />}
              </button>
              <button
                onClick={() => { setAccent('orange'); setShowAccentPicker(false); }}
                className="flex items-center justify-between text-[11px] px-2 py-1 rounded hover:bg-slate-800 text-amber-400"
              >
                <span>Energy Flame</span>
                {accent === 'orange' && <Check className="w-3 h-3" />}
              </button>
              <button
                onClick={() => { setAccent('crimson'); setShowAccentPicker(false); }}
                className="flex items-center justify-between text-[11px] px-2 py-1 rounded hover:bg-slate-800 text-red-400"
              >
                <span>Crimson Iron</span>
                {accent === 'crimson' && <Check className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
