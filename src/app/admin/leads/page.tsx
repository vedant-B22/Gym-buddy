'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PhoneCall,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Sparkles,
  UserCheck,
  ChevronRight,
  ExternalLink,
  Plus,
  RefreshCw,
  X,
  Flame,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  fitnessGoal?: string | null;
  preferredTime?: string | null;
  source: string;
  status: 'NEW' | 'CONTACTED' | 'TRIAL_BOOKED' | 'TRIAL_DONE' | 'CONVERTED' | 'LOST';
  trialDate?: string | null;
  notes?: string | null;
  createdAt: string;
  assignedTo?: { name: string } | null;
  convertedMember?: {
    id: string;
    memberCode: string;
    user: { name: string };
  } | null;
}

const STAGES = [
  { key: 'NEW', label: 'New Enquiry', color: 'border-blue-500/40 bg-blue-500/10 text-blue-400' },
  { key: 'CONTACTED', label: 'Contacted', color: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
  { key: 'TRIAL_BOOKED', label: 'Trial Scheduled', color: 'border-purple-500/40 bg-purple-500/10 text-purple-400' },
  { key: 'TRIAL_DONE', label: 'Trial Done', color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400' },
  { key: 'CONVERTED', label: 'Converted', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
  { key: 'LOST', label: 'Lost', color: 'border-rose-500/40 bg-rose-500/10 text-rose-400' },
];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New Lead Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    fitnessGoal: 'Muscle Building & Strength',
    preferredTime: 'Morning (6 AM - 10 AM)',
    source: 'WALK_IN',
    notes: '',
  });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          name: '',
          phone: '',
          email: '',
          fitnessGoal: 'Muscle Building & Strength',
          preferredTime: 'Morning (6 AM - 10 AM)',
          source: 'WALK_IN',
          notes: '',
        });
        setActionMessage('Lead created successfully!');
        fetchLeads();
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error creating lead:', err);
    }
  };

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleConvertToMember = async (lead: Lead) => {
    if (!confirm(`Convert ${lead.name} to active gym member? This will generate a member code and member account.`)) {
      return;
    }

    try {
      setConvertingId(lead.id);
      const res = await fetch('/api/admin/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id, convertToMember: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage(data.message || `Successfully converted ${lead.name} to member!`);
        fetchLeads();
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        alert(data.error || 'Failed to convert lead');
      }
    } catch (err) {
      console.error('Convert to member error:', err);
      alert('Error converting lead to member');
    } finally {
      setConvertingId(null);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCount = leads.length;
  const newCount = leads.filter((l) => l.status === 'NEW').length;
  const trialCount = leads.filter((l) => l.status === 'TRIAL_BOOKED' || l.status === 'TRIAL_DONE').length;
  const convertedCount = leads.filter((l) => l.status === 'CONVERTED').length;
  const conversionRate = totalCount > 0 ? Math.round((convertedCount / totalCount) * 100) : 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {actionMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Leads & CRM</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {leads.length} Total
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Track inquiries, schedule trial sessions, and convert prospects into paid members.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'KANBAN'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Pipeline
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'TABLE'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Table
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20"
          >
            <UserPlus className="w-4 h-4" />
            Add Prospect
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0D1322] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">New Enquiries</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">{newCount}</div>
          <div className="text-xs text-blue-400 mt-1">Pending outreach</div>
        </div>

        <div className="bg-[#0D1322] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Trials Booked / Done</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">{trialCount}</div>
          <div className="text-xs text-purple-400 mt-1">Experience workout</div>
        </div>

        <div className="bg-[#0D1322] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Converted Members</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{convertedCount}</div>
          <div className="text-xs text-emerald-500/80 mt-1">Joined Iron Forge</div>
        </div>

        <div className="bg-[#0D1322] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Conversion Rate</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">{conversionRate}%</div>
          <div className="text-xs text-amber-400 mt-1">Funnel efficiency</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by prospect name, phone number, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D1322] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-bold border shrink-0 transition-all ${
              statusFilter === 'ALL'
                ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                : 'bg-[#0D1322] text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            All ({leads.length})
          </button>
          {STAGES.map((s) => {
            const count = leads.filter((l) => l.status === s.key).length;
            return (
              <button
                key={s.key}
                onClick={() => setStatusFilter(s.key)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border shrink-0 transition-all ${
                  statusFilter === s.key
                    ? 'bg-slate-800 text-white border-slate-600'
                    : 'bg-[#0D1322] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {s.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : viewMode === 'KANBAN' ? (
        /* Kanban Pipeline View */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage.key);
            return (
              <div
                key={stage.key}
                className="bg-[#0B101D] border border-slate-800/80 rounded-2xl flex flex-col min-w-[260px] md:min-w-0"
              >
                {/* Column Header */}
                <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stage.color.split(' ')[2].replace('text-', 'bg-')}`} />
                    <span className="text-xs font-bold text-slate-200">{stage.label}</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="p-2 space-y-2.5 max-h-[70vh] overflow-y-auto">
                  {stageLeads.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-600">No leads in this stage</div>
                  ) : (
                    stageLeads.map((lead) => {
                      const waText = encodeURIComponent(
                        `Hi ${lead.name}! Greetings from Iron Forge Fitness Indiranagar. We noticed your interest in ${lead.fitnessGoal || 'fitness training'}. Would you like to schedule your complimentary 1-day trial workout with our certified trainer?`
                      );
                      const waUrl = `https://wa.me/91${lead.phone}?text=${waText}`;

                      return (
                        <div
                          key={lead.id}
                          className="bg-[#10172A] border border-slate-800 hover:border-slate-700 rounded-xl p-3 shadow-md hover:shadow-lg transition-all space-y-2.5"
                        >
                          {/* Top Row */}
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <h4 className="text-sm font-bold text-white leading-tight">{lead.name}</h4>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">{lead.phone}</p>
                            </div>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                              {lead.source}
                            </span>
                          </div>

                          {/* Goal & Timing */}
                          <div className="text-[11px] space-y-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800/40">
                            {lead.fitnessGoal && (
                              <div className="text-emerald-400 font-medium truncate flex items-center gap-1">
                                <Flame className="w-3 h-3 shrink-0" />
                                <span className="truncate">{lead.fitnessGoal}</span>
                              </div>
                            )}
                            {lead.preferredTime && (
                              <div className="text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 shrink-0" />
                                <span className="truncate">{lead.preferredTime}</span>
                              </div>
                            )}
                            {lead.notes && (
                              <p className="text-slate-500 italic truncate text-[10px]">
                                &ldquo;{lead.notes}&rdquo;
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="pt-1 flex items-center justify-between gap-1 border-t border-slate-800/60">
                            {/* WhatsApp Direct */}
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all text-xs flex items-center gap-1 font-semibold"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span className="text-[10px]">WA</span>
                            </a>

                            {/* Status Advancement / Conversion */}
                            {lead.status !== 'CONVERTED' ? (
                              <div className="flex items-center gap-1">
                                <select
                                  value={lead.status}
                                  onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                                  className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 rounded px-1.5 py-1 focus:outline-none"
                                >
                                  {STAGES.map((s) => (
                                    <option key={s.key} value={s.key}>
                                      {s.label}
                                    </option>
                                  ))}
                                </select>

                                <button
                                  onClick={() => handleConvertToMember(lead)}
                                  disabled={convertingId === lead.id}
                                  className="p-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-[10px] flex items-center gap-1 transition-all"
                                  title="Convert to Member"
                                >
                                  <UserCheck className="w-3 h-3" />
                                  <span>Join</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Member Joined
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-[#0D1322] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#12192c] text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Prospect</th>
                  <th className="px-4 py-3 font-semibold">Goal & Time</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Enquired</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLeads.map((lead) => {
                  const stage = STAGES.find((s) => s.key === lead.status);
                  const waUrl = `https://wa.me/91${lead.phone}?text=Hi%20${encodeURIComponent(
                    lead.name
                  )}%2C%20greetings%20from%20Iron%20Forge%20Fitness!`;

                  return (
                    <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white">{lead.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{lead.phone}</div>
                        {lead.email && <div className="text-[11px] text-slate-500">{lead.email}</div>}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-xs text-emerald-400 font-medium">{lead.fitnessGoal || 'General Fitness'}</div>
                        <div className="text-xs text-slate-400">{lead.preferredTime || 'Anytime'}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${stage?.color}`}>
                          {stage?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400">
                        {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 transition-all"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>

                          {lead.status !== 'CONVERTED' ? (
                            <button
                              onClick={() => handleConvertToMember(lead)}
                              disabled={convertingId === lead.id}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Convert
                            </button>
                          ) : (
                            <span className="text-xs text-emerald-400 font-bold">Converted</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1322] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-white">Add New Gym Prospect</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Verma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="rahul@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Fitness Goal</label>
                  <select
                    value={formData.fitnessGoal}
                    onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                    className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Fat Loss & Toning">Fat Loss & Toning</option>
                    <option value="Muscle Building & Strength">Muscle Building & Strength</option>
                    <option value="General Health & Mobility">General Health & Mobility</option>
                    <option value="Athletic Conditioning">Athletic Conditioning</option>
                    <option value="Powerlifting">Powerlifting</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Preferred Time</label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Morning (6 AM - 10 AM)">Morning (6 AM - 10 AM)</option>
                    <option value="Afternoon (11 AM - 4 PM)">Afternoon (11 AM - 4 PM)</option>
                    <option value="Evening (5 PM - 10 PM)">Evening (5 PM - 10 PM)</option>
                    <option value="Anytime">Anytime Flexible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Enquiry Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="WALK_IN">Walk-in Visit</option>
                  <option value="WEBSITE">Website Form</option>
                  <option value="REFERRAL">Member Referral</option>
                  <option value="INSTAGRAM">Instagram / Social</option>
                  <option value="GOOGLE_MAPS">Google Maps</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Staff Notes / Comments</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Wants to try bench press and free weights first"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
