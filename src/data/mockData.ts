import { Clinic, SupportTicket, GlobalAnnouncement, Invoice, SystemService, SystemLog } from '../types';

export const INITIAL_CLINICS: Clinic[] = [
  {
    id: 'cln-001',
    name: 'Spine & Rehab Center of Austin',
    doctorName: 'Dr. Marcus Vance',
    ownerEmail: 'dr.vance@austinspine.com',
    phone: '(512) 890-4431',
    city: 'Austin',
    state: 'TX',
    planTier: 'agency',
    mrr: 799,
    status: 'active',
    createdAt: '2024-01-15',
    lastActive: '2 mins ago',
    patientCount: 1420,
    ehrIntegration: 'ChiroTouch',
    smsQuotaUsed: 8420,
    smsQuotaTotal: 10000,
    notes: 'Multi-location practice expanding to Round Rock in Q4.'
  },
  {
    id: 'cln-002',
    name: 'Apex Chiropractic & Performance',
    doctorName: 'Dr. Sarah Lin',
    ownerEmail: 'sarah@apexchiro.io',
    phone: '(303) 555-0192',
    city: 'Denver',
    state: 'CO',
    planTier: 'pro',
    mrr: 399,
    status: 'active',
    createdAt: '2024-03-01',
    lastActive: '14 mins ago',
    patientCount: 680,
    ehrIntegration: 'Jane App',
    smsQuotaUsed: 3100,
    smsQuotaTotal: 5000,
    notes: 'High volume sports rehab focus.'
  },
  {
    id: 'cln-003',
    name: 'Align Wellness Family Practice',
    doctorName: 'Dr. James Oakley',
    ownerEmail: 'oakley@alignwellness.org',
    phone: '(404) 782-9900',
    city: 'Atlanta',
    state: 'GA',
    planTier: 'starter',
    mrr: 199,
    status: 'active',
    createdAt: '2024-05-12',
    lastActive: '1 hour ago',
    patientCount: 290,
    ehrIntegration: 'WebPT',
    smsQuotaUsed: 1450,
    smsQuotaTotal: 2000,
    notes: 'Solo practitioner, requested automated SOAP note templates.'
  },
  {
    id: 'cln-004',
    name: 'Coastal Chiropractic Institute',
    doctorName: 'Dr. Elena Rostova',
    ownerEmail: 'elena@coastalchirofl.com',
    phone: '(305) 441-2099',
    city: 'Miami',
    state: 'FL',
    planTier: 'agency',
    mrr: 799,
    status: 'active',
    createdAt: '2023-11-20',
    lastActive: '5 mins ago',
    patientCount: 2150,
    ehrIntegration: 'ChiroTouch',
    smsQuotaUsed: 9800,
    smsQuotaTotal: 10000,
    notes: 'Enterprise account. 4 associate chiropractors.'
  },
  {
    id: 'cln-005',
    name: 'Pacific Heights Spinal Care',
    doctorName: 'Dr. David Kim',
    ownerEmail: 'dkim@pacspinal.com',
    phone: '(415) 309-8812',
    city: 'San Francisco',
    state: 'CA',
    planTier: 'pro',
    mrr: 399,
    status: 'trial',
    createdAt: '2026-09-18',
    lastActive: 'Just now',
    patientCount: 410,
    ehrIntegration: 'Jane App',
    smsQuotaUsed: 890,
    smsQuotaTotal: 5000,
    notes: 'Trial ends in 6 days. Evaluating automated patient reminders.'
  },
  {
    id: 'cln-006',
    name: 'Redwood Neuro-Chiropractic',
    doctorName: 'Dr. Rachel Green',
    ownerEmail: 'rachel@redwoodneuro.com',
    phone: '(503) 912-3301',
    city: 'Portland',
    state: 'OR',
    planTier: 'starter',
    mrr: 199,
    status: 'suspended',
    createdAt: '2024-02-10',
    lastActive: '12 days ago',
    patientCount: 180,
    ehrIntegration: 'Eclipse',
    smsQuotaUsed: 2000,
    smsQuotaTotal: 2000,
    notes: 'Payment failed on Sept 14. Contacted owner for updated card.'
  },
  {
    id: 'cln-007',
    name: 'Midwest Spine & Wellness',
    doctorName: 'Dr. Thomas Wright',
    ownerEmail: 'twright@midwestspine.com',
    phone: '(312) 600-4100',
    city: 'Chicago',
    state: 'IL',
    planTier: 'pro',
    mrr: 399,
    status: 'active',
    createdAt: '2024-04-05',
    lastActive: '35 mins ago',
    patientCount: 820,
    ehrIntegration: 'ChiroTouch',
    smsQuotaUsed: 4120,
    smsQuotaTotal: 5000
  },
  {
    id: 'cln-008',
    name: 'Lone Star Family Chiropractic',
    doctorName: 'Dr. Amanda Miller',
    ownerEmail: 'amanda@lonestarchiro.com',
    phone: '(214) 771-3320',
    city: 'Dallas',
    state: 'TX',
    planTier: 'starter',
    mrr: 199,
    status: 'trial',
    createdAt: '2026-09-22',
    lastActive: '3 hours ago',
    patientCount: 150,
    ehrIntegration: 'Custom CSV',
    smsQuotaUsed: 310,
    smsQuotaTotal: 2000
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-801',
    clinicId: 'cln-001',
    clinicName: 'Spine & Rehab Center of Austin',
    senderEmail: 'dr.vance@austinspine.com',
    subject: 'ChiroTouch SOAP Note Sync Intermittent Timeout',
    category: 'ehr_sync',
    priority: 'high',
    status: 'open',
    createdAt: '2026-09-26T08:15:00Z',
    updatedAt: '2026-09-26T09:30:00Z',
    assignedAgent: 'Alex Mercer',
    messages: [
      {
        id: 'msg-101',
        senderName: 'Dr. Marcus Vance',
        senderRole: 'clinic_owner',
        senderEmail: 'dr.vance@austinspine.com',
        timestamp: '2026-09-26T08:15:00Z',
        text: "Hi support team, since this morning around 8:00 AM CST, our staff noticed that SOAP notes generated in ChiroPulse are taking up to 45 seconds to sync into ChiroTouch. Normally it takes 2 seconds. Can you check if the API bridge is experiencing high latency?"
      },
      {
        id: 'msg-102',
        senderName: 'Alex Mercer',
        senderRole: 'operator_support',
        senderEmail: 'alex@chiropulse.com',
        timestamp: '2026-09-26T08:45:00Z',
        text: "Hello Dr. Vance! Thanks for bringing this to our attention. Our engineering team is currently investigating the ChiroTouch v4 endpoint gateway latency. We will follow up shortly with a status update."
      },
      {
        id: 'msg-103',
        senderName: 'Alex Mercer',
        senderRole: 'operator_support',
        senderEmail: 'alex@chiropulse.com',
        timestamp: '2026-09-26T09:00:00Z',
        isInternalNote: true,
        text: "Internal note: Escalated to DevOps. ChiroTouch REST API proxy pool node 3 in US-East was hitting rate limit retries. Cache flush pending."
      }
    ]
  },
  {
    id: 'tkt-802',
    clinicId: 'cln-003',
    clinicName: 'Align Wellness Family Practice',
    senderEmail: 'oakley@alignwellness.org',
    subject: 'Request to add extra SMS package before promo launch',
    category: 'billing',
    priority: 'medium',
    status: 'in_progress',
    createdAt: '2026-09-25T14:20:00Z',
    updatedAt: '2026-09-26T07:10:00Z',
    assignedAgent: 'Sarah Jenkins',
    messages: [
      {
        id: 'msg-201',
        senderName: 'Dr. James Oakley',
        senderRole: 'clinic_owner',
        senderEmail: 'oakley@alignwellness.org',
        timestamp: '2026-09-25T14:20:00Z',
        text: "We are launching a posture assessment promotion next week and want to send an SMS blast to 1,500 inactive patients. We are currently on the Starter tier (2,000 SMS). How can we add a 5,000 SMS add-on pack or temporarily upgrade to Pro?"
      }
    ]
  },
  {
    id: 'tkt-803',
    clinicId: 'cln-005',
    clinicName: 'Pacific Heights Spinal Care',
    senderEmail: 'dkim@pacspinal.com',
    subject: 'Patient Portal SSO Login Error on Mobile App',
    category: 'patient_portal',
    priority: 'urgent',
    status: 'open',
    createdAt: '2026-09-26T09:45:00Z',
    updatedAt: '2026-09-26T09:45:00Z',
    messages: [
      {
        id: 'msg-301',
        senderName: 'Dr. David Kim',
        senderRole: 'clinic_owner',
        senderEmail: 'dkim@pacspinal.com',
        timestamp: '2026-09-26T09:45:00Z',
        text: "Urgent: 3 patients called our front desk stating they receive an 'Invalid Domain Auth (401)' error when trying to access their appointment intake forms via the mobile portal link. Please help!"
      }
    ]
  },
  {
    id: 'tkt-804',
    clinicId: 'cln-006',
    clinicName: 'Redwood Neuro-Chiropractic',
    senderEmail: 'rachel@redwoodneuro.com',
    subject: 'Updating payment method to reactivate account',
    category: 'billing',
    priority: 'low',
    status: 'waiting',
    createdAt: '2026-09-20T11:00:00Z',
    updatedAt: '2026-09-24T16:30:00Z',
    messages: [
      {
        id: 'msg-401',
        senderName: 'Dr. Rachel Green',
        senderRole: 'clinic_owner',
        senderEmail: 'rachel@redwoodneuro.com',
        timestamp: '2026-09-20T11:00:00Z',
        text: "Our corporate card was re-issued due to fraud. I want to add our new credit card so our account is restored."
      }
    ]
  }
];

export const INITIAL_ANNOUNCEMENTS: GlobalAnnouncement[] = [
  {
    id: 'anc-101',
    title: '🚀 AI Spinal SOAP Note Generator v3.2 Released!',
    message: 'We have updated our AI clinical documentation engine with improved ICD-10 anatomical tagging, subluxation mapping, and ICD-10 medical necessity compliance tools.',
    type: 'feature',
    targetAudience: 'all',
    active: true,
    createdAt: '2026-09-20',
    readCount: 128,
    authorName: 'Alex Mercer (Product Lead)'
  },
  {
    id: 'anc-102',
    title: '⚠️ Scheduled Maintenance: ChiroTouch Bridge Maintenance',
    message: 'On Sunday Oct 1 at 2:00 AM EST, the ChiroTouch REST sync bridge will undergo a scheduled database upgrade for 30 minutes.',
    type: 'maintenance',
    targetAudience: 'agency',
    active: true,
    createdAt: '2026-09-24',
    readCount: 42,
    authorName: 'DevOps Ops Team'
  },
  {
    id: 'anc-103',
    title: '📲 Twilio 10DLC Registration Reminder',
    message: 'All clinics sending patient SMS appointment reminders must verify their clinic EIN details under Settings > SMS Branding.',
    type: 'alert',
    targetAudience: 'all',
    active: false,
    createdAt: '2026-09-10',
    readCount: 140,
    authorName: 'Compliance Team'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-9001',
    clinicId: 'cln-001',
    clinicName: 'Spine & Rehab Center of Austin',
    amount: 799,
    status: 'paid',
    date: '2026-09-15',
    dueDate: '2026-09-15',
    planTier: 'agency',
    paymentMethod: 'Visa ending in 4242',
    invoiceNumber: 'INV-2026-0901'
  },
  {
    id: 'inv-9002',
    clinicId: 'cln-002',
    clinicName: 'Apex Chiropractic & Performance',
    amount: 399,
    status: 'paid',
    date: '2026-09-01',
    dueDate: '2026-09-01',
    planTier: 'pro',
    paymentMethod: 'MasterCard ending in 8819',
    invoiceNumber: 'INV-2026-0902'
  },
  {
    id: 'inv-9003',
    clinicId: 'cln-003',
    clinicName: 'Align Wellness Family Practice',
    amount: 199,
    status: 'paid',
    date: '2026-09-12',
    dueDate: '2026-09-12',
    planTier: 'starter',
    paymentMethod: 'Amex ending in 1004',
    invoiceNumber: 'INV-2026-0903'
  },
  {
    id: 'inv-9004',
    clinicId: 'cln-004',
    clinicName: 'Coastal Chiropractic Institute',
    amount: 799,
    status: 'paid',
    date: '2026-08-20',
    dueDate: '2026-08-20',
    planTier: 'agency',
    paymentMethod: 'Visa ending in 9920',
    invoiceNumber: 'INV-2026-0804'
  },
  {
    id: 'inv-9005',
    clinicId: 'cln-006',
    clinicName: 'Redwood Neuro-Chiropractic',
    amount: 199,
    status: 'failed',
    date: '2026-09-14',
    dueDate: '2026-09-14',
    planTier: 'starter',
    paymentMethod: 'Visa ending in 0012 (Expired)',
    invoiceNumber: 'INV-2026-0905'
  },
  {
    id: 'inv-9006',
    clinicId: 'cln-007',
    clinicName: 'Midwest Spine & Wellness',
    amount: 399,
    status: 'pending',
    date: '2026-09-25',
    dueDate: '2026-09-30',
    planTier: 'pro',
    paymentMethod: 'ACH Transfer',
    invoiceNumber: 'INV-2026-0906'
  }
];

export const INITIAL_SERVICES: SystemService[] = [
  {
    id: 'srv-1',
    name: 'Core SaaS App API (US-East)',
    category: 'core_api',
    status: 'operational',
    latencyMs: 38,
    uptimePercent: 99.99,
    details: 'Serving active clinic traffic on Node v20 cluster',
    lastUpdated: '1 min ago'
  },
  {
    id: 'srv-2',
    name: 'ChiroTouch REST Integration Bridge',
    category: 'third_party',
    status: 'degraded',
    latencyMs: 340,
    uptimePercent: 98.42,
    details: 'High rate-limit retries detected on endpoint proxy',
    lastUpdated: '3 mins ago'
  },
  {
    id: 'srv-3',
    name: 'Jane App OAuth & Appointment Sync',
    category: 'third_party',
    status: 'operational',
    latencyMs: 62,
    uptimePercent: 99.95,
    details: 'All webhooks healthy',
    lastUpdated: '2 mins ago'
  },
  {
    id: 'srv-4',
    name: 'Twilio SMS & Patient Reminder Queue',
    category: 'gateway',
    status: 'operational',
    latencyMs: 110,
    uptimePercent: 99.88,
    details: 'Dispatch rate: 1,240 msg/min. Delivery success: 99.4%',
    lastUpdated: 'Just now'
  },
  {
    id: 'srv-5',
    name: 'SendGrid Email Gateway',
    category: 'gateway',
    status: 'operational',
    latencyMs: 85,
    uptimePercent: 99.91,
    details: 'Bounce rate: 0.12%. Spam reports: 0',
    lastUpdated: '4 mins ago'
  },
  {
    id: 'srv-6',
    name: 'Primary Postgres Multi-Region DB',
    category: 'database',
    status: 'operational',
    latencyMs: 12,
    uptimePercent: 99.99,
    details: 'Connection pool: 24/100 active connections. Read replica in sync.',
    lastUpdated: 'Just now'
  }
];

export const INITIAL_LOGS: SystemLog[] = [
  {
    id: 'log-1001',
    timestamp: '2026-09-26T09:58:12Z',
    level: 'info',
    service: 'auth-service',
    message: 'Impersonation token generated for operator Alex Mercer (Target: cln-001 Spine & Rehab)',
    clinicId: 'cln-001'
  },
  {
    id: 'log-1002',
    timestamp: '2026-09-26T09:44:01Z',
    level: 'warn',
    service: 'ehr-sync-worker',
    message: 'ChiroTouch API returned 429 Too Many Requests. Backoff delay set to 4500ms.',
    clinicId: 'cln-001',
    code: 'EHR_RATE_LIMIT'
  },
  {
    id: 'log-1003',
    timestamp: '2026-09-26T09:30:15Z',
    level: 'error',
    service: 'patient-portal-api',
    message: 'JWT verification failed: Invalid Issuer for domain pacspinal.com. Mobile token mismatch.',
    clinicId: 'cln-005',
    code: 'AUTH_JWT_MISMATCH'
  },
  {
    id: 'log-1004',
    timestamp: '2026-09-26T09:12:00Z',
    level: 'info',
    service: 'billing-cron',
    message: 'Monthly MRR subscription charge successfully processed ($799.00) via Stripe.',
    clinicId: 'cln-004'
  },
  {
    id: 'log-1005',
    timestamp: '2026-09-26T08:50:44Z',
    level: 'info',
    service: 'announcement-broadcaster',
    message: 'Broadcast anc-101 delivered to 142 clinic dashboard websockets.',
  }
];
