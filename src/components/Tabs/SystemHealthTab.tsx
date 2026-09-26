import React, { useState } from 'react';
import { useOperator } from '../../context/OperatorContext';
import { 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Server, 
  Database, 
  MessageSquare, 
  Mail, 
  RefreshCw, 
  Sparkles, 
  Terminal, 
  Cpu, 
  Zap,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';

export const SystemHealthTab: React.FC = () => {
  const { services, logs, refreshSystemServices, resolveServiceIncident, addSystemLog } = useOperator();

  const [aiAnalysis, setAiAnalysis] = useState<{
    analysis: string;
    urgency: string;
    actionItems: string[];
    isAiGenerated?: boolean;
  } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeLogFilter, setActiveLogFilter] = useState<string>('all');

  const hasIncident = services.some(s => s.status !== 'operational');

  const handleRunAiDiagnostics = async () => {
    setIsAnalyzing(true);
    try {
      const errorLogs = logs.filter(l => l.level === 'warn' || l.level === 'error');
      const response = await fetch('/api/ai/analyze-health-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs: errorLogs.length > 0 ? errorLogs : logs.slice(0, 5),
          serviceName: 'ChiroPulse Back-Office Cluster'
        }),
      });

      const data = await response.json();
      setAiAnalysis(data);
    } catch (err) {
      console.error('Failed to run AI diagnostics:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredLogs = logs.filter(l => {
    if (activeLogFilter === 'all') return true;
    return l.level === activeLogFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-400" />
            System Health & Infrastructure Diagnostics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor API gateways, database connection pools, EHR sync latency, and trigger Gemini AI diagnostic scans.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={refreshSystemServices}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Metrics</span>
          </button>

          <button
            onClick={handleRunAiDiagnostics}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs shadow-lg shadow-teal-500/20 transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAnalyzing ? 'Scanning System with AI...' : 'Run Gemini AI Diagnostic Scan'}</span>
          </button>
        </div>
      </div>

      {/* Overall Health Status Bar */}
      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
        hasIncident 
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' 
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${hasIncident ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
            {hasIncident ? <AlertTriangle className="w-6 h-6 text-amber-400 animate-pulse" /> : <ShieldCheck className="w-6 h-6 text-emerald-400" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {hasIncident ? 'System Status: Degraded Service Warning' : 'System Status: All Core Systems Operational'}
            </h3>
            <p className="text-xs opacity-80 mt-0.5">
              {hasIncident ? 'ChiroTouch REST Bridge proxy pool is experiencing elevated latency retries.' : '99.98% cluster uptime over past 30 days. All API endpoints responding within SLA.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="px-2.5 py-1 bg-slate-950/80 rounded-lg border border-slate-800 text-slate-300">
            Region: <strong>US-East (Virginia)</strong>
          </span>
          <span className="px-2.5 py-1 bg-slate-950/80 rounded-lg border border-slate-800 text-slate-300">
            Node Pool: <strong>8 / 8 Healthy</strong>
          </span>
        </div>
      </div>

      {/* AI Diagnostic Output Card if triggered */}
      {aiAnalysis && (
        <div className="bg-slate-900 border border-teal-500/40 rounded-2xl p-5 shadow-2xl relative animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <h3 className="text-sm font-bold text-white">Gemini AI Infrastructure Diagnostic Summary</h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono ${
              aiAnalysis.urgency === 'High' || aiAnalysis.urgency === 'Critical'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              Urgency: {aiAnalysis.urgency}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-slate-300 whitespace-pre-line leading-relaxed">
              {aiAnalysis.analysis}
            </div>

            <div>
              <h4 className="font-bold text-teal-300 mb-2 uppercase tracking-wider text-[10px]">Recommended Action Items:</h4>
              <ul className="space-y-1.5">
                {aiAnalysis.actionItems.map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-2 text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((srv) => (
          <div key={srv.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md relative hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-teal-400" />
                <h4 className="text-sm font-bold text-white">{srv.name}</h4>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                srv.status === 'operational'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
              }`}>
                {srv.status}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-2">{srv.details}</p>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <div className="text-slate-400">
                Latency: <strong className={srv.latencyMs > 150 ? 'text-amber-400' : 'text-emerald-400'}>{srv.latencyMs}ms</strong>
              </div>
              <div className="text-slate-400">
                Uptime: <strong className="text-white">{srv.uptimePercent}%</strong>
              </div>
            </div>

            {srv.status !== 'operational' && (
              <button
                onClick={() => resolveServiceIncident(srv.id)}
                className="w-full mt-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-bold transition text-center"
              >
                Flush Cache & Resolve Incident
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Real-time System Log Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white font-mono">System Console Event Stream</h3>
          </div>

          <div className="flex items-center space-x-2">
            {(['all', 'info', 'warn', 'error'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setActiveLogFilter(lvl)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold capitalize transition ${
                  activeLogFilter === lvl
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-950 font-mono text-xs max-h-80 overflow-y-auto space-y-2">
          {filteredLogs.map(log => (
            <div key={log.id} className="flex items-start space-x-3 py-1 border-b border-slate-900/60 last:border-0 text-slate-300">
              <span className="text-slate-500 text-[10px] shrink-0 font-mono">{log.timestamp.split('T')[1]?.replace('Z', '') || log.timestamp}</span>
              
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 ${
                log.level === 'error'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : log.level === 'warn'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-teal-500/20 text-teal-300'
              }`}>
                {log.level}
              </span>

              <span className="text-slate-400 shrink-0 font-bold">[{log.service}]</span>

              <span className="text-slate-200 flex-1">{log.message}</span>

              {log.clinicId && (
                <span className="text-[10px] text-cyan-400 shrink-0 font-mono">ID: {log.clinicId}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
