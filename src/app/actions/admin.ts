'use server';

import { adminAuth, adminDb } from '@/lib/firebase/adminApp';
import { UserDoc } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function createTeacherAccount(data: { name: string; email: string; password: string }) {
  try {
    // 1. Double-check Authorization (In production, verify request context)
    if (!adminAuth || !adminDb) {
      return { success: false, error: "Firebase Admin SDK is not configured. Please add FIREBASE_PRIVATE_KEY to .env.local." };
    }

    // 2. Create Auth User
    const userRecord = await adminAuth.createUser({
      email: data.email,
      password: data.password,
      displayName: data.name,
    });

    // 3. Create Firestore User Document
    const userDoc: UserDoc = {
      uid: userRecord.uid,
      email: data.email,
      name: data.name,
      role: 'TEACHER',
      currentSessionId: uuidv4(),
      createdAt: Date.now(),
    };

    await adminDb.collection('users').doc(userRecord.uid).set(userDoc);

    return { 
      success: true, 
      message: `Teacher ${data.name} created successfully. Password: ${data.password}` 
    };
  } catch (error: any) {
    console.error("Error creating teacher:", error);
    return { success: false, error: error.message || "Failed to create teacher account." };
  }
}
