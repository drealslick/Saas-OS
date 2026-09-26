import React, { useState } from 'react';
import { useOperator } from '../../context/OperatorContext';
import { Clinic, PlanTier, ClinicStatus, EHRSystem } from '../../types';
import { 
  Building2, 
  Search, 
  Plus, 
  UserCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  SlidersHorizontal,
  Edit,
  MoreVertical,
  Layers,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export const ClinicRegistryTab: React.FC = () => {
  const { 
    clinics, 
    startImpersonating, 
    provisionClinic, 
    changeClinicStatus, 
    changeClinicPlan,
    updateClinic,
    setActiveTab
  } = useOperator();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedEhr, setSelectedEhr] = useState<string>('all');

  // Modals
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);

  // New Provision Form State
  const [provisionForm, setProvisionForm] = useState({
    name: '',
    doctorName: '',
    ownerEmail: '',
    phone: '',
    city: '',
    state: '',
    planTier: 'pro' as PlanTier,
    mrr: 399,
    status: 'active' as ClinicStatus,
    ehrIntegration: 'ChiroTouch' as EHRSystem,
    notes: ''
  });

  // Handle Plan Tier change in provision form to auto-update standard MRR
  const handlePlanChangeInProvision = (tier: PlanTier) => {
    const mrrMap: Record<PlanTier, number> = { starter: 199, pro: 399, agency: 799 };
    setProvisionForm(prev => ({
      ...prev,
      planTier: tier,
      mrr: mrrMap[tier]
    }));
  };

  const handleProvisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provisionForm.name || !provisionForm.doctorName || !provisionForm.ownerEmail) {
      alert('Please fill in clinic name, doctor name, and owner email.');
      return;
    }

    provisionClinic(provisionForm);
    setIsProvisionModalOpen(false);
    // Reset form
    setProvisionForm({
      name: '',
      doctorName: '',
      ownerEmail: '',
      phone: '',
      city: '',
      state: '',
      planTier: 'pro',
      mrr: 399,
      status: 'active',
      ehrIntegration: 'ChiroTouch',
      notes: ''
    });
  };

  // Filtered Clinics
  const filteredClinics = clinics.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier = selectedTier === 'all' || c.planTier === selectedTier;
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    const matchesEhr = selectedEhr === 'all' || c.ehrIntegration === selectedEhr;

    return matchesSearch && matchesTier && matchesStatus && matchesEhr;
  });

  // Counts
  const totalClinics = clinics.length;
  const activeCount = clinics.filter(c => c.status === 'active').length;
  const trialCount = clinics.filter(c => c.status === 'trial').length;
  const suspendedCount = clinics.filter(c => c.status === 'suspended').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Quick Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-400" />
            Clinic Registry & Fleet Control
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Search, provision new chiropractic practices, adjust plan tiers, and 1-click impersonate.
          </p>
        </div>

        <button
          onClick={() => setIsProvisionModalOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-teal-500/20 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Provision New Clinic</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <p className="text-xs text-slate-400">Total Clinics</p>
          <p className="text-2xl font-black text-white mt-1">{totalClinics}</p>
          <span className="text-[10px] text-teal-400 font-mono">100% Fleet Capacity</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <p className="text-xs text-slate-400">Active Subscriptions</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{activeCount}</p>
          <span className="text-[10px] text-emerald-300/80 font-mono">
            {((activeCount / totalClinics) * 100).toFixed(0)}% Paying Rate
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <p className="text-xs text-slate-400">Trialing Practices</p>
          <p className="text-2xl font-black text-cyan-400 mt-1">{trialCount}</p>
          <span className="text-[10px] text-cyan-300/80 font-mono">14-Day Evaluation</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <p className="text-xs text-slate-400">Suspended / Billing Hold</p>
          <p className="text-2xl font-black text-rose-400 mt-1">{suspendedCount}</p>
          <span className="text-[10px] text-rose-300/80 font-mono">Requires Attention</span>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
        {/* Search Field */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clinic name, doctor, email, city or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Plan Tier Filter */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Plans</option>
            <option value="starter">Starter ($199/mo)</option>
            <option value="pro">Pro ($399/mo)</option>
            <option value="agency">Agency ($799/mo)</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="trial">Trialing Only</option>
            <option value="suspended">Suspended Only</option>
          </select>

          {/* EHR Integration Filter */}
          <select
            value={selectedEhr}
            onChange={(e) => setSelectedEhr(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All EHR Systems</option>
            <option value="ChiroTouch">ChiroTouch</option>
            <option value="Jane App">Jane App</option>
            <option value="WebPT">WebPT</option>
            <option value="Eclipse">Eclipse</option>
            <option value="Custom CSV">Custom CSV</option>
          </select>
        </div>
      </div>

      {/* Clinics Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Clinic & Doctor</th>
                <th className="py-3 px-4 font-semibold">Location & Contact</th>
                <th className="py-3 px-4 font-semibold">Plan & MRR</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Patients & EHR</th>
                <th className="py-3 px-4 font-semibold">Last Active</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredClinics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No clinics matched the search criteria.
                  </td>
                </tr>
              ) : (
                filteredClinics.map((clinic) => (
                  <tr key={clinic.id} className="hover:bg-slate-800/40 transition">
                    {/* Clinic Name & Doctor */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{clinic.name}</div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                        <span className="font-semibold text-slate-300">{clinic.doctorName}</span>
                        <span>•</span>
                        <span className="text-slate-500">{clinic.id}</span>
                      </div>
                    </td>

                    {/* Location & Email */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{clinic.city}, {clinic.state}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] flex items-center space-x-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[160px]">{clinic.ownerEmail}</span>
                      </div>
                    </td>

                    {/* Plan & MRR */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          clinic.planTier === 'agency' 
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : clinic.planTier === 'pro'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {clinic.planTier}
                        </span>
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          ${clinic.mrr}/mo
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {clinic.status === 'active' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      )}
                      {clinic.status === 'trial' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3 animate-pulse" /> Trialing
                        </span>
                      )}
                      {clinic.status === 'suspended' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" /> Suspended
                        </span>
                      )}
                    </td>

                    {/* Patients & EHR */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">
                        {clinic.patientCount.toLocaleString()} patients
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        EHR: {clinic.ehrIntegration}
                      </div>
                    </td>

                    {/* Last Active */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {clinic.lastActive}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* 1-Click Impersonate Button */}
                        <button
                          onClick={() => startImpersonating(clinic)}
                          className="flex items-center space-x-1 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition"
                          title="1-Click Impersonate Workspace"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span className="hidden sm:inline">Impersonate</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingClinic(clinic)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                          title="Edit Clinic Settings"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision New Clinic Modal */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-400" />
                  Provision New Chiropractic Practice
                </h3>
                <p className="text-xs text-slate-400">Instantly create tenant workspace and assign plan tier.</p>
              </div>
              <button
                onClick={() => setIsProvisionModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProvisionSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Clinic / Practice Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Austin Spinal Wellness"
                    value={provisionForm.name}
                    onChange={(e) => setProvisionForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Doctor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jane Doe"
                    value={provisionForm.doctorName}
                    onChange={(e) => setProvisionForm(prev => ({ ...prev, doctorName: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Owner Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@clinic.com"
                    value={provisionForm.ownerEmail}
                    onChange={(e) => setProvisionForm(prev => ({ ...prev, ownerEmail: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    placeholder="(512) 555-0199"
                    value={provisionForm.phone}
                    onChange={(e) => setProvisionForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">City</label>
                  <input
                    type="text"
                    placeholder="Austin"
                    value={provisionForm.city}
                    onChange={(e) => setProvisionForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">State</label>
                  <input
                    type="text"
                    placeholder="TX"
                    value={provisionForm.state}
                    onChange={(e) => setProvisionForm(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Plan Tier Selection */}
              <div className="pt-2">
                <label className="block text-slate-400 mb-1 font-semibold">Subscription Plan Tier</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handlePlanChangeInProvision('starter')}
                    className={`p-3 rounded-xl border text-left transition ${
                      provisionForm.planTier === 'starter'
                        ? 'border-teal-500 bg-teal-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm">Starter</div>
                    <div className="text-teal-400 font-mono font-bold mt-0.5">$199/mo</div>
                    <div className="text-[10px] text-slate-500 mt-1">2,000 SMS • Standard SOAP</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlanChangeInProvision('pro')}
                    className={`p-3 rounded-xl border text-left transition ${
                      provisionForm.planTier === 'pro'
                        ? 'border-cyan-500 bg-cyan-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm">Pro</div>
                    <div className="text-cyan-400 font-mono font-bold mt-0.5">$399/mo</div>
                    <div className="text-[10px] text-slate-500 mt-1">5,000 SMS • Jane & ChiroTouch Sync</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlanChangeInProvision('agency')}
                    className={`p-3 rounded-xl border text-left transition ${
                      provisionForm.planTier === 'agency'
                        ? 'border-purple-500 bg-purple-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm">Agency</div>
                    <div className="text-purple-400 font-mono font-bold mt-0.5">$799/mo</div>
                    <div className="text-[10px] text-slate-500 mt-1">10,000 SMS • Multi-location</div>
                  </button>
                </div>
              </div>

              {/* EHR System & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Primary EHR Integration</label>
                  <select
                    value={provisionForm.ehrIntegration}
                    onChange={(e) => setProvisionForm(prev => ({ ...prev, ehrIntegration: e.target.value as EHRSystem }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="ChiroTouch">ChiroTouch</option>
                    <option value="Jane App">Jane App</option>
                    <option value="WebPT">WebPT</option>
                    <option value="Eclipse">Eclipse</option>
                    <option value="Custom CSV">Custom CSV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Initial Status</label>
                  <select
                    value={provisionForm.status}
                    onChange={(e) => setProvisionForm(prev => ({ ...prev, status: e.target.value as ClinicStatus }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="active">Active (Full Access)</option>
                    <option value="trial">14-Day Trial</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProvisionModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-extrabold shadow-md transition"
                >
                  Confirm Provisioning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Clinic Modal */}
      {editingClinic && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <h3 className="text-base font-bold text-white">
                Edit Settings for {editingClinic.name}
              </h3>
              <button onClick={() => setEditingClinic(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Clinic Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['active', 'trial', 'suspended'] as ClinicStatus[]).map(st => (
                    <button
                      key={st}
                      onClick={() => {
                        changeClinicStatus(editingClinic.id, st);
                        setEditingClinic(prev => prev ? { ...prev, status: st } : null);
                      }}
                      className={`p-2 rounded-lg font-bold capitalize border transition ${
                        editingClinic.status === st 
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Change Plan Tier</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { tier: 'starter', mrr: 199 },
                    { tier: 'pro', mrr: 399 },
                    { tier: 'agency', mrr: 799 }
                  ].map(p => (
                    <button
                      key={p.tier}
                      onClick={() => {
                        changeClinicPlan(editingClinic.id, p.tier as PlanTier, p.mrr);
                        setEditingClinic(prev => prev ? { ...prev, planTier: p.tier as PlanTier, mrr: p.mrr } : null);
                      }}
                      className={`p-2 rounded-lg font-bold capitalize border transition ${
                        editingClinic.planTier === p.tier
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {p.tier} (${p.mrr})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Internal Notes</label>
                <textarea
                  rows={3}
                  value={editingClinic.notes || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateClinic(editingClinic.id, { notes: val });
                    setEditingClinic(prev => prev ? { ...prev, notes: val } : null);
                  }}
                  placeholder="Internal operator notes regarding account status..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setEditingClinic(null)}
                  className="px-4 py-2 bg-teal-500 text-slate-950 font-bold rounded-xl"
                >
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
