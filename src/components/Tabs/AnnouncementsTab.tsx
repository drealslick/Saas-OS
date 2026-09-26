import React, { useState } from 'react';
import { useOperator } from '../../context/OperatorContext';
import { AnnouncementType, AnnouncementTarget } from '../../types';
import { 
  Megaphone, 
  Sparkles, 
  Plus, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  Radio, 
  Users, 
  Layers, 
  AlertTriangle,
  FileText,
  Send
} from 'lucide-react';

export const AnnouncementsTab: React.FC = () => {
  const { announcements, createAnnouncement, toggleAnnouncementActive, deleteAnnouncement } = useOperator();

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isDraftingAi, setIsDraftingAi] = useState(false);

  // Composer Form State
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'feature' as AnnouncementType,
    targetAudience: 'all' as AnnouncementTarget,
    topicBrief: ''
  });

  const handleAiGenerate = async () => {
    if (!form.topicBrief) {
      alert('Please enter a short topic brief for Gemini AI (e.g., "SOAP Note v3 Release").');
      return;
    }

    setIsDraftingAi(true);
    try {
      const response = await fetch('/api/ai/generate-announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: form.topicBrief,
          audience: form.targetAudience,
          type: form.type,
          summaryNotes: form.message || 'Platform enhancements and improved EHR sync performance.'
        }),
      });

      const data = await response.json();
      if (data.title && data.message) {
        setForm(prev => ({
          ...prev,
          title: data.title,
          message: data.message
        }));
      }
    } catch (err) {
      console.error('Failed to generate announcement with AI:', err);
    } finally {
      setIsDraftingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.message) return;

    createAnnouncement({
      title: form.title,
      message: form.message,
      type: form.type,
      targetAudience: form.targetAudience,
      active: true
    });

    setIsComposerOpen(false);
    setForm({
      title: '',
      message: '',
      type: 'feature',
      targetAudience: 'all',
      topicBrief: ''
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-teal-400" />
            Global Announcements & Broadcast Manager
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Broadcast platform release notes, maintenance alerts, and feature updates directly to clinic dashboards.
          </p>
        </div>

        <button
          onClick={() => setIsComposerOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-teal-500/20 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Broadcast New Announcement</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {announcements.map((anc) => (
          <div
            key={anc.id}
            className={`bg-slate-900 border rounded-2xl p-5 shadow-lg relative flex flex-col justify-between transition ${
              anc.active ? 'border-teal-500/30' : 'border-slate-800 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    anc.type === 'feature'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : anc.type === 'maintenance'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {anc.type}
                  </span>

                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                    Target: <strong>{anc.targetAudience.toUpperCase()}</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className={`flex items-center gap-1 font-bold ${anc.active ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Radio className="w-3 h-3" />
                    {anc.active ? 'Broadcasting Live' : 'Inactive'}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-white mt-3">{anc.title}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{anc.message}</p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="flex items-center gap-1 text-teal-400">
                  <Eye className="w-3.5 h-3.5" /> {anc.readCount} Clinic Views
                </span>
                <span>•</span>
                <span>{anc.createdAt}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleAnnouncementActive(anc.id)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                    anc.active
                      ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300'
                      : 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-300'
                  }`}
                >
                  {anc.active ? 'Pause Broadcast' : 'Activate Broadcast'}
                </button>

                <button
                  onClick={() => deleteAnnouncement(anc.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                  title="Delete Broadcast"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Composer Modal */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-teal-400" />
                  Compose Broadcast Announcement
                </h3>
                <p className="text-xs text-slate-400">Target specific clinic tiers and generate copy with Gemini AI.</p>
              </div>
              <button onClick={() => setIsComposerOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* AI Prompt Input Bar */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-teal-500/30 space-y-2">
                <label className="block text-teal-300 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  Gemini AI Copywriting Assistant
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter brief topic (e.g. 'Jane App Sync API Update v2')..."
                    value={form.topicBrief}
                    onChange={(e) => setForm(prev => ({ ...prev, topicBrief: e.target.value }))}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={isDraftingAi}
                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold rounded-lg text-xs transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {isDraftingAi ? 'Drafting Copy...' : 'Generate with Gemini'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Announcement Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as AnnouncementType }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="feature">Feature Update 🚀</option>
                    <option value="maintenance">Scheduled Maintenance ⚠️</option>
                    <option value="billing">Billing Notice 💳</option>
                    <option value="alert">Critical Security Alert 🚨</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Target Audience</label>
                  <select
                    value={form.targetAudience}
                    onChange={(e) => setForm(prev => ({ ...prev, targetAudience: e.target.value as AnnouncementTarget }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="all">All Clinics (Starter, Pro, Agency)</option>
                    <option value="starter">Starter Plan Only</option>
                    <option value="pro">Pro Plan Only</option>
                    <option value="agency">Agency Tier Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Title shown on clinic owner dashboard..."
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-bold focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Broadcast Message Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed announcement text..."
                  value={form.message}
                  onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Live Preview Widget */}
              {form.title && (
                <div className="pt-2">
                  <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">
                    Live Clinic Dashboard Preview Card
                  </label>
                  <div className="p-4 bg-slate-950 border border-teal-500/40 rounded-xl">
                    <h4 className="text-sm font-bold text-white">{form.title}</h4>
                    <p className="text-xs text-slate-300 mt-1">{form.message}</p>
                    <div className="mt-2 text-[10px] text-teal-400 font-mono">
                      Target Audience: {form.targetAudience.toUpperCase()} Clinics
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-extrabold shadow-md transition"
                >
                  Publish Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
