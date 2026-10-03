'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Users,
  Search,
  CheckCircle,
  Clock,
  Maximize2,
  RefreshCw,
  Phone,
  Send,
  Flame,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { formatDate } from '@/lib/business-logic';

export default function AdminAttendancePage() {
  const [qrToken, setQrToken] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [kioskMode, setKioskMode] = useState<boolean>(false);

  // Manual Check-in state
  const [memberCodeInput, setMemberCodeInput] = useState('');
  const [manualMsg, setManualMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Today logs and absentees
  const [todayLogs, setTodayLogs] = useState<any[]>([]);
  const [absentees, setAbsentees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      const res = await fetch('/api/admin/attendance');
      if (res.ok) {
        const d = await res.json();
        setTodayLogs(d.logs || []);
        setAbsentees(d.absentees || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchQrToken = async () => {
    try {
      const res = await fetch('/api/admin/attendance/qr-rotate');
      if (res.ok) {
        const d = await res.json();
        setQrToken(d.token);
        setSecondsRemaining(d.secondsRemaining || 30);

        // Generate QR code data URL
        const dataUrl = await QRCode.toDataURL(d.token, {
          width: 320,
          margin: 2,
          color: {
            dark: '#090D16',
            light: '#FFFFFF',
          },
        });
        setQrDataUrl(dataUrl);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Initial fetch & 30s token rotation timer
  useEffect(() => {
    fetchAttendance();
    fetchQrToken();

    const qrInterval = setInterval(() => {
      fetchQrToken();
    }, 15000); // Poll and rotate reliably

    const countdownTimer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : 30));
    }, 1000);

    return () => {
      clearInterval(qrInterval);
      clearInterval(countdownTimer);
    };
  }, []);

  const handleManualAction = async (action: 'CHECK_IN' | 'CHECK_OUT') => {
    if (!memberCodeInput.trim()) return;
    setManualMsg(null);

    try {
      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberCode: memberCodeInput.trim(), action }),
      });
      const data = await res.json();
      if (res.ok) {
        setManualMsg({
          text: data.message || `✓ Success: ${data.member?.name} checked in!`,
        });
        setMemberCodeInput('');
        fetchAttendance();
      } else {
        setManualMsg({ text: data.error || 'Action failed', error: true });
      }
    } catch {
      setManualMsg({ text: 'Network error', error: true });
    }
  };

  const getAbsenteeWhatsAppLink = (m: any) => {
    const text = encodeURIComponent(
      `Hey ${m.name}! We noticed you haven't visited Iron Forge in ${m.daysMissed} days. Your workout routine misses you! Hit the gym today and keep your fitness journey going strong. Let us know if you need anything!`
    );
    return `https://wa.me/91${m.phone}?text=${text}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase text-white tracking-tight">
            Attendance & QR Check-in
          </h1>
          <p className="text-xs text-slate-400">
            Rotating dynamic QR screen for the reception desk, manual check-in, and absentee retention alerts.
          </p>
        </div>

        <button
          onClick={() => setKioskMode(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95"
        >
          <Maximize2 className="w-4 h-4" />
          <span>Launch Fullscreen Kiosk Mode</span>
        </button>
      </div>

      {/* Main Grid: QR Kiosk Card & Manual Desk Check-in */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reception Tablet QR Card (Left) */}
        <div className="lg:col-span-5 bg-[#121927] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Dynamic Anti-Fraud QR
            </span>
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              Rotates in {secondsRemaining}s
            </span>
          </div>

          {/* QR Code Graphic */}
          <div className="relative p-4 bg-white rounded-2xl shadow-2xl my-2 border-4 border-emerald-500/30">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Reception Entry QR"
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-slate-900 font-bold">
                Generating QR...
              </div>
            )}
            <div className="absolute inset-x-0 bottom-1 flex justify-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 bg-slate-100 px-2 py-0.5 rounded shadow">
                IRON FORGE • INDIRANAGAR
              </span>
            </div>
          </div>

          {/* Rotation timer bar */}
          <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-3 mb-4">
            <div
              className="h-full bg-emerald-500 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${(secondsRemaining / 30) * 100}%` }}
            />
          </div>

          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Members scan this QR using their member app upon entering the gym. The QR rotates continuously to prevent sharing screenshots.
          </p>

          <button
            onClick={() => setKioskMode(true)}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Tablet Stand Mode</span>
          </button>
        </div>

        {/* Manual Desk Check-in & Search (Right) */}
        <div className="lg:col-span-7 bg-[#121927] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <QrCode className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base text-white uppercase tracking-wider">
                Front Desk Rapid Check-in
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Manually verify member entry if a member forgot their smartphone or requests reception assistance.
            </p>

            {manualMsg && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
                  manualMsg.error
                    ? 'bg-red-950/80 border border-red-800 text-red-300'
                    : 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                }`}
              >
                {manualMsg.error ? (
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <span>{manualMsg.text}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Member ID or Phone Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. IF-1001) or phone (e.g. 9811122331)"
                    value={memberCodeInput}
                    onChange={(e) => setMemberCodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleManualAction('CHECK_IN');
                    }}
                    className="flex-1 bg-[#0A0E1A] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase font-mono tracking-wider"
                  />
                  <button
                    onClick={() => handleManualAction('CHECK_IN')}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                  >
                    Check In
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                <span>Quick Shortcuts:</span>
                <button
                  type="button"
                  onClick={() => setMemberCodeInput('IF-1001')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px]"
                >
                  IF-1001 (Arjun)
                </button>
                <button
                  type="button"
                  onClick={() => setMemberCodeInput('IF-1002')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px]"
                >
                  IF-1002 (Rohan)
                </button>
              </div>
            </div>
          </div>

          {/* Quick instructions */}
          <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Entry logs auto-update member streak and last workout stats.</span>
            <span className="text-emerald-400 font-semibold">{todayLogs.length} Checked In Today</span>
          </div>
        </div>
      </div>

      {/* Today Check-in Timeline & Absentee List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Check-ins */}
        <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Today&apos;s Entry Log ({todayLogs.length})
            </h3>
            <button
              onClick={fetchAttendance}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {todayLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No check-ins recorded yet today.</p>
            ) : (
              todayLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400">
                      {log.member?.user?.name?.charAt(0) || 'M'}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-white">{log.member?.user?.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {log.member?.memberCode} • {log.checkInMethod === 'QR_SCAN' ? 'Mobile QR' : 'Desk Verified'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {log.checkOutTime ? (
                      <span className="block text-[10px] text-slate-400">
                        Out: {new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      <span className="block text-[10px] text-emerald-400">Inside Gym</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Absentee Retention List */}
        <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                Absentee Alerts (7+ Days Inactive)
              </h3>
              <p className="text-[11px] text-slate-400">Active members at risk of churning</p>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
              {absentees.length} Members
            </span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {absentees.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Great news! All active members have attended recently.</p>
            ) : (
              absentees.map((m) => (
                <div
                  key={m.memberId}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs text-white">{m.name}</p>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1 rounded">
                        {m.memberCode}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-400 font-medium mt-0.5">
                      Missed {m.daysMissed} days • Last seen: {m.lastSeen ? formatDate(m.lastSeen) : 'Never'}
                    </p>
                  </div>

                  <a
                    href={getAbsenteeWhatsAppLink(m)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-semibold transition-colors"
                    title="Send WhatsApp 'We Miss You' reminder"
                  >
                    <Send className="w-3 h-3 text-emerald-400" />
                    <span>Nudge</span>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* FULLSCREEN RECEPTION TABLET KIOSK MODAL */}
      {kioskMode && (
        <div className="fixed inset-0 z-50 bg-[#090D16] flex flex-col justify-between p-8 text-center text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
                IF
              </div>
              <div className="text-left">
                <h2 className="text-lg font-black uppercase tracking-wider">IRON FORGE FITNESS</h2>
                <p className="text-xs text-emerald-400">Reception Check-in Station</p>
              </div>
            </div>

            <button
              onClick={() => setKioskMode(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
            >
              Exit Kiosk
            </button>
          </div>

          <div className="flex flex-col items-center justify-center my-auto">
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-2">
              Scan to Check In
            </h1>
            <p className="text-slate-400 text-sm mb-6 max-w-md">
              Open your Iron Forge PWA Member App on your phone and tap &quot;Check-in QR&quot; to scan.
            </p>

            <div className="p-6 bg-white rounded-3xl shadow-2xl border-8 border-emerald-500/20">
              {qrDataUrl && (
                <img src={qrDataUrl} alt="Kiosk QR" className="w-72 h-72 sm:w-80 sm:h-80 object-contain" />
              )}
            </div>

            <div className="w-80 h-2 bg-slate-800 rounded-full overflow-hidden mt-6 mb-2">
              <div
                className="h-full bg-emerald-500 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(secondsRemaining / 30) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Auto-rotating in {secondsRemaining} seconds
            </p>
          </div>

          <div className="text-xs text-slate-500">
            Powered by Iron Forge PWA • Indiranagar Branch
          </div>
        </div>
      )}
    </div>
  );
}
