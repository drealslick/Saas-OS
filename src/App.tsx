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
import { AuditLogsTab } from './components/Tabs/AuditLogsTab';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

const DashboardMain: React.FC = () => {
  const { 
    activeTab, 
    impersonatedClinic, 
    impersonatedWriteConfirmation, 
    closeImpersonatedWriteModal 
  } = useOperator();

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
            {activeTab === 'audit_logs' && <AuditLogsTab />}
          </>
        )}
      </main>

      {/* Constraint #4: Impersonated Write Second Confirmation Modal */}
      {impersonatedWriteConfirmation && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3 mb-4">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{impersonatedWriteConfirmation.title}</h3>
                <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                  Impersonation Write Warning
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              {impersonatedWriteConfirmation.description}
            </p>

            <div className="flex items-center justify-end space-x-3 border-t border-slate-800 pt-4">
              <button
                onClick={closeImpersonatedWriteModal}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel Mutation
              </button>
              <button
                onClick={impersonatedWriteConfirmation.onConfirm}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-amber-500/20"
              >
                Confirm Impersonated Write
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cmd+K Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Back-Office Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            ChiroPulse Operator Console • <span className="text-teal-400 font-semibold">v3.8.4-PROD (Firebase Admin SDK)</span>
          </div>
          <div>
            Project: <strong className="text-slate-300">brave-trilogy-ft8c4</strong> • Operator Security Verified
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
