'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, UserPlus, CreditCard, QrCode } from 'lucide-react';
import { formatINR, formatDate } from '@/lib/business-logic';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// 1. ADD MEMBER MODAL
export function AddMemberModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'Male',
    fitnessGoal: 'Muscle Gain',
    dob: '1998-01-01',
    heightCm: '',
    weightKg: '',
    emergencyName: '',
    emergencyPhone: '',
    healthNotes: '',
    planId: '',
    paymentMode: 'UPI',
    amountPaid: '',
    discountAmount: '0',
    referenceId: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetch('/api/admin/plans')
        .then((r) => r.json())
        .then((d) => {
          if (d.plans) {
            setPlans(d.plans);
            if (d.plans.length > 0 && !formData.planId) {
              setFormData((prev) => ({
                ...prev,
                planId: d.plans[0].id,
                amountPaid: d.plans[0].price.toString(),
              }));
            }
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePlanChange = (planId: string) => {
    const selected = plans.find((p) => p.id === planId);
    setFormData((prev) => ({
      ...prev,
      planId,
      amountPaid: selected ? selected.price.toString() : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create member');
        setLoading(false);
        return;
      }
      setLoading(false);
      onSuccess?.();
      onClose();
    } catch {
      setError('Network error');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121927] border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Add New Gym Member</h3>
              <p className="text-xs text-slate-400">Enroll member, assign initial plan & record receipt</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="my-4 p-3 bg-red-950/60 border border-red-800/60 text-red-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Phone Number (WhatsApp) *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Fitness Goal
              </label>
              <select
                value={formData.fitnessGoal}
                onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Fat Loss">Fat Loss</option>
                <option value="Strength">Strength</option>
                <option value="General Fitness">General Fitness</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                placeholder="rahul@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                placeholder="175"
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                placeholder="75"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Plan & Payment enrollment */}
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
              Membership & Initial Payment
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Plan</label>
                <select
                  value={formData.planId}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">No Plan / Pay Later</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {formatINR(p.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Mode</label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                  className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="CASH">Cash at Desk</option>
                  <option value="CARD">Debit / Credit Card (POS)</option>
                  <option value="BANK_TRANSFER">Bank Transfer / IMPS</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  value={formData.amountPaid}
                  onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                  className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reference / Txn ID</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-12345"
                  value={formData.referenceId}
                  onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
                  className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
            >
              {loading ? 'Creating Member...' : 'Create & Enroll Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 2. RECORD PAYMENT MODAL
export function RecordPaymentModal({ isOpen, onClose, onSuccess, defaultMemberId }: ModalProps & { defaultMemberId?: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    memberId: defaultMemberId || '',
    planId: '',
    amount: '',
    discount: '0',
    paymentMode: 'UPI',
    referenceId: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        fetch('/api/admin/members').then((r) => r.json()),
        fetch('/api/admin/plans').then((r) => r.json()),
      ]).then(([mRes, pRes]) => {
        if (mRes.members) setMembers(mRes.members);
        if (pRes.plans) setPlans(pRes.plans);
        if (defaultMemberId) {
          setFormData((prev) => ({ ...prev, memberId: defaultMemberId }));
        }
      });
    }
  }, [isOpen, defaultMemberId]);

  if (!isOpen) return null;

  const handlePlanSelect = (planId: string) => {
    const selected = plans.find((p) => p.id === planId);
    setFormData((prev) => ({
      ...prev,
      planId,
      amount: selected ? selected.price.toString() : prev.amount,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId || !formData.amount) {
      setError('Please select a member and enter amount');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to record payment');
        setLoading(false);
        return;
      }
      setLoading(false);
      onSuccess?.();
      onClose();
    } catch {
      setError('Network error');
      setLoading(false);
    }
  };

  const selectedMember = members.find((m) => m.id === formData.memberId);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121927] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Record Manual Payment</h3>
              <p className="text-xs text-slate-400">Cash / UPI / Card payment at front desk</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="my-4 p-3 bg-red-950/60 border border-red-800/60 text-red-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Select Member *
            </label>
            <select
              required
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">-- Choose Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.user.name} ({m.memberCode}) - {m.status}
                </option>
              ))}
            </select>
          </div>

          {selectedMember && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300">
              <span className="font-bold text-white">{selectedMember.user.name}</span> • Current Expiry:{' '}
              <span className="text-emerald-400 font-semibold">{formatDate(selectedMember.currentExpiryDate)}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Renew Plan (Optional)
              </label>
              <select
                value={formData.planId}
                onChange={(e) => handlePlanSelect(e.target.value)}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Custom / Dues Only</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatINR(p.price)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Payment Mode *
              </label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="UPI">UPI (GPay / PhonePe / QR)</option>
                <option value="CASH">Cash at Desk</option>
                <option value="CARD">Debit / Credit Card (POS)</option>
                <option value="BANK_TRANSFER">Bank Transfer / IMPS</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Amount Received (₹) *
              </label>
              <input
                type="number"
                required
                placeholder="2499"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Discount Given (₹)
              </label>
              <input
                type="number"
                placeholder="0"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Transaction / Reference ID (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. UPI-TXN-998822"
              value={formData.referenceId}
              onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
              className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-all"
            >
              {loading ? 'Recording...' : 'Record & Issue Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 3. QUICK CHECK-IN MODAL
export function QuickCheckInModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [memberCode, setMemberCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAction = async (action: 'CHECK_IN' | 'CHECK_OUT') => {
    if (!memberCode.trim()) {
      setError('Please enter member code or phone number');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberCode: memberCode.trim(), action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Check-in failed');
        setLoading(false);
        return;
      }
      setResult(data);
      setLoading(false);
      onSuccess?.();
    } catch {
      setError('Network error');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121927] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Manual Front Desk Check-in</h3>
              <p className="text-xs text-slate-400">Search by Member Code (e.g. IF-1001) or Phone</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="my-4 p-3 bg-red-950/60 border border-red-800/60 text-red-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="my-4 p-3 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              {result.message || `Successfully checked in ${result.member?.name} (${result.member?.code})`}
            </span>
          </div>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Member Code or Phone
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. IF-1001 or 9811122331"
              value={memberCode}
              onChange={(e) => setMemberCode(e.target.value)}
              className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-4 py-3 text-base text-white focus:outline-none focus:border-emerald-500 uppercase font-mono tracking-wider"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleAction('CHECK_IN')}
              disabled={loading}
              className="py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-98"
            >
              {loading ? 'Processing...' : '✓ Check In'}
            </button>

            <button
              onClick={() => handleAction('CHECK_OUT')}
              disabled={loading}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all border border-slate-700 active:scale-98"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
