import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

// Initialize Admin App with explicit project ID
const app = getApps().length === 0
  ? initializeApp({
      projectId: firebaseConfig.projectId,
    })
  : getApps()[0];

export const adminAuth = getAuth(app);

// Single canonical database ID shared by operator console & practice tenant app
const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';
export const adminDb = getFirestore(app, databaseId);

adminDb.settings({
  ignoreUndefinedProperties: true
});

export { FieldValue };
