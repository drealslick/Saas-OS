import React, { useState, useEffect } from 'react';
import { useOperator } from '../context/OperatorContext';
import { Search, Building2, Inbox, DollarSign, Terminal, UserCheck, ChevronRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { clinics, tickets, invoices, logs, startImpersonating, setActiveTab } = useOperator();
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matchedClinics = query.trim() ? clinics.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.doctorName.toLowerCase().includes(query.toLowerCase()) ||
    c.ownerEmail.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4) : [];

  const matchedTickets = query.trim() ? tickets.filter(t => 
    t.subject.toLowerCase().includes(query.toLowerCase()) || 
    t.clinicName.toLowerCase().includes(query.toLowerCase()) ||
    t.id.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4) : [];

  const matchedInvoices = query.trim() ? invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(query.toLowerCase()) || 
    inv.clinicName.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4) : [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-800 flex items-center space-x-3 bg-slate-950">
          <Search className="w-5 h-5 text-teal-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type to search clinics, tickets, or invoices..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="px-2 py-1 bg-slate-800 text-slate-400 hover:text-slate-200 text-xs rounded border border-slate-700"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 max-h-[420px] overflow-y-auto space-y-4 text-xs">
          {!query.trim() ? (
            <div className="text-center py-8 text-slate-500">
              Type a search query to quickly jump to clinics, tickets, or invoice records.
            </div>
          ) : (
            <>
              {/* Clinics Match Section */}
              {matchedClinics.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-400" /> Clinics ({matchedClinics.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedClinics.map(c => (
                      <div
                        key={c.id}
                        className="p-2.5 bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer transition"
                        onClick={() => {
                          setActiveTab('clinics');
                          onClose();
                        }}
                      >
                        <div>
                          <div className="font-bold text-white">{c.name}</div>
                          <div className="text-[11px] text-slate-400">{c.doctorName} • {c.ownerEmail}</div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startImpersonating(c);
                            onClose();
                          }}
                          className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-[10px] font-bold flex items-center gap-1 hover:bg-amber-500/30"
                        >
                          <UserCheck className="w-3 h-3" /> Impersonate
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Support Tickets Match Section */}
              {matchedTickets.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Inbox className="w-3.5 h-3.5 text-cyan-400" /> Support Tickets ({matchedTickets.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedTickets.map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setActiveTab('support');
                          onClose();
                        }}
                        className="p-2.5 bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer transition"
                      >
                        <div>
                          <div className="font-bold text-white">{t.subject}</div>
                          <div className="text-[11px] text-slate-400">{t.clinicName} • ID: {t.id}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices Match Section */}
              {matchedInvoices.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Invoices ({matchedInvoices.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedInvoices.map(inv => (
                      <div
                        key={inv.id}
                        onClick={() => {
                          setActiveTab('revenue');
                          onClose();
                        }}
                        className="p-2.5 bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer transition"
                      >
                        <div>
                          <div className="font-bold text-white">{inv.invoiceNumber} — ${inv.amount}</div>
                          <div className="text-[11px] text-slate-400">{inv.clinicName} • Status: {inv.status.toUpperCase()}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedClinics.length === 0 && matchedTickets.length === 0 && matchedInvoices.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No records matched "{query}".
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
