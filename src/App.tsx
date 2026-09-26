import React, { useState, useEffect } from 'react';
import { OperatorProvider, useOperator } from './context/OperatorContext';
import { Header } from './components/Header';
import { ImpersonationBanner } from './components/Impersonation/ImpersonationBanner';
import { ClinicPortalSim } from './components/Impersonation/ClinicPortalSim';
import { ClinicRegistryTab } from './components/Tabs/ClinicRegistryTab';
import { RevenueLedgerTab } from './components/Tabs/RevenueLedgerTab';
import { SystemHealthTab } from './components/Tabs/SystemHealthTab';
import { SupportInboxTab } from './components/Tabs/SupportInboxTab';
import { AnnouncementsTab } from './components/Tabs/AnnouncementsTab';
import { GlobalSearchModal } from './components/GlobalSearchModal';

const DashboardMain: React.FC = () => {
  const { activeTab, impersonatedClinic } = useOperator();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Cmd+K or Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Navigation Header */}
      <Header onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Impersonation Banner when active */}
      <ImpersonationBanner />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* If operator is currently 1-click impersonating a clinic, show the simulated Clinic SaaS Portal */}
        {impersonatedClinic ? (
          <ClinicPortalSim />
        ) : (
          <>
            {activeTab === 'clinics' && <ClinicRegistryTab />}
            {activeTab === 'revenue' && <RevenueLedgerTab />}
            {activeTab === 'health' && <SystemHealthTab />}
            {activeTab === 'support' && <SupportInboxTab />}
            {activeTab === 'announcements' && <AnnouncementsTab />}
          </>
        )}
      </main>

      {/* Cmd+K Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Back-Office Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            ChiroPulse Operator Console • <span className="text-teal-400 font-semibold">v3.8.4-PROD</span>
          </div>
          <div>
            Internal Back-Office Operator Plane • Confidential Practice Data
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <OperatorProvider>
      <DashboardMain />
    </OperatorProvider>
  );
}
