'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Shield,
  Palette,
  Users,
  Activity,
  Save,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

interface GymProfile {
  gymName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  currency: string;
  timezone: string;
  maxCapacity: number;
  crowdWarningThreshold: number;
}

interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  detailsJson?: string | null;
  user: {
    name: string;
    role: string;
  };
}

export default function AdminSettingsPage() {
  const { accent, setAccent } = useTheme();
  const [profile, setProfile] = useState<GymProfile>({
    gymName: 'Iron Forge Fitness',
    tagline: 'High Performance Strength & Conditioning',
    phone: '+91 98765 43210',
    email: 'contact@ironforgefitness.in',
    address: '42, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
    gstin: '29AAAAA0000A1Z5',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    maxCapacity: 75,
    crowdWarningThreshold: 80,
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings?.gym_profile) {
          setProfile(data.settings.gym_profile);
        }
        if (data.auditLogs) {
          setAuditLogs(data.auditLogs);
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'gym_profile', value: profile }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        fetchSettings();
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Gym Settings</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              System & Brand
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Configure gym business details, floor capacity parameters, theme colors, and audit trail.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-bold animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Settings Forms */}
        <div className="lg:col-span-8 space-y-6">
          {/* Gym Profile Form */}
          <form
            onSubmit={handleSaveProfile}
            className="bg-[#0D1322] border border-slate-800 rounded-2xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Gym Profile & Billing Information</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Printed on Tax Invoices</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Gym Commercial Name</label>
                <input
                  type="text"
                  required
                  value={profile.gymName}
                  onChange={(e) => setProfile({ ...profile, gymName: e.target.value })}
                  className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Tagline</label>
                <input
                  type="text"
                  value={profile.tagline}
                  onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                  className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Official Contact Phone</label>
                <input
                  type="text"
                  required
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Physical Address</label>
              <textarea
                rows={2}
                required
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">GSTIN (18% GST)</label>
                <input
                  type="text"
                  required
                  value={profile.gstin}
                  onChange={(e) => setProfile({ ...profile, gstin: e.target.value })}
                  className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Currency Code</label>
                <input
                  type="text"
                  disabled
                  value="INR (₹)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-400 font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Timezone</label>
                <input
                  type="text"
                  disabled
                  value="Asia/Kolkata (IST)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-400 font-semibold cursor-not-allowed"
                />
              </div>
            </div>

            {/* Capacity Controls */}
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                Floor Crowd Capacity Controls
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Max Simultaneous Floor Limit
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={profile.maxCapacity}
                    onChange={(e) =>
                      setProfile({ ...profile, maxCapacity: parseInt(e.target.value) || 75 })
                    }
                    className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Calculates the real-time crowd meter</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    High Crowd Alert Threshold (%)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={profile.crowdWarningThreshold}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        crowdWarningThreshold: parseInt(e.target.value) || 80,
                      })
                    }
                    className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Shows &ldquo;Peak Hours&rdquo; badge in app</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>

          {/* Theme & Brand Palette */}
          <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Palette className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">App Accent Theme</h3>
            </div>

            <p className="text-xs text-slate-400">
              Configure the primary energetic accent color used across buttons, progress rings, and brand highlights.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => setAccent('emerald')}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all ${
                  accent === 'emerald'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold">Electric Emerald (Default)</span>
              </button>

              <button
                onClick={() => setAccent('orange')}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all ${
                  accent === 'orange'
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400 shadow-md shadow-orange-500/20'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-orange-500" />
                <span className="text-xs font-bold">Blaze Orange</span>
              </button>

              <button
                onClick={() => setAccent('crimson')}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all ${
                  accent === 'crimson'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-400 shadow-md shadow-rose-500/20'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500" />
                <span className="text-xs font-bold">Iron Crimson</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: RBAC Info & Audit Logs */}
        <div className="lg:col-span-4 space-y-6">
          {/* RBAC Overview Card */}
          <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Shield className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Staff Roles & Permissions</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="font-bold text-emerald-400">OWNER</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Full control: financial reports, member deletions, plan pricing, system settings.
                </div>
              </div>

              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="font-bold text-blue-400">MANAGER</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Staff supervision, membership plans, lead conversions, expense tracking.
                </div>
              </div>

              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="font-bold text-purple-400">TRAINER</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Member workout logs, diet templates, class scheduling, attendance viewing.
                </div>
              </div>

              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="font-bold text-amber-400">RECEPTIONIST</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Manual check-ins, payment collection & PDF receipts, leads CRM.
                </div>
              </div>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Audit Trail</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Live Logs</span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No audit logs recorded</p>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px]">{log.action}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(log.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>By: {log.user.name}</span>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase">
                        {log.user.role}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
