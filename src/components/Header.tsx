import React from 'react';
import { useOperator } from '../context/OperatorContext';
import { 
  Building2, 
  DollarSign, 
  Activity, 
  Inbox, 
  Megaphone, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle,
  Zap,
  UserCheck
} from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const { 
    clinics, 
    tickets, 
    activeTab, 
    setActiveTab, 
    resetToDefaultData, 
    services 
  } = useOperator();

  // Metrics calculation
  const totalMrr = clinics.reduce((sum, c) => c.status === 'active' || c.status === 'trial' ? sum + c.mrr : sum, 0);
  const activeCount = clinics.filter(c => c.status === 'active').length;
  const trialCount = clinics.filter(c => c.status === 'trial').length;
  const openTicketsCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const hasDegradedService = services.some(s => s.status !== 'operational');

  interface TabItem {
    id: 'clinics' | 'revenue' | 'health' | 'support' | 'announcements';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }

  const tabs: TabItem[] = [
    { id: 'clinics', label: 'Clinic Registry', icon: Building2, badge: clinics.length },
    { id: 'revenue', label: 'Revenue & MRR Ledger', icon: DollarSign, badge: `$${totalMrr.toLocaleString()}` },
    { id: 'health', label: 'System Health', icon: Activity, badge: hasDegradedService ? 'Degraded' : '99.98%', badgeColor: hasDegradedService ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300' },
    { id: 'support', label: 'Support Inbox', icon: Inbox, badge: openTicketsCount, badgeColor: openTicketsCount > 0 ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/30' : 'bg-slate-800 text-slate-400' },
    { id: 'announcements', label: 'Announcements', icon: Megaphone }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      {/* Top Bar: Brand, Global KPIs & Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-teal-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-teal-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-extrabold tracking-tight text-white font-sans">ChiroPulse</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-md">
                Operator Console
              </span>
            </div>
            <p className="text-xs text-slate-400">Back-Office SaaS Control Plane</p>
          </div>
        </div>

        {/* Global KPI Live Ticker */}
        <div className="hidden lg:flex items-center space-x-6 text-xs bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800/80 font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 uppercase tracking-wider">Total MRR:</span>
            <span className="font-bold text-emerald-400 text-sm">${totalMrr.toLocaleString()}</span>
          </div>

          <div className="w-px h-4 bg-slate-800" />

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 uppercase tracking-wider">Clinics:</span>
            <span className="font-bold text-slate-200">
              {activeCount} <span className="text-slate-500 text-[10px]">Active</span>
              {trialCount > 0 && <span className="ml-1 text-cyan-400">({trialCount} Trial)</span>}
            </span>
          </div>

          <div className="w-px h-4 bg-slate-800" />

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 uppercase tracking-wider">Open Tickets:</span>
            <span className={`font-bold ${openTicketsCount > 0 ? 'text-amber-400 flex items-center gap-1' : 'text-slate-200'}`}>
              {openTicketsCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
              {openTicketsCount}
            </span>
          </div>

          <div className="w-px h-4 bg-slate-800" />

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 uppercase tracking-wider">System:</span>
            {hasDegradedService ? (
              <span className="flex items-center text-amber-400 font-bold gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Degraded
              </span>
            ) : (
              <span className="flex items-center text-emerald-400 font-bold gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 99.98%
              </span>
            )}
          </div>
        </div>

        {/* Header Quick Actions */}
        <div className="flex items-center space-x-2">
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs transition shadow-sm"
            title="Search Clinics, Invoices, Tickets (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search Console...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 text-slate-400 rounded border border-slate-700">
              ⌘K
            </kbd>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (confirm('Reset Operator Console data back to original demonstration state?')) {
                resetToDefaultData();
              }
            }}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            title="Reset Console Seed Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* User Profile */}
          <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">
              AM
            </div>
            <div className="text-left text-xs">
              <p className="font-semibold text-slate-200 leading-tight">Alex Mercer</p>
              <p className="text-[10px] text-teal-400 flex items-center gap-1">
                <UserCheck className="w-2.5 h-2.5" /> Sr. Platform Operator
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-mono font-medium ${
                    tab.badgeColor ? tab.badgeColor : (isActive ? 'bg-teal-500/30 text-teal-200' : 'bg-slate-800 text-slate-400')
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
