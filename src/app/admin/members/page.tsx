'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Download,
  Phone,
  Calendar,
  AlertCircle,
  Eye,
  CreditCard,
  PauseCircle,
  PlayCircle,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { formatINR, formatDate } from '@/lib/business-logic';
import { AddMemberModal, RecordPaymentModal } from '@/components/admin/QuickModals';

export default function AdminMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [planFilter, setPlanFilter] = useState('ALL');

  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedPayMemberId, setSelectedPayMemberId] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (statusFilter !== 'ALL') query.append('status', statusFilter);
      if (planFilter !== 'ALL') query.append('planId', planFilter);

      const res = await fetch(`/api/admin/members?${query.toString()}`);
      if (res.ok) {
        const d = await res.json();
        setMembers(d.members || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/admin/plans')
      .then((r) => r.json())
      .then((d) => setPlans(d.plans || []));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, planFilter]);

  const handleExportCSV = () => {
    const headers = ['Member Code,Name,Phone,Email,Status,Current Plan,Expiry Date,Streak'];
    const rows = members.map((m) => {
      const planName = m.memberships?.[0]?.plan?.name || 'N/A';
      return `"${m.memberCode}","${m.user?.name}","${m.user?.phone}","${m.user?.email}","${m.status}","${planName}","${formatDate(m.currentExpiryDate)}","${m.streakCurrent}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ironforge_members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">Active</span>;
      case 'EXPIRING_SOON':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800/80">Expiring Soon</span>;
      case 'EXPIRED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-950/80 text-red-400 border border-red-800/80">Expired</span>;
      case 'FROZEN':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800/80">Frozen</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">Inactive</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase text-white tracking-tight">Member Directory</h1>
          <p className="text-xs text-slate-400">
            Manage memberships, renewal tracking, freeze statuses, and contact records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-all border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowAddMember(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#121927] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-lg">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, phone, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0A0E1A] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-[#0A0E1A] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRING_SOON">Expiring Soon</option>
              <option value="EXPIRED">Expired</option>
              <option value="FROZEN">Frozen</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0A0E1A] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Plans</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Members Data Table */}
      <div className="bg-[#121927] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D1322] border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Phone / WhatsApp</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Current Plan</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4 text-center">Streak</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading members...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No members found matching your search or filters.
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const latestPlan = m.memberships?.[0]?.plan?.name || 'No Plan';
                  const isExpiring = m.status === 'EXPIRING_SOON';
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-850/50 transition-colors group"
                    >
                      {/* Name & Code */}
                      <td className="py-3.5 px-4">
                        <Link href={`/admin/members/${m.id}`} className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400 shrink-0">
                            {m.user?.name?.charAt(0) || 'M'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                              {m.user?.name}
                            </p>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                              {m.memberCode}
                            </span>
                          </div>
                        </Link>
                      </td>

                      {/* Phone / WhatsApp */}
                      <td className="py-3.5 px-4 text-slate-300 font-mono">
                        <a
                          href={`https://wa.me/91${m.user?.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-emerald-400 inline-flex items-center gap-1.5"
                          title="Chat on WhatsApp"
                        >
                          <Phone className="w-3 h-3 text-emerald-400" />
                          +91 {m.user?.phone}
                        </a>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(m.status)}
                      </td>

                      {/* Plan */}
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {latestPlan}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-4">
                        <div className={`font-medium ${isExpiring ? 'text-amber-400 font-bold' : 'text-slate-300'}`}>
                          {formatDate(m.currentExpiryDate)}
                        </div>
                        {m.currentExpiryDate && (
                          <span className="text-[10px] text-slate-500">
                            {Math.ceil((new Date(m.currentExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                          </span>
                        )}
                      </td>

                      {/* Streak */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-slate-200 font-bold">
                          <Flame className="w-3.5 h-3.5 text-amber-500" />
                          {m.streakCurrent || 0}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPayMemberId(m.id)}
                            title="Record Payment"
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            href={`/admin/members/${m.id}`}
                            title="View Member Profile"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onSuccess={fetchMembers}
      />

      <RecordPaymentModal
        isOpen={!!selectedPayMemberId}
        defaultMemberId={selectedPayMemberId || undefined}
        onClose={() => setSelectedPayMemberId(null)}
        onSuccess={fetchMembers}
      />
    </div>
  );
}
