export type PlanTier = 'starter' | 'pro' | 'agency';
export type ClinicStatus = 'active' | 'trial' | 'suspended';
export type EHRSystem = 'ChiroTouch' | 'Jane App' | 'WebPT' | 'Eclipse' | 'Custom CSV';

export interface Clinic {
  id: string;
  name: string;
  doctorName: string;
  ownerEmail: string;
  phone: string;
  city: string;
  state: string;
  planTier: PlanTier;
  mrr: number;
  status: ClinicStatus;
  createdAt: string;
  lastActive: string;
  patientCount: number;
  ehrIntegration: EHRSystem;
  smsQuotaUsed: number;
  smsQuotaTotal: number;
  notes?: string;
}

export type TicketCategory = 'billing' | 'technical' | 'ehr_sync' | 'patient_portal' | 'feature_request';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved';

export interface TicketMessage {
  id: string;
  senderName: string;
  senderRole: 'clinic_owner' | 'operator_support' | 'system';
  senderEmail: string;
  timestamp: string;
  text: string;
  isInternalNote?: boolean;
}

export interface SupportTicket {
  id: string;
  clinicId: string;
  clinicName: string;
  senderEmail: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  assignedAgent?: string;
  messages: TicketMessage[];
}

export type AnnouncementType = 'feature' | 'maintenance' | 'billing' | 'alert';
export type AnnouncementTarget = 'all' | 'starter' | 'pro' | 'agency';

export interface GlobalAnnouncement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  targetAudience: AnnouncementTarget;
  active: boolean;
  createdAt: string;
  readCount: number;
  authorName: string;
}

export interface Invoice {
  id: string;
  clinicId: string;
  clinicName: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  date: string;
  dueDate: string;
  planTier: PlanTier;
  paymentMethod: string;
  invoiceNumber: string;
}

export interface SystemService {
  id: string;
  name: string;
  category: 'core_api' | 'database' | 'gateway' | 'third_party';
  status: 'operational' | 'degraded' | 'outage';
  latencyMs: number;
  uptimePercent: number;
  details: string;
  lastUpdated: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  service: string;
  message: string;
  clinicId?: string;
  code?: string;
}
