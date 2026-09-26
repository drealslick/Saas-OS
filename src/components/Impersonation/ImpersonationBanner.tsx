import React from 'react';
import { useOperator } from '../../context/OperatorContext';
import { ShieldAlert, LogOut, ExternalLink, Calendar, FileText, Activity } from 'lucide-react';

export const ImpersonationBanner: React.FC = () => {
  const { impersonatedClinic, stopImpersonating } = useOperator();

  if (!impersonatedClinic) return null;

  return (
    <div className="bg-amber-500 text-slate-950 font-medium text-xs px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 sticky top-[108px] z-30 border-b border-amber-600 animate-fadeIn">
      <div className="flex items-center space-x-3">
        <div className="p-1 bg-amber-950/20 rounded-md">
          <ShieldAlert className="w-4 h-4 text-amber-950 animate-pulse" />
        </div>
        <div>
          <span className="font-extrabold uppercase tracking-wide bg-amber-950/10 px-1.5 py-0.5 rounded text-[10px] mr-2 border border-amber-950/20">
            Impersonation Mode Active
          </span>
          <span>
            Viewing Back-Office Workspace for <strong className="font-bold underline">{impersonatedClinic.name}</strong> ({impersonatedClinic.doctorName}) — Plan: <strong className="uppercase">{impersonatedClinic.planTier}</strong> (${impersonatedClinic.mrr}/mo)
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="hidden md:flex items-center space-x-2 text-[11px] bg-amber-600/20 px-2.5 py-1 rounded font-mono">
          <span>EHR: <strong>{impersonatedClinic.ehrIntegration}</strong></span>
          <span>•</span>
          <span>Patients: <strong>{impersonatedClinic.patientCount}</strong></span>
        </div>

        <button
          onClick={stopImpersonating}
          className="flex items-center space-x-1.5 bg-slate-950 hover:bg-slate-900 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Impersonation</span>
        </button>
      </div>
    </div>
  );
};
