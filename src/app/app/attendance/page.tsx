'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  CheckCircle,
  AlertCircle,
  Calendar,
  Flame,
  Camera,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '@/lib/business-logic';

export default function MemberAttendancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [personalQrUrl, setPersonalQrUrl] = useState<string>('');

  // Scan simulation state
  const [scanStatus, setScanStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [scanning, setScanning] = useState(false);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/member/attendance');
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
    fetchAttendance();

    // Generate personal member pass QR (using member code IF-1001)
    QRCode.toDataURL('IF-1001', {
      width: 240,
      margin: 2,
      color: { dark: '#090D16', light: '#FFFFFF' },
    }).then(setPersonalQrUrl);
  }, []);

  // Simulate scanning the gym's live rotating QR
  const handleSimulateScan = async () => {
    setScanning(true);
    setScanStatus(null);

    try {
      // 1. Fetch current rotating QR token from gym
      const tokenRes = await fetch('/api/admin/attendance/qr-rotate');
      const tokenData = await tokenRes.json();

      if (!tokenData.token) {
        setScanStatus({ success: false, message: 'Could not fetch reception QR' });
        setScanning(false);
        return;
      }

      // 2. Submit scanned token to member attendance endpoint
      const checkInRes = await fetch('/api/member/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenData.token }),
      });

      const checkInData = await checkInRes.json();
      setScanning(false);

      if (checkInRes.ok) {
        setScanStatus({
          success: true,
          message: checkInData.message || '✓ Verified! Welcome to Iron Forge Indiranagar.',
        });
        fetchAttendance();
      } else {
        setScanStatus({
          success: false,
          message: checkInData.error || 'Failed to verify QR code',
        });
      }
    } catch {
      setScanning(false);
      setScanStatus({ success: false, message: 'Network connection error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black uppercase text-white tracking-tight">Gym Entry & Check-in</h1>
        <p className="text-xs text-slate-400">
          Scan the rotating QR at the gym front desk or present your personal member pass.
        </p>
      </div>

      {scanStatus && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
            scanStatus.success
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
              : 'bg-red-950/80 border border-red-800 text-red-300'
          }`}
        >
          {scanStatus.success ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="font-semibold">{scanStatus.message}</span>
        </div>
      )}

      {/* Main Check-in CTA Card */}
      <div className="bg-gradient-to-br from-[#121927] to-[#0D1424] border border-slate-800 rounded-3xl p-6 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <Camera className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-tight">
            Scan Front Desk QR
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Point your camera at the live rotating QR on the reception tablet to verify entry.
          </p>
        </div>

        <button
          onClick={handleSimulateScan}
          disabled={scanning}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-98"
        >
          {scanning ? (
            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <QrCode className="w-4 h-4" />
              <span>Scan & Check In Now</span>
            </>
          )}
        </button>
      </div>

      {/* Personal Member Pass (Barcode/QR for front desk scanner) */}
      <div className="bg-[#121927] border border-slate-800 rounded-3xl p-5 shadow-xl text-center space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-400">
            Personal Member Pass
          </span>
          <span className="font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            IF-1001
          </span>
        </div>

        <div className="p-3 bg-white rounded-2xl inline-block shadow-lg my-1">
          {personalQrUrl ? (
            <img src={personalQrUrl} alt="Personal Pass QR" className="w-40 h-40 object-contain mx-auto" />
          ) : (
            <div className="w-40 h-40 flex items-center justify-center text-slate-900 font-bold">
              Loading Pass...
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-400">
          Reception staff can scan your personal pass if tablet scanning is unavailable.
        </p>
      </div>

      {/* Attendance History Log */}
      <div className="bg-[#121927] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Recent Check-in Log
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {data?.totalVisits || 0} Total Visits
          </span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {(data?.attendance || []).map((att: any) => (
            <div
              key={att.id}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-white block">{formatDate(att.checkInTime)}</span>
                <span className="text-[10px] text-slate-500">
                  {att.checkInMethod === 'QR_SCAN' ? '📱 Mobile QR Scan' : '📋 Reception Verified'}
                </span>
              </div>
              <span className="font-mono text-emerald-400 font-semibold">
                {new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
