import React, { useState } from 'react';
import { useOperator } from '../../context/OperatorContext';
import { 
  Users, 
  Calendar, 
  FileCheck2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Megaphone, 
  AlertTriangle,
  ArrowRight,
  Database,
  MessageSquare,
  Activity,
  Plus
} from 'lucide-react';

export const ClinicPortalSim: React.FC = () => {
  const { impersonatedClinic, announcements, stopImpersonating } = useOperator();
  const [appointments, setAppointments] = useState([
    { id: 'apt-1', time: '09:00 AM', patient: 'Robert Vance', type: 'Spine Adjustment & Decompression', status: 'completed', provider: impersonatedClinic?.doctorName },
    { id: 'apt-2', time: '09:30 AM', patient: 'Samantha Miller', type: 'Initial Intake & X-Ray Review', status: 'completed', provider: impersonatedClinic?.doctorName },
    { id: 'apt-3', time: '10:00 AM', patient: 'David Thorne', type: 'Cervical & Lumbar Adjustment', status: 'in_room', provider: impersonatedClinic?.doctorName },
    { id: 'apt-4', time: '10:30 AM', patient: 'Elena Rostova', type: 'Postural Rehabilitation', status: 'checked_in', provider: impersonatedClinic?.doctorName },
    { id: 'apt-5', time: '11:00 AM', patient: 'Marcus Chen', type: 'Wellness Maintenance', status: 'scheduled', provider: impersonatedClinic?.doctorName },
  ]);

  const [simulatedLog, setSimulatedLog] = useState<string | null>(null);

  if (!impersonatedClinic) return null;

  // Filter announcements for this clinic's tier or target "all"
  const relevantAnnouncements = announcements.filter(a => a.active && (a.targetAudience === 'all' || a.targetAudience === impersonatedClinic.planTier));

  const handleSimulateAction = (actionName: string) => {
    setSimulatedLog(`[Impersonation Sandbox] Executed simulated action: "${actionName}" for ${impersonatedClinic.name}`);
    setTimeout(() => setSimulatedLog(null), 4000);
  };

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 m-4 sm:m-6 shadow-2xl relative overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute -right-12 -bottom-12 opacity-5 pointer-events-none text-teal-500">
        <Users className="w-96 h-96" />
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full">
              SaaS Clinic Workspace Preview
            </span>
            <span className="text-xs text-slate-400">ID: {impersonatedClinic.id}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            Welcome back, {impersonatedClinic.doctorName}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {impersonatedClinic.name} • {impersonatedClinic.city}, {impersonatedClinic.state} • Phone: {impersonatedClinic.phone}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleSimulateAction('SOAP Note Generator Run')}
            className="flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-teal-600/20 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate AI SOAP Note</span>
          </button>

          <button
            onClick={stopImpersonating}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition border border-slate-700"
          >
            Return to Operator Console
          </button>
        </div>
      </div>

      {simulatedLog && (
        <div className="mb-6 p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-xs text-teal-300 font-mono flex items-center justify-between animate-fadeIn">
          <span>{simulatedLog}</span>
          <span className="text-[10px] bg-teal-500/20 px-2 py-0.5 rounded text-teal-200">Sandbox Log</span>
        </div>
      )}

      {/* Broadcast Announcements Banner */}
      {relevantAnnouncements.length > 0 && (
        <div className="mb-6 space-y-2">
          {relevantAnnouncements.map(a => (
            <div key={a.id} className="p-4 bg-slate-950 border border-teal-500/30 rounded-xl flex items-start space-x-3 shadow-md">
              <Megaphone className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{a.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{a.createdAt}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{a.message}</p>
                <div className="mt-2 text-[10px] text-teal-400 flex items-center gap-2 font-mono">
                  <span>Author: {a.authorName}</span>
                  <span>•</span>
                  <span>Target: {a.targetAudience.toUpperCase()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clinic Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Today's Adjustments</span>
            <Calendar className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">18 Patients</p>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
            <span>8 Completed</span> • <span>1 in Adjustment Room</span>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Patients</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{impersonatedClinic.patientCount}</p>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            EHR System: <strong className="text-slate-200">{impersonatedClinic.ehrIntegration}</strong>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>SMS Reminders Quota</span>
            <MessageSquare className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {impersonatedClinic.smsQuotaUsed.toLocaleString()} <span className="text-xs text-slate-500 font-normal">/ {impersonatedClinic.smsQuotaTotal.toLocaleString()}</span>
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-purple-500 h-full rounded-full" 
              style={{ width: `${Math.min(100, (impersonatedClinic.smsQuotaUsed / impersonatedClinic.smsQuotaTotal) * 100)}%` }} 
            />
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>EHR Sync Health</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">Connected</p>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Last sync: 3 mins ago (Sync OK)
          </div>
        </div>
      </div>

      {/* Patient Queue & SOAP Notes Tracker */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-400" />
            Today's Patient Adjustment Queue
          </h3>
          <button 
            onClick={() => handleSimulateAction('Added New Patient Appointment')}
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Walk-in
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Time</th>
                <th className="pb-3 font-semibold">Patient Name</th>
                <th className="pb-3 font-semibold">Treatment Plan</th>
                <th className="pb-3 font-semibold">Provider</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-900/50">
                  <td className="py-3 font-mono text-slate-300">{apt.time}</td>
                  <td className="py-3 font-semibold text-white">{apt.patient}</td>
                  <td className="py-3 text-slate-300">{apt.type}</td>
                  <td className="py-3 text-slate-400">{apt.provider}</td>
                  <td className="py-3">
                    {apt.status === 'completed' && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Adjusted & SOAP Filed
                      </span>
                    )}
                    {apt.status === 'in_room' && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                        In Adjustment Room 2
                      </span>
                    )}
                    {apt.status === 'checked_in' && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Checked In (Waiting)
                      </span>
                    )}
                    {apt.status === 'scheduled' && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                        Scheduled
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleSimulateAction(`Open SOAP Note for ${apt.patient}`)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] transition font-medium"
                    >
                      SOAP Note
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
