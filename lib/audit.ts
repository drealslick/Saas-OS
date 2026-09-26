import { adminDb, FieldValue } from './firebase-admin';

export interface AuditLogEntry {
  operatorUid: string;
  operatorEmail: string;
  action: string;
  targetType: 'clinic' | 'ticket' | 'announcement' | 'invoice' | 'system' | 'impersonation';
  targetId: string;
  metadata?: Record<string, any>;
}

export async function writeAuditLog(entry: AuditLogEntry): Promise<string> {
  try {
    const docRef = await adminDb.collection('operator_audit_log').add({
      operatorUid: entry.operatorUid,
      operatorEmail: entry.operatorEmail,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      metadata: entry.metadata || {},
      serverTimestamp: FieldValue.serverTimestamp(),
      createdAtIso: new Date().toISOString()
    });

    return docRef.id;
  } catch (err) {
    console.error('Error writing operator audit log entry via Admin SDK:', err);
    throw err;
  }
}

export async function getRecentAuditLogs(limitCount: number = 50) {
  try {
    const snapshot = await adminDb
      .collection('operator_audit_log')
      .orderBy('createdAtIso', 'desc')
      .limit(limitCount)
      .get();

    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (err) {
    console.error('Error fetching audit logs via Admin SDK:', err);
    throw err;
  }
}
