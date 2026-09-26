import React, { useEffect } from 'react';
import { useOperator } from '../../context/OperatorContext';
import { ShieldCheck, RefreshCw, Terminal, UserCheck, Calendar, FileText, Layers, Key } from 'lucide-react';

export const AuditLogsTab: React.FC = () => {
  const { auditLogs, fetchAuditLogs } = useOperator();

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            Operator Audit Trail (`operator_audit_log`)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable Firestore server logs of all back-office mutations, provisions, tier updates, broadcasts, and impersonation sessions.
          </p>
        </div>

        <button
          onClick={() => fetchAuditLogs()}
          className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4" /> Firestore Collection: /operator_audit_log
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {auditLogs.length} Total Audit Entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Operator Email</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Target Type & ID</th>
                <th className="py-3 px-4 font-semibold">Metadata & Impersonation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500 font-sans">
                    No audit log entries recorded yet. Perform a mutation (e.g. provision clinic, reply ticket, impersonate) to view Firestore audit logs.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {log.createdAtIso ? log.createdAtIso.replace('T', ' ').slice(0, 19) : 'Just now'}
                    </td>

                    <td className="py-3 px-4 font-bold text-teal-300 text-[11px]">
                      {log.operatorEmail}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action.includes('IMPERSONATE')
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : log.action.includes('PROVISION')
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-200">
                      <span className="text-slate-500 uppercase text-[10px] mr-1">[{log.targetType}]</span>
                      <strong>{log.targetId}</strong>
                    </td>

                    <td className="py-3 px-4 text-slate-300 text-[11px]">
                      <div className="max-w-md truncate text-slate-400">
                        {JSON.stringify(log.metadata || {})}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
