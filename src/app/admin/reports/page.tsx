'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Plus,
  Calendar,
  Download,
  Receipt,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  X,
  CreditCard,
  FileText
} from 'lucide-react';

interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  expenseDate: string;
  paymentMode: string;
  notes?: string | null;
}

interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  categoryTotals: Record<string, number>;
  monthlySummary: Record<string, { revenue: number; expenses: number }>;
}

const CATEGORIES = [
  'RENT',
  'SALARIES',
  'ELECTRICITY',
  'EQUIPMENT_MAINTENANCE',
  'MARKETING',
  'CLEANING',
  'OTHER',
];

export default function AdminReportsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    categoryTotals: {},
    monthlySummary: {},
  });
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'ELECTRICITY',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMode: 'UPI',
    notes: '',
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/expenses');
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowAddExpenseModal(false);
        setFormData({
          title: '',
          category: 'ELECTRICITY',
          amount: '',
          expenseDate: new Date().toISOString().split('T')[0],
          paymentMode: 'UPI',
          notes: '',
        });
        fetchReports();
      }
    } catch (err) {
      console.error('Record expense error:', err);
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    return categoryFilter === 'ALL' || e.category === categoryFilter;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date,Title,Category,Payment Mode,Amount (INR),Notes'];
    const rows = filteredExpenses.map(
      (e) => `"${e.expenseDate}","${e.title}","${e.category}","${e.paymentMode}",${e.amount},"${e.notes || ''}"`
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iron_forge_expenses_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Expenses & Reports</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              P&L Overview
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Track operational expenses, salary disbursements, electricity, and net gym profitability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Record Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0D1322] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            ₹{metrics.totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-emerald-400 mt-1">Paid memberships collected</div>
        </div>

        <div className="bg-[#0D1322] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Expenses</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2">
            ₹{metrics.totalExpenses.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Operational overheads</div>
        </div>

        <div className="bg-[#0D1322] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Net Profit</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-black mt-2 ${
              metrics.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            ₹{metrics.netProfit.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Revenue − Operating Expenses</div>
        </div>

        <div className="bg-[#0D1322] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Profit Margin</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">{metrics.profitMargin}%</div>
          <div className="text-xs text-amber-400 mt-1">Net operational margin</div>
        </div>
      </div>

      {/* Category Breakdown & Monthly Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown */}
        <div className="lg:col-span-6 bg-[#0D1322] border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            Expense Breakdown by Category
          </h3>

          <div className="space-y-3">
            {Object.keys(metrics.categoryTotals).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No expenses recorded yet</p>
            ) : (
              Object.entries(metrics.categoryTotals).map(([cat, amt]) => {
                const pct = metrics.totalExpenses > 0 ? Math.round((amt / metrics.totalExpenses) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-semibold">{cat.replace(/_/g, ' ')}</span>
                      <span className="text-white font-bold">
                        ₹{amt.toLocaleString('en-IN')} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Monthly Financial Trend */}
        <div className="lg:col-span-6 bg-[#0D1322] border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            Monthly Cashflow Summary
          </h3>

          <div className="space-y-3">
            {Object.keys(metrics.monthlySummary).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No transaction records found</p>
            ) : (
              Object.entries(metrics.monthlySummary).map(([month, data]) => {
                const diff = data.revenue - data.expenses;
                return (
                  <div
                    key={month}
                    className="bg-[#12192C] border border-slate-800/80 rounded-xl p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-bold text-white">{month}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        In: ₹{data.revenue.toLocaleString('en-IN')} • Out: ₹{data.expenses.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-black ${
                          diff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {diff >= 0 ? '+' : ''}₹{diff.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500">Net Month</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Expenses Ledger Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-white">Expense Ledger ({filteredExpenses.length})</h3>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 transition-all ${
                categoryFilter === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                  : 'bg-[#0D1322] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 transition-all ${
                  categoryFilter === c
                    ? 'bg-slate-800 text-white border-slate-600'
                    : 'bg-[#0D1322] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {c.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#0D1322] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#12192c] text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Expense Title</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Payment Mode</th>
                  <th className="px-4 py-3 font-semibold text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-xs">
                      No expense records found.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white">{exp.title}</div>
                        {exp.notes && <div className="text-[11px] text-slate-500">{exp.notes}</div>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border border-slate-700 bg-slate-800 text-slate-300">
                          {exp.category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400">{exp.expenseDate}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-semibold text-slate-300">{exp.paymentMode}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-black text-rose-400">
                        -₹{exp.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Record Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1322] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Record Operating Expense</h3>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Expense Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BESCOM Electricity Bill - October"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="15000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Payment Mode</label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank NEFT/IMPS</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Notes / Invoice Ref</label>
                <input
                  type="text"
                  placeholder="e.g. Paid from HDFC Current Account"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-slate-950 text-sm font-bold rounded-xl"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
