'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  QrCode,
  Calendar,
  Layers,
  PhoneCall,
  Wrench,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  Dumbbell,
  UserCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  requiredPermission?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Members', href: '/admin/members', icon: Users, requiredPermission: 'members:read' },
  { name: 'Plans & Pricing', href: '/admin/plans', icon: Layers, requiredPermission: 'members:write' },
  { name: 'Payments & Invoices', href: '/admin/payments', icon: CreditCard, requiredPermission: 'payments:read' },
  { name: 'Attendance & QR Kiosk', href: '/admin/attendance', icon: QrCode, requiredPermission: 'attendance:read' },
  { name: 'Classes & Schedule', href: '/admin/classes', icon: Calendar, requiredPermission: 'classes:read' },
  { name: 'Leads & CRM', href: '/admin/leads', icon: PhoneCall, requiredPermission: 'leads:read' },
  { name: 'Equipment & Stock', href: '/admin/inventory', icon: Wrench, requiredPermission: 'inventory:read' },
  { name: 'Expenses & Reports', href: '/admin/reports', icon: DollarSign, requiredPermission: 'expenses:read' },
  { name: 'Gym Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Verifying Staff Authorization...</p>
        </div>
      </div>
    );
  }

  // If not staff (e.g. Member), display access prompt
  if (!user || user.role === 'MEMBER') {
    return (
      <div className="min-h-screen bg-[#090D16] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4">
          <UserCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Staff Portal Access Required</h1>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          You are currently logged in as a Member ({user?.name || 'Guest'}). Use the Demo Bar above to switch to Owner, Manager, Trainer, or Receptionist to view the Admin Dashboard.
        </p>
        <div className="flex gap-3">
          <Link
            href="/app"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition-all"
          >
            Go to Member App
          </Link>
          <Link
            href="/login"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition-all"
          >
            Staff Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0D1322] border-r border-slate-800/80 shrink-0 sticky top-[33px] h-[calc(100vh-33px)] overflow-y-auto">
        {/* Gym Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 shrink-0">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h2 className="font-black text-sm tracking-wider uppercase text-white truncate">
              IRON FORGE
            </h2>
            <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
              Admin Ops • {user.role}
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </Link>
            );
          })}
        </nav>

        {/* User footer & member app link */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <Link
            href="/app"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-[11px] font-medium text-emerald-400 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5" /> Open Member App
            </span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border border-slate-800">
            <div className="truncate mr-2">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.role}</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0D1322] border-b border-slate-800 sticky top-[33px] z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-xs uppercase text-white">IRON FORGE</h2>
            <p className="text-[10px] text-emerald-400">{user.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/app"
            className="px-2.5 py-1 bg-slate-800 text-emerald-400 text-[11px] font-bold rounded-lg border border-slate-700"
          >
            Member App
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/80"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[80px] bg-slate-950/95 backdrop-blur-xl z-50 p-4 flex flex-col justify-between">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-white">{user.name}</p>
              <p className="text-xs text-slate-400">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-950/50 border border-red-800/60 text-red-300 rounded-xl text-xs font-bold"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
