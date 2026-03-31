import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    console.log('Initializing Firebase Admin with bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

const adminDb = process.env.FIREBASE_PRIVATE_KEY ? admin.firestore() : null!;
const adminAuth = process.env.FIREBASE_PRIVATE_KEY ? admin.auth() : null!;
const adminStorage = process.env.FIREBASE_PRIVATE_KEY ? admin.storage() : null!;

export { adminDb, adminAuth, adminStorage };
