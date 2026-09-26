import { adminDb, FieldValue } from './firebase-admin';

export interface AuditLogEntry {
  operatorUid: string;
  operatorEmail: string;
  action: string;
  targetType: 'clinic' | 'ticket' | 'announcement' | 'invoice' | 'system' | 'impersonation';
  targetId: string;
  metadata?: Record<string, any>;
}

export interface StoredAuditLog extends AuditLogEntry {
  id: string;
  createdAtIso: string;
  serverTimestamp?: any;
}

export async function writeAuditLog(entry: AuditLogEntry): Promise<string> {
  const createdAtIso = new Date().toISOString();
  const payload = {
    operatorUid: entry.operatorUid,
    operatorEmail: entry.operatorEmail,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId,
    metadata: entry.metadata || {},
    serverTimestamp: FieldValue.serverTimestamp(),
    createdAtIso
  };

  // Write directly to Firestore via Admin SDK. No in-memory fallback.
  // If this throws, the error propagates to the caller so the mutation fails atomically.
  const docRef = await adminDb.collection('operator_audit_log').add(payload);
  return docRef.id;
}

export async function getRecentAuditLogs(limitCount: number = 50): Promise<StoredAuditLog[]> {
  const snapshot = await adminDb
    .collection('operator_audit_log')
    .orderBy('createdAtIso', 'desc')
    .limit(limitCount)
    .get();

  return snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data()
  })) as StoredAuditLog[];
}
