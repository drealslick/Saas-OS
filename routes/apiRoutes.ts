import { Router, Request, Response } from 'express';
import { verifyOperatorMiddleware, AuthenticatedRequest } from '../lib/verify-operator';
import { writeAuditLog, getRecentAuditLogs } from '../lib/audit';
import { adminDb } from '../lib/firebase-admin';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };
import { INITIAL_CLINICS, INITIAL_TICKETS, INITIAL_ANNOUNCEMENTS, INITIAL_INVOICES } from '../src/data/mockData';

const router = Router();

// ==========================================
// 0. DIAGNOSTIC ENDPOINT (/api/diagnostic)
// Bypasses operator middleware to verify pure Admin SDK write/delete
// ==========================================
router.get('/diagnostic', async (req: Request, res: Response) => {
  try {
    const testDoc = await adminDb.collection('_diagnostics').add({
      ts: new Date().toISOString(),
      triggeredBy: 'SRE_Admin_SDK_Diagnostic'
    });
    await testDoc.delete();

    res.json({
      ok: true,
      project: firebaseConfig.projectId,
      databaseId: firebaseConfig.firestoreDatabaseId || '(default)',
      message: 'Admin SDK connected and verified write/delete permissions.'
    });
  } catch (err: any) {
    console.error('Admin SDK Diagnostic Failed:', err);
    res.status(500).json({
      ok: false,
      error: err?.message || 'Unknown error',
      code: err?.code || 'ADMIN_SDK_ERROR',
      project: firebaseConfig.projectId
    });
  }
});

// Apply operator verification middleware to all remaining /api routes
router.use(verifyOperatorMiddleware);

// --- SEED DATABASE UTILITY (If Firestore collections are empty) ---
async function ensureDatabaseSeeded() {
  try {
    const clinicsSnap = await adminDb.collection('clinics').limit(1).get();
    if (clinicsSnap.empty) {
      console.log('🌱 Seeding initial clinics and system data into Firestore via Admin SDK...');
      const batch = adminDb.batch();

      INITIAL_CLINICS.forEach(c => {
        batch.set(adminDb.collection('clinics').doc(c.id), c);
      });

      INITIAL_TICKETS.forEach(t => {
        batch.set(adminDb.collection('tickets').doc(t.id), t);
      });

      INITIAL_ANNOUNCEMENTS.forEach(a => {
        batch.set(adminDb.collection('announcements').doc(a.id), a);
      });

      INITIAL_INVOICES.forEach(inv => {
        batch.set(adminDb.collection('invoices').doc(inv.id), inv);
      });

      await batch.commit();
      console.log('✅ Database successfully seeded with practice data via Admin SDK!');
    }
  } catch (err) {
    console.error('Database seed check error:', err);
  }
}

// Ensure database has data on route load
ensureDatabaseSeeded();

// ==========================================
// 1. CLINIC REGISTRY ENDPOINTS (/api/clinics)
// ==========================================

// GET /api/clinics - List clinics (scoped if impersonating)
router.get('/clinics', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const impersonatingClinicId = req.impersonatingClinicId;

    if (impersonatingClinicId) {
      // Scoped read while impersonating
      const doc = await adminDb.collection('clinics').doc(impersonatingClinicId).get();
      if (!doc.exists) {
        return res.json({ clinics: [] });
      }
      return res.json({
        clinics: [{ id: doc.id, ...doc.data() }],
        isScopedImpersonation: true,
        impersonatedClinicId: impersonatingClinicId
      });
    }

    const snapshot = await adminDb.collection('clinics').get();
    const clinics = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    res.json({ clinics });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch clinics', message: err?.message });
  }
});

// POST /api/clinics - Provision new clinic
router.post('/clinics', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, doctorName, ownerEmail, phone, city, state, planTier, mrr, status, ehrIntegration, notes } = req.body;
    const operator = req.operator!;

    if (!name || !doctorName || !ownerEmail) {
      return res.status(400).json({ error: 'Missing required clinic fields (name, doctorName, ownerEmail).' });
    }

    const countSnap = await adminDb.collection('clinics').get();
    const newId = `cln-${String(countSnap.size + 1).padStart(3, '0')}`;
    const smsQuotaMap: Record<string, number> = { starter: 2000, pro: 5000, agency: 10000 };

    const newClinic = {
      id: newId,
      name,
      doctorName,
      ownerEmail,
      phone: phone || '(512) 555-0100',
      city: city || 'Austin',
      state: state || 'TX',
      planTier: planTier || 'pro',
      mrr: mrr || 399,
      status: status || 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'Just now',
      patientCount: 0,
      ehrIntegration: ehrIntegration || 'ChiroTouch',
      smsQuotaUsed: 0,
      smsQuotaTotal: smsQuotaMap[planTier] || 5000,
      notes: notes || ''
    };

    await adminDb.collection('clinics').doc(newId).set(newClinic);

    // Write required audit log entry via Admin SDK
    await writeAuditLog({
      operatorUid: operator.uid,
      operatorEmail: operator.email,
      action: 'CLINIC_PROVISION',
      targetType: 'clinic',
      targetId: newId,
      metadata: {
        clinicName: name,
        doctorName,
        planTier,
        mrr,
        isImpersonatedWrite: Boolean(req.impersonatingClinicId)
      }
    });

    res.status(201).json({ clinic: newClinic });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to provision clinic', message: err?.message });
  }
});

// PATCH /api/clinics/:id/status - Update clinic status
router.patch('/clinics/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const operator = req.operator!;

    await adminDb.collection('clinics').doc(id).update({ status });

    await writeAuditLog({
      operatorUid: operator.uid,
      operatorEmail: operator.email,
      action: 'CLINIC_STATUS_CHANGE',
      targetType: 'clinic',
      targetId: id,
      metadata: { newStatus: status, isImpersonatedWrite: Boolean(req.impersonatingClinicId) }
    });

    res.json({ success: true, id, status });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update clinic status', message: err?.message });
  }
});

// PATCH /api/clinics/:id/plan - Update clinic plan tier
router.patch('/clinics/:id/plan', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { planTier, mrr } = req.body;
    const operator = req.operator!;

    const smsQuotaMap: Record<string, number> = { starter: 2000, pro: 5000, agency: 10000 };
    await adminDb.collection('clinics').doc(id).update({
      planTier,
      mrr,
      smsQuotaTotal: smsQuotaMap[planTier] || 5000
    });

    await writeAuditLog({
      operatorUid: operator.uid,
      operatorEmail: operator.email,
      action: 'CLINIC_PLAN_UPDATE',
      targetType: 'clinic',
      targetId: id,
      metadata: { newPlanTier: planTier, newMrr: mrr, isImpersonatedWrite: Boolean(req.impersonatingClinicId) }
    });

    res.json({ success: true, id, planTier, mrr });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update clinic plan', message: err?.message });
  }
});

// ==========================================
// 2. IMPERSONATION ENDPOINTS (/api/impersonate)
// ==========================================

// POST /api/impersonate/start
router.post('/impersonate/start', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { clinicId, clinicName } = req.body;
    const operator = req.operator!;

    if (!clinicId) {
      return res.status(400).json({ error: 'Missing clinicId for impersonation.' });
    }

    res.cookie('impersonating_clinicId', clinicId, {
      httpOnly: true,
      maxAge: 30 * 60 * 1000, // 30 mins
      sameSite: 'lax',
      path: '/'
    });

    await writeAuditLog({
      operatorUid: operator.uid,
      operatorEmail: operator.email,
      action: 'IMPERSONATE_START',
      targetType: 'impersonation',
      targetId: clinicId,
      metadata: { clinicName, expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() }
    });

    res.json({ success: true, clinicId, message: `Started impersonation session for clinic ${clinicId}` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to start impersonation', message: err?.message });
  }
});

// POST /api/impersonate/end
router.post('/impersonate/end', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.impersonatingClinicId || req.body.clinicId || 'cln-unknown';
    const operator = req.operator!;

    res.clearCookie('impersonating_clinicId', { path: '/' });

    await writeAuditLog({
      operatorUid: operator.uid,
      operatorEmail: operator.email,
      action: 'IMPERSONATE_END',
      targetType: 'impersonation',
      targetId: clinicId,
      metadata: { endedAt: new Date().toISOString() }
    });

    res.json({ success: true, message: 'Impersonation session ended.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to end impersonation', message: err?.message });
  }
});

// ==========================================
// 3. SUPPORT TICKETS ENDPOINTS (/api/tickets)
// ==========================================

// GET /api/tickets
router.get('/tickets', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const snapshot = await adminDb.collection('tickets').get();
    let tickets = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    if (req.impersonatingClinicId) {
      tickets = tickets.filter((t: any) => t.clinicId === req.impersonatingClinicId);
    }

    res.json({ tickets });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch tickets', message: err?.message });
  }
});

// POST /api/tickets/:id/reply
router.post('/tickets/:id/reply', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { text, isInternalNote } = req.body;
    const operator = req.operator!;

    const ticketRef = adminDb.collection('tickets').doc(id);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticketData = ticketDoc.data()!;
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderName: isInternalNote ? 'Internal Staff' : `${operator.name}`,
      senderRole: 'operator_support',
      senderEmail: operator.email,
      timestamp: new Date().toISOString(),
      text,
      isInternalNote: Boolean(isInternalNote)
    };

    const updatedMessages = [...(ticketData.messages || []), newMsg];
    await ticketRef.update({
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
      status: isInternalNote ? ticketData.status : (ticketData.status === 'open' ? 'in_progress' : ticketData.status)
    });

    await writeAuditLog({
      operatorUid: operator.uid,
      operatorEmail: operator.email,
      action: 'TICKET_REPLY',
      targetType: 'ticket',
      targetId: id,
      metadata: { isInternalNote, textPreview: text.slice(0, 100), isImpersonatedWrite: Boolean(req.impersonatingClinicId) }
    });

    res.json({ success: true, message: newMsg });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reply to ticket', message: err?.message });
  }
});

// ==========================================
// 4. ANNOUNCEMENTS ENDPOINTS (/api/announcements)
// ==========================================

// GET /api/announcements
router.get('/announcements', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const snapshot = await adminDb.collection('announcements').get();
    const announcements = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    res.json({ announcements });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch announcements', message: err?.message });
  }
});

// POST /api/announcements
router.post('/announcements', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, message, type, targetAudience } = req.body;
    const operator = req.operator!;

    const id = `anc-${Math.floor(100 + Math.random() * 900)}`;
    const newAnc = {
      id,
      title,
      message,
      type: type || 'feature',
      targetAudience: targetAudience || 'all',
      active: true,
      createdAt: new Date().toISOString().split('T')[0],
      readCount: 0,
      authorName: `${operator.name}`
    };

    await adminDb.collection('announcements').doc(id).set(newAnc);

    await writeAuditLog({
      operatorUid: operator.uid,
      operatorEmail: operator.email,
      action: 'ANNOUNCEMENT_CREATE',
      targetType: 'announcement',
      targetId: id,
      metadata: { title, type, targetAudience, isImpersonatedWrite: Boolean(req.impersonatingClinicId) }
    });

    res.status(201).json({ announcement: newAnc });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to publish announcement', message: err?.message });
  }
});

// ==========================================
// 5. INVOICES ENDPOINTS (/api/invoices)
// ==========================================

// GET /api/invoices
router.get('/invoices', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const snapshot = await adminDb.collection('invoices').get();
    const invoices = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    res.json({ invoices });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch invoices', message: err?.message });
  }
});

// POST /api/invoices/:id/retry
router.post('/invoices/:id/retry', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const operator = req.operator!;

    await adminDb.collection('invoices').doc(id).update({
      status: 'paid',
      paymentMethod: 'Credit Card (Retried OK)'
    });

    await writeAuditLog({
      operatorUid: operator.uid,
      operatorEmail: operator.email,
      action: 'INVOICE_RETRY',
      targetType: 'invoice',
      targetId: id,
      metadata: { status: 'paid', isImpersonatedWrite: Boolean(req.impersonatingClinicId) }
    });

    res.json({ success: true, id, status: 'paid' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retry invoice charge', message: err?.message });
  }
});

// ==========================================
// 6. OPERATOR AUDIT LOGS ENDPOINT (/api/audit-logs)
// ==========================================

// GET /api/audit-logs - View back-office audit log entries
router.get('/audit-logs', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await getRecentAuditLogs(50);
    res.json({ auditLogs: logs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch audit logs', message: err?.message });
  }
});

export default router;
