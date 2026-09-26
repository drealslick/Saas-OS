import React, { createContext, useContext, useState, useEffect } from 'react';
import { Clinic, SupportTicket, GlobalAnnouncement, Invoice, SystemService, SystemLog, PlanTier, ClinicStatus, TicketPriority, TicketStatus, TicketCategory } from '../types';
import { INITIAL_CLINICS, INITIAL_TICKETS, INITIAL_ANNOUNCEMENTS, INITIAL_INVOICES, INITIAL_SERVICES, INITIAL_LOGS } from '../data/mockData';

interface OperatorContextType {
  clinics: Clinic[];
  tickets: SupportTicket[];
  announcements: GlobalAnnouncement[];
  invoices: Invoice[];
  services: SystemService[];
  logs: SystemLog[];
  impersonatedClinic: Clinic | null;
  activeTab: 'clinics' | 'revenue' | 'health' | 'support' | 'announcements';
  setActiveTab: (tab: 'clinics' | 'revenue' | 'health' | 'support' | 'announcements') => void;
  
  // Impersonation
  startImpersonating: (clinic: Clinic) => void;
  stopImpersonating: () => void;
  
  // Clinic Registry Actions
  provisionClinic: (newClinicData: Omit<Clinic, 'id' | 'createdAt' | 'lastActive' | 'patientCount' | 'smsQuotaUsed' | 'smsQuotaTotal'>) => Clinic;
  updateClinic: (id: string, updates: Partial<Clinic>) => void;
  changeClinicStatus: (id: string, status: ClinicStatus) => void;
  changeClinicPlan: (id: string, planTier: PlanTier, newMrr: number) => void;
  
  // Ticket Actions
  addTicketReply: (ticketId: string, text: string, isInternalNote?: boolean) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  updateTicketPriority: (ticketId: string, priority: TicketPriority) => void;
  assignTicketAgent: (ticketId: string, agentName: string) => void;
  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>, initialMessage: string) => void;
  
  // Announcement Actions
  createAnnouncement: (announcement: Omit<GlobalAnnouncement, 'id' | 'createdAt' | 'readCount' | 'authorName'>) => void;
  toggleAnnouncementActive: (id: string) => void;
  deleteAnnouncement: (id: string) => void;
  
  // Revenue Actions
  createInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  retryPayment: (invoiceId: string) => void;
  
  // System Health Actions
  refreshSystemServices: () => void;
  resolveServiceIncident: (serviceId: string) => void;
  addSystemLog: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void;
  
  // Global Demo Reset
  resetToDefaultData: () => void;
}

const OperatorContext = createContext<OperatorContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'chiropulse_operator_state_v1';

export const OperatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'clinics' | 'revenue' | 'health' | 'support' | 'announcements'>('clinics');
  const [impersonatedClinic, setImpersonatedClinic] = useState<Clinic | null>(null);

  const [clinics, setClinics] = useState<Clinic[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_clinics`);
    return saved ? JSON.parse(saved) : INITIAL_CLINICS;
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_tickets`);
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [announcements, setAnnouncements] = useState<GlobalAnnouncement[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_announcements`);
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_invoices`);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [services, setServices] = useState<SystemService[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_services`);
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [logs, setLogs] = useState<SystemLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_logs`);
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_clinics`, JSON.stringify(clinics));
  }, [clinics]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_tickets`, JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_announcements`, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_invoices`, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_services`, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_logs`, JSON.stringify(logs));
  }, [logs]);

  // Impersonation
  const startImpersonating = (clinic: Clinic) => {
    setImpersonatedClinic(clinic);
    addSystemLog({
      level: 'info',
      service: 'auth-service',
      message: `Operator impersonating Dr. ${clinic.doctorName} (${clinic.name})`,
      clinicId: clinic.id
    });
  };

  const stopImpersonating = () => {
    setImpersonatedClinic(null);
  };

  // Clinic Registry
  const provisionClinic = (data: Omit<Clinic, 'id' | 'createdAt' | 'lastActive' | 'patientCount' | 'smsQuotaUsed' | 'smsQuotaTotal'>): Clinic => {
    const id = `cln-${String(clinics.length + 1).padStart(3, '0')}`;
    const smsQuotaMap: Record<PlanTier, number> = { starter: 2000, pro: 5000, agency: 10000 };
    
    const newClinic: Clinic = {
      ...data,
      id,
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'Just now',
      patientCount: 0,
      smsQuotaUsed: 0,
      smsQuotaTotal: smsQuotaMap[data.planTier],
    };

    setClinics(prev => [newClinic, ...prev]);

    // Create inaugural invoice for the new provisioned clinic
    const newInvoice: Invoice = {
      id: `inv-${Math.floor(1000 + Math.random() * 9000)}`,
      clinicId: id,
      clinicName: newClinic.name,
      amount: newClinic.mrr,
      status: 'paid',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      planTier: newClinic.planTier,
      paymentMethod: 'Credit Card on Provisioning',
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`
    };
    setInvoices(prev => [newInvoice, ...prev]);

    addSystemLog({
      level: 'info',
      service: 'clinic-registry',
      message: `Provisioned new clinic: ${newClinic.name} (${newClinic.planTier.toUpperCase()} - $${newClinic.mrr}/mo)`,
      clinicId: id
    });

    return newClinic;
  };

  const updateClinic = (id: string, updates: Partial<Clinic>) => {
    setClinics(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const changeClinicStatus = (id: string, status: ClinicStatus) => {
    setClinics(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    addSystemLog({
      level: 'info',
      service: 'clinic-registry',
      message: `Status changed to '${status}' for clinic ID ${id}`,
      clinicId: id
    });
  };

  const changeClinicPlan = (id: string, planTier: PlanTier, newMrr: number) => {
    const smsQuotaMap: Record<PlanTier, number> = { starter: 2000, pro: 5000, agency: 10000 };
    setClinics(prev => prev.map(c => c.id === id ? {
      ...c,
      planTier,
      mrr: newMrr,
      smsQuotaTotal: smsQuotaMap[planTier]
    } : c));

    addSystemLog({
      level: 'info',
      service: 'billing-service',
      message: `Plan updated to ${planTier.toUpperCase()} ($${newMrr}/mo) for clinic ID ${id}`,
      clinicId: id
    });
  };

  // Ticket Actions
  const addTicketReply = (ticketId: string, text: string, isInternalNote: boolean = false) => {
    const now = new Date().toISOString();
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderName: isInternalNote ? 'Internal Staff' : 'Alex Mercer (Operator)',
      senderRole: 'operator_support' as const,
      senderEmail: 'alex@chiropulse.com',
      timestamp: now,
      text,
      isInternalNote
    };

    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          updatedAt: now,
          status: isInternalNote ? t.status : (t.status === 'open' ? 'in_progress' : t.status),
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    }));
  };

  const updateTicketStatus = (ticketId: string, status: TicketStatus) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t));
  };

  const updateTicketPriority = (ticketId: string, priority: TicketPriority) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, priority, updatedAt: new Date().toISOString() } : t));
  };

  const assignTicketAgent = (ticketId: string, agentName: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, assignedAgent: agentName, updatedAt: new Date().toISOString() } : t));
  };

  const createSupportTicket = (ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>, initialMessage: string) => {
    const id = `tkt-${Math.floor(800 + Math.random() * 100)}`;
    const now = new Date().toISOString();
    const newTicket: SupportTicket = {
      ...ticketData,
      id,
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderName: ticketData.senderEmail,
          senderRole: 'clinic_owner',
          senderEmail: ticketData.senderEmail,
          timestamp: now,
          text: initialMessage
        }
      ]
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  // Announcement Actions
  const createAnnouncement = (announcementData: Omit<GlobalAnnouncement, 'id' | 'createdAt' | 'readCount' | 'authorName'>) => {
    const newAnc: GlobalAnnouncement = {
      ...announcementData,
      id: `anc-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString().split('T')[0],
      readCount: 0,
      authorName: 'Alex Mercer (Platform Operator)'
    };
    setAnnouncements(prev => [newAnc, ...prev]);
    
    addSystemLog({
      level: 'info',
      service: 'announcements',
      message: `Broadcast announcement published: "${newAnc.title}" (Audience: ${newAnc.targetAudience})`
    });
  };

  const toggleAnnouncementActive = (id: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  // Revenue Actions
  const createInvoice = (data: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const invNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInv: Invoice = {
      ...data,
      id: `inv-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceNumber: invNumber
    };
    setInvoices(prev => [newInv, ...prev]);
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
  };

  const retryPayment = (invoiceId: string) => {
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'paid', paymentMethod: inv.paymentMethod.replace('(Expired)', '(Retried OK)') } : inv));
    addSystemLog({
      level: 'info',
      service: 'billing-service',
      message: `Retried automated charge for invoice ${invoiceId}: Transaction approved.`
    });
  };

  // System Health
  const refreshSystemServices = () => {
    setServices(prev => prev.map(s => ({
      ...s,
      latencyMs: s.category === 'database' ? Math.floor(8 + Math.random() * 10) : Math.floor(25 + Math.random() * 50),
      lastUpdated: 'Just now'
    })));
  };

  const resolveServiceIncident = (serviceId: string) => {
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, status: 'operational', details: 'All endpoints operating normally.' } : s));
    addSystemLog({
      level: 'info',
      service: 'ops-monitor',
      message: `Incident manually resolved for service ${serviceId}`
    });
  };

  const addSystemLog = (logData: Omit<SystemLog, 'id' | 'timestamp'>) => {
    const newLog: SystemLog = {
      ...logData,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const resetToDefaultData = () => {
    setClinics(INITIAL_CLINICS);
    setTickets(INITIAL_TICKETS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setInvoices(INITIAL_INVOICES);
    setServices(INITIAL_SERVICES);
    setLogs(INITIAL_LOGS);
    setImpersonatedClinic(null);
    localStorage.clear();
  };

  return (
    <OperatorContext.Provider value={{
      clinics,
      tickets,
      announcements,
      invoices,
      services,
      logs,
      impersonatedClinic,
      activeTab,
      setActiveTab,
      startImpersonating,
      stopImpersonating,
      provisionClinic,
      updateClinic,
      changeClinicStatus,
      changeClinicPlan,
      addTicketReply,
      updateTicketStatus,
      updateTicketPriority,
      assignTicketAgent,
      createSupportTicket,
      createAnnouncement,
      toggleAnnouncementActive,
      deleteAnnouncement,
      createInvoice,
      updateInvoiceStatus,
      retryPayment,
      refreshSystemServices,
      resolveServiceIncident,
      addSystemLog,
      resetToDefaultData
    }}>
      {children}
    </OperatorContext.Provider>
  );
};

export const useOperator = () => {
  const context = useContext(OperatorContext);
  if (!context) {
    throw new Error('useOperator must be used within an OperatorProvider');
  }
  return context;
};
