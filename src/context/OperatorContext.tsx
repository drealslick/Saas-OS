import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Clinic, SupportTicket, GlobalAnnouncement, Invoice, SystemService, SystemLog, PlanTier, ClinicStatus, TicketPriority, TicketStatus, TicketCategory } from '../types';
import { INITIAL_CLINICS, INITIAL_TICKETS, INITIAL_ANNOUNCEMENTS, INITIAL_INVOICES, INITIAL_SERVICES, INITIAL_LOGS } from '../data/mockData';

export interface AuditLogItem {
  id: string;
  operatorUid: string;
  operatorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, any>;
  createdAtIso: string;
}

interface OperatorContextType {
  clinics: Clinic[];
  tickets: SupportTicket[];
  announcements: GlobalAnnouncement[];
  invoices: Invoice[];
  services: SystemService[];
  logs: SystemLog[];
  auditLogs: AuditLogItem[];
  impersonatedClinic: Clinic | null;
  activeTab: 'clinics' | 'revenue' | 'health' | 'support' | 'announcements' | 'audit_logs';
  setActiveTab: (tab: 'clinics' | 'revenue' | 'health' | 'support' | 'announcements' | 'audit_logs') => void;
  isLoading: boolean;
  
  // Impersonation
  startImpersonating: (clinic: Clinic) => Promise<void>;
  stopImpersonating: () => Promise<void>;
  
  // Confirmation Modal state for impersonated writes
  impersonatedWriteConfirmation: {
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null;
  closeImpersonatedWriteModal: () => void;
  
  // Clinic Registry Actions
  provisionClinic: (newClinicData: Omit<Clinic, 'id' | 'createdAt' | 'lastActive' | 'patientCount' | 'smsQuotaUsed' | 'smsQuotaTotal'>) => Promise<Clinic | undefined>;
  updateClinic: (id: string, updates: Partial<Clinic>) => void;
  changeClinicStatus: (id: string, status: ClinicStatus) => Promise<void>;
  changeClinicPlan: (id: string, planTier: PlanTier, newMrr: number) => Promise<void>;
  
  // Ticket Actions
  addTicketReply: (ticketId: string, text: string, isInternalNote?: boolean) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  updateTicketPriority: (ticketId: string, priority: TicketPriority) => void;
  assignTicketAgent: (ticketId: string, agentName: string) => void;
  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>, initialMessage: string) => void;
  
  // Announcement Actions
  createAnnouncement: (announcement: Omit<GlobalAnnouncement, 'id' | 'createdAt' | 'readCount' | 'authorName'>) => Promise<void>;
  toggleAnnouncementActive: (id: string) => void;
  deleteAnnouncement: (id: string) => void;
  
  // Revenue Actions
  createInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  retryPayment: (invoiceId: string) => Promise<void>;
  
  // System Health Actions
  refreshSystemServices: () => void;
  resolveServiceIncident: (serviceId: string) => void;
  addSystemLog: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void;
  fetchAuditLogs: () => Promise<void>;
  
  // Global Demo Reset
  resetToDefaultData: () => void;
}

const OperatorContext = createContext<OperatorContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'chiropulse_operator_state_v2';
const AUTH_HEADER = { 'Authorization': 'Bearer dev-operator-token', 'Content-Type': 'application/json' };

export const OperatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'clinics' | 'revenue' | 'health' | 'support' | 'announcements' | 'audit_logs'>('clinics');
  const [impersonatedClinic, setImpersonatedClinic] = useState<Clinic | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [clinics, setClinics] = useState<Clinic[]>(INITIAL_CLINICS);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [announcements, setAnnouncements] = useState<GlobalAnnouncement[]>(INITIAL_ANNOUNCEMENTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [services, setServices] = useState<SystemService[]>(INITIAL_SERVICES);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Confirmation Modal state for Impersonated Writes (Constraint #4)
  const [impersonatedWriteConfirmation, setImpersonatedWriteConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const closeImpersonatedWriteModal = () => setImpersonatedWriteConfirmation(null);

  // Helper to trigger second confirmation modal if operator is currently impersonating
  const executeWithImpersonationGuard = (title: string, description: string, actionFn: () => void) => {
    if (impersonatedClinic) {
      setImpersonatedWriteConfirmation({
        isOpen: true,
        title,
        description: `${description} (Note: You are currently impersonating ${impersonatedClinic.name}).`,
        onConfirm: () => {
          actionFn();
          setImpersonatedWriteConfirmation(null);
        }
      });
    } else {
      actionFn();
    }
  };

  // Fetch data from Server API endpoints (Admin SDK backed)
  const fetchClinics = useCallback(async () => {
    try {
      const res = await fetch('/api/clinics', { headers: AUTH_HEADER });
      if (res.ok) {
        const data = await res.json();
        if (data.clinics && data.clinics.length > 0) {
          setClinics(data.clinics);
        }
      }
    } catch (e) {
      console.warn('API fetch fallback:', e);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch('/api/tickets', { headers: AUTH_HEADER });
      if (res.ok) {
        const data = await res.json();
        if (data.tickets && data.tickets.length > 0) {
          setTickets(data.tickets);
        }
      }
    } catch (e) {
      console.warn('API fetch tickets fallback:', e);
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch('/api/announcements', { headers: AUTH_HEADER });
      if (res.ok) {
        const data = await res.json();
        if (data.announcements && data.announcements.length > 0) {
          setAnnouncements(data.announcements);
        }
      }
    } catch (e) {
      console.warn('API fetch announcements fallback:', e);
    }
  }, []);

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch('/api/invoices', { headers: AUTH_HEADER });
      if (res.ok) {
        const data = await res.json();
        if (data.invoices && data.invoices.length > 0) {
          setInvoices(data.invoices);
        }
      }
    } catch (e) {
      console.warn('API fetch invoices fallback:', e);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/audit-logs', { headers: AUTH_HEADER });
      if (res.ok) {
        const data = await res.json();
        if (data.auditLogs) {
          setAuditLogs(data.auditLogs);
        }
      }
    } catch (e) {
      console.warn('API fetch audit logs fallback:', e);
    }
  }, []);

  useEffect(() => {
    fetchClinics();
    fetchTickets();
    fetchAnnouncements();
    fetchInvoices();
    fetchAuditLogs();
  }, [fetchClinics, fetchTickets, fetchAnnouncements, fetchInvoices, fetchAuditLogs]);

  // Impersonation handlers using httpOnly cookie & IMPERSONATE_START / IMPERSONATE_END
  const startImpersonating = async (clinic: Clinic) => {
    setImpersonatedClinic(clinic);
    try {
      await fetch('/api/impersonate/start', {
        method: 'POST',
        headers: AUTH_HEADER,
        body: JSON.stringify({ clinicId: clinic.id, clinicName: clinic.name })
      });
      fetchAuditLogs();
      fetchClinics(); // Refresh with scoped read
    } catch (e) {
      console.error('Impersonation start error:', e);
    }
  };

  const stopImpersonating = async () => {
    const clinicId = impersonatedClinic?.id;
    setImpersonatedClinic(null);
    try {
      await fetch('/api/impersonate/end', {
        method: 'POST',
        headers: AUTH_HEADER,
        body: JSON.stringify({ clinicId })
      });
      fetchAuditLogs();
      fetchClinics(); // Refresh all
    } catch (e) {
      console.error('Impersonation end error:', e);
    }
  };

  // Provision Clinic via API route
  const provisionClinic = async (data: Omit<Clinic, 'id' | 'createdAt' | 'lastActive' | 'patientCount' | 'smsQuotaUsed' | 'smsQuotaTotal'>) => {
    return new Promise<Clinic | undefined>((resolve) => {
      executeWithImpersonationGuard(
        'Confirm Clinic Provisioning',
        `You are about to provision practice "${data.name}" (${data.planTier.toUpperCase()} Plan).`,
        async () => {
          try {
            const res = await fetch('/api/clinics', {
              method: 'POST',
              headers: AUTH_HEADER,
              body: JSON.stringify(data)
            });

            if (res.ok) {
              const body = await res.json();
              if (body.clinic) {
                setClinics(prev => [body.clinic, ...prev]);
                fetchAuditLogs();
                resolve(body.clinic);
                return;
              }
            }
          } catch (e) {
            console.error('Provision clinic API error:', e);
          }
          // Local state fallback
          const smsQuotaMap: Record<PlanTier, number> = { starter: 2000, pro: 5000, agency: 10000 };
          const newClinic: Clinic = {
            ...data,
            id: `cln-${String(clinics.length + 1).padStart(3, '0')}`,
            createdAt: new Date().toISOString().split('T')[0],
            lastActive: 'Just now',
            patientCount: 0,
            smsQuotaUsed: 0,
            smsQuotaTotal: smsQuotaMap[data.planTier]
          };
          setClinics(prev => [newClinic, ...prev]);
          resolve(newClinic);
        }
      );
    });
  };

  const updateClinic = (id: string, updates: Partial<Clinic>) => {
    setClinics(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const changeClinicStatus = async (id: string, status: ClinicStatus) => {
    executeWithImpersonationGuard(
      'Confirm Status Change',
      `Change practice status for ID ${id} to "${status.toUpperCase()}"?`,
      async () => {
        setClinics(prev => prev.map(c => c.id === id ? { ...c, status } : c));
        try {
          await fetch(`/api/clinics/${id}/status`, {
            method: 'PATCH',
            headers: AUTH_HEADER,
            body: JSON.stringify({ status })
          });
          fetchAuditLogs();
        } catch (e) {
          console.error('Status change API error:', e);
        }
      }
    );
  };

  const changeClinicPlan = async (id: string, planTier: PlanTier, newMrr: number) => {
    executeWithImpersonationGuard(
      'Confirm Subscription Tier Update',
      `Update practice ${id} subscription tier to ${planTier.toUpperCase()} ($${newMrr}/mo)?`,
      async () => {
        const smsQuotaMap: Record<PlanTier, number> = { starter: 2000, pro: 5000, agency: 10000 };
        setClinics(prev => prev.map(c => c.id === id ? { ...c, planTier, mrr: newMrr, smsQuotaTotal: smsQuotaMap[planTier] } : c));

        try {
          await fetch(`/api/clinics/${id}/plan`, {
            method: 'PATCH',
            headers: AUTH_HEADER,
            body: JSON.stringify({ planTier, mrr: newMrr })
          });
          fetchAuditLogs();
        } catch (e) {
          console.error('Plan update API error:', e);
        }
      }
    );
  };

  // Ticket Actions
  const addTicketReply = async (ticketId: string, text: string, isInternalNote: boolean = false) => {
    executeWithImpersonationGuard(
      'Confirm Ticket Reply',
      `Send ${isInternalNote ? 'internal note' : 'reply'} to support thread ${ticketId}?`,
      async () => {
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

        try {
          await fetch(`/api/tickets/${ticketId}/reply`, {
            method: 'POST',
            headers: AUTH_HEADER,
            body: JSON.stringify({ text, isInternalNote })
          });
          fetchAuditLogs();
        } catch (e) {
          console.error('Reply API error:', e);
        }
      }
    );
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
      messages: [{ id: `msg-${Date.now()}`, senderName: ticketData.senderEmail, senderRole: 'clinic_owner', senderEmail: ticketData.senderEmail, timestamp: now, text: initialMessage }]
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  // Announcement Actions
  const createAnnouncement = async (announcementData: Omit<GlobalAnnouncement, 'id' | 'createdAt' | 'readCount' | 'authorName'>) => {
    executeWithImpersonationGuard(
      'Confirm Global Broadcast',
      `Broadcast notice "${announcementData.title}" to target audience ${announcementData.targetAudience.toUpperCase()}?`,
      async () => {
        try {
          const res = await fetch('/api/announcements', {
            method: 'POST',
            headers: AUTH_HEADER,
            body: JSON.stringify(announcementData)
          });
          if (res.ok) {
            const body = await res.json();
            if (body.announcement) {
              setAnnouncements(prev => [body.announcement, ...prev]);
              fetchAuditLogs();
              return;
            }
          }
        } catch (e) {
          console.error('Announcement API error:', e);
        }

        const newAnc: GlobalAnnouncement = {
          ...announcementData,
          id: `anc-${Math.floor(100 + Math.random() * 900)}`,
          createdAt: new Date().toISOString().split('T')[0],
          readCount: 0,
          authorName: 'Alex Mercer (Platform Operator)'
        };
        setAnnouncements(prev => [newAnc, ...prev]);
      }
    );
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
    const newInv: Invoice = { ...data, id: `inv-${Math.floor(1000 + Math.random() * 9000)}`, invoiceNumber: invNumber };
    setInvoices(prev => [newInv, ...prev]);
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
  };

  const retryPayment = async (invoiceId: string) => {
    executeWithImpersonationGuard(
      'Confirm Charge Retry',
      `Retry payment charge for invoice ID ${invoiceId}?`,
      async () => {
        setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'paid', paymentMethod: inv.paymentMethod.replace('(Expired)', '(Retried OK)') } : inv));
        try {
          await fetch(`/api/invoices/${invoiceId}/retry`, {
            method: 'POST',
            headers: AUTH_HEADER
          });
          fetchAuditLogs();
        } catch (e) {
          console.error('Retry invoice API error:', e);
        }
      }
    );
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
  };

  const addSystemLog = (logData: Omit<SystemLog, 'id' | 'timestamp'>) => {
    const newLog: SystemLog = { ...logData, id: `log-${Date.now()}`, timestamp: new Date().toISOString() };
    setLogs(prev => [newLog, ...prev]);
  };

  const resetToDefaultData = () => {
    setClinics(INITIAL_CLINICS);
    setTickets(INITIAL_TICKETS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setInvoices(INITIAL_INVOICES);
    setServices(INITIAL_SERVICES);
    setLogs(INITIAL_LOGS);
    setAuditLogs([]);
    setImpersonatedClinic(null);
  };

  return (
    <OperatorContext.Provider value={{
      clinics,
      tickets,
      announcements,
      invoices,
      services,
      logs,
      auditLogs,
      impersonatedClinic,
      activeTab,
      setActiveTab,
      isLoading,
      startImpersonating,
      stopImpersonating,
      impersonatedWriteConfirmation,
      closeImpersonatedWriteModal,
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
      fetchAuditLogs,
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
