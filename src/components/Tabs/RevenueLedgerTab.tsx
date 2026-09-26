import React, { useState } from 'react';
import { useOperator } from '../../context/OperatorContext';
import { Invoice, PlanTier } from '../../types';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  AlertCircle, 
  RefreshCw, 
  Download, 
  Send, 
  Plus, 
  CheckCircle2, 
  Clock, 
  FileText,
  PieChart,
  ArrowUpRight,
  Filter
} from 'lucide-react';

export const RevenueLedgerTab: React.FC = () => {
  const { clinics, invoices, createInvoice, updateInvoiceStatus, retryPayment } = useOperator();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddChargeModalOpen, setIsAddChargeModalOpen] = useState<boolean>(false);

  // New Charge Form
  const [chargeForm, setChargeForm] = useState({
    clinicId: clinics[0]?.id || '',
    amount: 150,
    paymentMethod: 'Credit Card (Stripe On-File)',
    planTier: 'pro' as PlanTier,
    status: 'paid' as Invoice['status']
  });

  // Calculate Metrics
  const activePayingClinics = clinics.filter(c => c.status === 'active');
  const totalMrr = clinics.reduce((acc, c) => c.status === 'active' || c.status === 'trial' ? acc + c.mrr : acc, 0);
  const arr = totalMrr * 12;
  const arpu = activePayingClinics.length > 0 ? Math.round(totalMrr / activePayingClinics.length) : 0;

  // Breakdown by Tier
  const starterMrr = clinics.filter(c => c.planTier === 'starter' && c.status !== 'suspended').reduce((s, c) => s + c.mrr, 0);
  const proMrr = clinics.filter(c => c.planTier === 'pro' && c.status !== 'suspended').reduce((s, c) => s + c.mrr, 0);
  const agencyMrr = clinics.filter(c => c.planTier === 'agency' && c.status !== 'suspended').reduce((s, c) => s + c.mrr, 0);

  // Filter Invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesSearch = inv.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) || inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateCharge = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClinic = clinics.find(c => c.id === chargeForm.clinicId) || clinics[0];
    createInvoice({
      clinicId: targetClinic.id,
      clinicName: targetClinic.name,
      amount: chargeForm.amount,
      status: chargeForm.status,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      planTier: chargeForm.planTier,
      paymentMethod: chargeForm.paymentMethod
    });
    setIsAddChargeModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Revenue & MRR Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor platform MRR, ARR, Average Revenue Per User (ARPU), and track subscription invoice events.
          </p>
        </div>

        <button
          onClick={() => setIsAddChargeModalOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Record Custom Charge / Credit</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Monthly Recurring Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-2 font-mono">${totalMrr.toLocaleString()}</p>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-300/90 mt-2 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% MoM Growth</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Annual Run-Rate (ARR)</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-white mt-2 font-mono">${arr.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">Projected 12-Month Contract Value</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Average Revenue / Practice (ARPU)</span>
            <CreditCard className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-white mt-2 font-mono">${arpu}</p>
          <p className="text-[11px] text-purple-300/80 mt-2 font-mono">Driven by Pro & Agency upgrades</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Paid vs Trial Conversion</span>
            <ArrowUpRight className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-3xl font-black text-white mt-2 font-mono">92.4%</p>
          <p className="text-[11px] text-teal-300/80 mt-2 font-mono">Trial-to-Paid velocity: 8.4 days</p>
        </div>
      </div>

      {/* Plan MRR Breakdown Visualizer */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-teal-400" />
          MRR Distribution by Subscription Tier
        </h3>

        {/* Stacked Progress Bar */}
        <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
          <div 
            style={{ width: `${(starterMrr / (totalMrr || 1)) * 100}%` }} 
            className="bg-slate-500 h-full rounded-l-sm transition-all" 
            title={`Starter Tier: $${starterMrr}`} 
          />
          <div 
            style={{ width: `${(proMrr / (totalMrr || 1)) * 100}%` }} 
            className="bg-cyan-500 h-full transition-all" 
            title={`Pro Tier: $${proMrr}`} 
          />
          <div 
            style={{ width: `${(agencyMrr / (totalMrr || 1)) * 100}%` }} 
            className="bg-purple-500 h-full rounded-r-sm transition-all" 
            title={`Agency Tier: $${agencyMrr}`} 
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <span className="text-slate-300 font-semibold">Starter ($199/mo)</span>
            </div>
            <p className="text-lg font-bold text-white font-mono mt-1">${starterMrr.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500">
              {((starterMrr / (totalMrr || 1)) * 100).toFixed(1)}% of total MRR
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <span className="text-cyan-300 font-semibold">Pro ($399/mo)</span>
            </div>
            <p className="text-lg font-bold text-cyan-400 font-mono mt-1">${proMrr.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500">
              {((proMrr / (totalMrr || 1)) * 100).toFixed(1)}% of total MRR
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-purple-300 font-semibold">Agency ($799/mo)</span>
            </div>
            <p className="text-lg font-bold text-purple-400 font-mono mt-1">${agencyMrr.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500">
              {((agencyMrr / (totalMrr || 1)) * 100).toFixed(1)}% of total MRR
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Ledger Table Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Billing & Invoice Ledger</h3>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search invoice number or clinic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Invoice Statuses</option>
              <option value="paid">Paid Only</option>
              <option value="pending">Pending Only</option>
              <option value="failed">Failed / Dunning</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Invoice #</th>
                <th className="py-3 px-4 font-semibold">Clinic Name</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Payment Method</th>
                <th className="py-3 px-4 font-semibold">Issue Date</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{inv.clinicName}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{inv.planTier} Tier</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                    ${inv.amount}
                  </td>
                  <td className="py-3.5 px-4">
                    {inv.status === 'paid' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    )}
                    {inv.status === 'pending' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                    {inv.status === 'failed' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-fit">
                        <AlertCircle className="w-3 h-3" /> Payment Failed
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                    {inv.paymentMethod}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {inv.date}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {inv.status === 'failed' && (
                        <button
                          onClick={() => retryPayment(inv.id)}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded text-xs font-bold transition flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> Retry Charge
                        </button>
                      )}

                      <button
                        onClick={() => alert(`Receipt downloaded for ${inv.invoiceNumber} (${inv.clinicName})`)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                        title="Download Invoice PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Custom Charge Modal */}
      {isAddChargeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Record Custom Charge / Credit
              </h3>
              <button onClick={() => setIsAddChargeModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateCharge} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Clinic</label>
                <select
                  value={chargeForm.clinicId}
                  onChange={(e) => setChargeForm(prev => ({ ...prev, clinicId: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  {clinics.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.doctorName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Amount ($)</label>
                <input
                  type="number"
                  required
                  value={chargeForm.amount}
                  onChange={(e) => setChargeForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Payment Description / Method</label>
                <input
                  type="text"
                  required
                  value={chargeForm.paymentMethod}
                  onChange={(e) => setChargeForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddChargeModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl"
                >
                  Create Invoice Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
