'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Check,
  Edit2,
  Users,
  Clock,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react';
import { formatINR } from '@/lib/business-logic';

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    durationMonths: '1',
    durationDays: '30',
    price: '',
    joiningFee: '0',
    features: ['Full gym floor access', 'Locker & shower facilities'],
    newFeatureText: '',
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/plans');
      if (res.ok) {
        const d = await res.json();
        setPlans(d.plans || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      durationMonths: '1',
      durationDays: '30',
      price: '',
      joiningFee: '0',
      features: ['Full gym floor access', 'Locker & shower facilities'],
      newFeatureText: '',
    });
    setShowModal(true);
  };

  const openEditModal = (p: any) => {
    setEditingPlan(p);
    setFormData({
      name: p.name,
      durationMonths: p.durationMonths.toString(),
      durationDays: p.durationDays.toString(),
      price: p.price.toString(),
      joiningFee: p.joiningFee.toString(),
      features: p.features || [],
      newFeatureText: '',
    });
    setShowModal(true);
  };

  const handleAddFeature = () => {
    if (!formData.newFeatureText.trim()) return;
    setFormData({
      ...formData,
      features: [...formData.features, formData.newFeatureText.trim()],
      newFeatureText: '',
    });
  };

  const handleRemoveFeature = (idx: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== idx),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: editingPlan?.id,
      name: formData.name,
      durationMonths: parseInt(formData.durationMonths, 10),
      durationDays: parseInt(formData.durationDays, 10),
      price: parseFloat(formData.price),
      joiningFee: parseFloat(formData.joiningFee),
      features: formData.features,
    };

    const method = editingPlan ? 'PUT' : 'POST';
    const res = await fetch('/api/admin/plans', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setShowModal(false);
      fetchPlans();
    }
  };

  const togglePlanActive = async (p: any) => {
    await fetch('/api/admin/plans', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, isActive: !p.isActive }),
    });
    fetchPlans();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase text-white tracking-tight">Membership Plans & Pricing</h1>
          <p className="text-xs text-slate-400">
            Configure pricing tiers, duration, features, and joining fee. Displayed live on the public website.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`bg-[#121927] border rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all ${
              p.isActive ? 'border-slate-800' : 'border-slate-800/40 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
                  {p.durationMonths} {p.durationMonths === 1 ? 'Month' : 'Months'} ({p.durationDays} Days)
                </span>
                <button
                  onClick={() => togglePlanActive(p)}
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    p.isActive
                      ? 'bg-slate-800 text-slate-300 hover:text-white'
                      : 'bg-red-950 text-red-400 border border-red-800'
                  }`}
                >
                  {p.isActive ? 'Active' : 'Disabled'}
                </button>
              </div>

              <h3 className="text-xl font-black text-white mb-1">{p.name}</h3>

              <div className="flex items-baseline gap-1 my-3">
                <span className="text-3xl font-black text-emerald-400">{formatINR(p.price)}</span>
                <span className="text-xs text-slate-400">/ term</span>
                {p.joiningFee > 0 && (
                  <span className="text-[11px] text-slate-500 ml-2">
                    + {formatINR(p.joiningFee)} join fee
                  </span>
                )}
              </div>

              {/* Bullet Features */}
              <div className="space-y-2 py-4 border-t border-slate-800/80">
                {(p.features || []).map((feat: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <strong className="text-white">{p.activeMemberCount || 0}</strong> active members
              </span>

              <button
                onClick={() => openEditModal(p)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors"
              >
                <Edit2 className="w-3 h-3 text-emerald-400" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121927] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">
                {editingPlan ? 'Edit Membership Plan' : 'Create New Membership Plan'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6-Month Elite Pass"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.durationMonths}
                    onChange={(e) => {
                      const m = parseInt(e.target.value, 10) || 1;
                      setFormData({
                        ...formData,
                        durationMonths: e.target.value,
                        durationDays: (m * 30).toString(),
                      });
                    }}
                    className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                    className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Price (INR ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="9999"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Joining Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.joiningFee}
                    onChange={(e) => setFormData({ ...formData, joiningFee: e.target.value })}
                    className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Feature Points Builder */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Features & Inclusions
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add feature (e.g. Free 15-day freeze)"
                    value={formData.newFeatureText}
                    onChange={(e) => setFormData({ ...formData, newFeatureText: e.target.value })}
                    className="flex-1 bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {formData.features.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-1.5 bg-slate-900 rounded-lg text-xs text-slate-300"
                    >
                      <span>{f}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(i)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs"
                >
                  {editingPlan ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
