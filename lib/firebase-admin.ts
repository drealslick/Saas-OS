import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

function createAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // 1. Check for serialized JSON service account in FIREBASE_SERVICE_ACCOUNT
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      console.log('🔐 Initializing Firebase Admin SDK with process.env.FIREBASE_SERVICE_ACCOUNT');
      return initializeApp({
        credential: cert(sa),
        projectId: firebaseConfig.projectId,
      });
    } catch (e) {
      console.warn('⚠️ Could not parse FIREBASE_SERVICE_ACCOUNT JSON:', e);
    }
  }

  // 2. Check for individual private key and client email env vars
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    console.log('🔐 Initializing Firebase Admin SDK with FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL');
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    return initializeApp({
      credential: cert({
        projectId: firebaseConfig.projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      projectId: firebaseConfig.projectId,
    });
  }

  // 3. Fallback to ADC / Project ID configuration
  console.log('⚙️ Initializing Firebase Admin SDK with project ID:', firebaseConfig.projectId);
  return initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const app = createAdminApp();

export const adminAuth: Auth = getAuth(app);

// Always use the single designated database ID from firebase-applet-config.json
export const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';
export const projectId = firebaseConfig.projectId;

export const adminDb: Firestore = (databaseId && databaseId !== '(default)')
  ? getFirestore(app, databaseId)
  : getFirestore(app);

try {
  adminDb.settings({ ignoreUndefinedProperties: true });
} catch {
  // Settings already set
}

export { FieldValue };
