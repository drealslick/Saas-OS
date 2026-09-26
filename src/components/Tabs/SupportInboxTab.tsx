import React, { useState } from 'react';
import { useOperator } from '../../context/OperatorContext';
import { SupportTicket, TicketStatus, TicketPriority, TicketCategory } from '../../types';
import { 
  Inbox, 
  Search, 
  Sparkles, 
  MessageSquare, 
  Send, 
  Lock, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  Filter,
  Tag,
  Building2,
  ChevronRight,
  Plus
} from 'lucide-react';

export const SupportInboxTab: React.FC = () => {
  const { 
    tickets, 
    clinics,
    addTicketReply, 
    updateTicketStatus, 
    updateTicketPriority, 
    assignTicketAgent,
    createSupportTicket
  } = useOperator();

  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isDraftingAi, setIsDraftingAi] = useState(false);

  // New Ticket Modal
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    clinicId: clinics[0]?.id || '',
    subject: '',
    category: 'technical' as TicketCategory,
    priority: 'medium' as TicketPriority,
    message: ''
  });

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];
  const targetClinic = clinics.find(c => c.id === selectedTicket?.clinicId);

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.senderEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    addTicketReply(selectedTicket.id, replyText, isInternalNote);
    setReplyText('');
  };

  const handleAiDraftReply = async () => {
    if (!selectedTicket) return;
    setIsDraftingAi(true);
    try {
      const response = await fetch('/api/ai/draft-ticket-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketSubject: selectedTicket.subject,
          category: selectedTicket.category,
          clinicName: selectedTicket.clinicName,
          doctorName: targetClinic?.doctorName || 'Doctor',
          planTier: targetClinic?.planTier || 'pro',
          messages: selectedTicket.messages,
          tone: 'helpful, professional, and clear'
        }),
      });

      const data = await response.json();
      if (data.replyText) {
        setReplyText(data.replyText);
      }
    } catch (err) {
      console.error('Error drafting AI reply:', err);
    } finally {
      setIsDraftingAi(false);
    }
  };

  const handleCreateNewTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = clinics.find(cl => cl.id === newTicketForm.clinicId) || clinics[0];
    createSupportTicket({
      clinicId: c.id,
      clinicName: c.name,
      senderEmail: c.ownerEmail,
      subject: newTicketForm.subject,
      category: newTicketForm.category,
      priority: newTicketForm.priority,
      status: 'open',
      assignedAgent: 'Alex Mercer'
    }, newTicketForm.message);

    setIsNewTicketModalOpen(false);
    setNewTicketForm({
      clinicId: clinics[0]?.id || '',
      subject: '',
      category: 'technical',
      priority: 'medium',
      message: ''
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Inbox className="w-5 h-5 text-teal-400" />
            Support Inbox & Threaded Helpdesk
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Reply to clinic owners, draft AI resolutions with Gemini, and manage SLA priorities.
          </p>
        </div>

        <button
          onClick={() => setIsNewTicketModalOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-teal-500/20 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create Internal Ticket</span>
        </button>
      </div>

      {/* Main Split Layout: Ticket List (Left 35%) & Thread Reader (Right 65%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* LEFT COLUMN: Ticket List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col shadow-lg space-y-4">
          {/* Search & Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subject, clinic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting">Waiting</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
              >
                <option value="all">All Categories</option>
                <option value="ehr_sync">EHR Sync</option>
                <option value="billing">Billing</option>
                <option value="patient_portal">Patient Portal</option>
                <option value="technical">Technical</option>
              </select>
            </div>
          </div>

          {/* Ticket Item Cards List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[500px]">
            {filteredTickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-3.5 rounded-xl cursor-pointer border transition ${
                    isSelected
                      ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/10 border-teal-500/50 shadow-md'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">{t.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      t.priority === 'urgent'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                        : t.priority === 'high'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {t.priority}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">{t.subject}</h4>
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span className="truncate font-medium">{t.clinicName}</span>
                    <span className="text-[10px] font-mono text-teal-400">{t.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Thread Viewer & Editor */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
          {selectedTicket ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              {/* Thread Header */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-teal-300 rounded">
                        {selectedTicket.id}
                      </span>
                      <span className="text-xs text-slate-400">• {selectedTicket.category.toUpperCase()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">{selectedTicket.subject}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Clinic: <strong className="text-slate-200">{selectedTicket.clinicName}</strong> ({selectedTicket.senderEmail})
                    </p>
                  </div>

                  {/* Status & Agent Controls */}
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value as TicketStatus)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-teal-300 font-bold focus:outline-none focus:border-teal-500"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting">Waiting for Clinic</option>
                      <option value="resolved">Resolved</option>
                    </select>

                    <select
                      value={selectedTicket.priority}
                      onChange={(e) => updateTicketPriority(selectedTicket.id, e.target.value as TicketPriority)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-teal-500"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto space-y-4 max-h-[360px] pr-2 my-4">
                {selectedTicket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-xl text-xs space-y-1.5 border ${
                      msg.isInternalNote
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-100 ml-6'
                        : msg.senderRole === 'operator_support'
                        ? 'bg-teal-500/10 border-teal-500/30 text-slate-100 ml-6'
                        : 'bg-slate-950 border-slate-800 text-slate-200 mr-6'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] border-b border-slate-800/60 pb-1.5">
                      <div className="flex items-center space-x-2">
                        {msg.isInternalNote && <Lock className="w-3 h-3 text-amber-400" />}
                        <span className="font-bold text-white">{msg.senderName}</span>
                        <span className="text-slate-500 text-[10px]">({msg.senderRole})</span>
                      </div>
                      <span className="text-slate-500 text-[10px] font-mono">{msg.timestamp.split('T')[0]}</span>
                    </div>

                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box with AI Generator */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-300">
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-800 text-teal-500 focus:ring-0"
                      />
                      <span>Post as Internal Staff Note</span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleAiDraftReply}
                    disabled={isDraftingAi}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 hover:from-teal-500/30 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-bold transition disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    <span>{isDraftingAi ? 'Drafting with Gemini...' : 'Draft AI Reply with Gemini'}</span>
                  </button>
                </div>

                <form onSubmit={handleSendReply} className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder={isInternalNote ? "Write internal staff note (visible only to Operators)..." : "Write reply to clinic owner..."}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />

                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs transition disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isInternalNote ? 'Save Internal Note' : 'Send Ticket Reply'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 text-slate-500">
              Select a support ticket from the left panel to inspect thread messages.
            </div>
          )}
        </div>
      </div>

      {/* Create New Ticket Modal */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white">Create Internal Support Ticket</h3>
              <button onClick={() => setIsNewTicketModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateNewTicketSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Target Clinic</label>
                <select
                  value={newTicketForm.clinicId}
                  onChange={(e) => setNewTicketForm(prev => ({ ...prev, clinicId: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                >
                  {clinics.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.doctorName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Subject / Issue</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SOAP Note Export Formatting Query"
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, category: e.target.value as TicketCategory }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="technical">Technical</option>
                    <option value="ehr_sync">EHR Sync</option>
                    <option value="billing">Billing</option>
                    <option value="patient_portal">Patient Portal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Priority</label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, priority: e.target.value as TicketPriority }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Initial Message</label>
                <textarea
                  rows={3}
                  required
                  value={newTicketForm.message}
                  onChange={(e) => setNewTicketForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe the issue reported by the clinic owner..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-500 text-slate-950 font-bold rounded-xl"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
