'use server';

import { adminDb, adminAuth } from '@/lib/firebase/adminApp';
import { VideoDoc, UserDoc } from '@/types';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

const MOCK_VIDEOS = [
  {
    title: "Algebra Mastery: Linear Equations",
    description: "Learn how to solve complex linear equations from scratch with Mr. Smith.",
    price: 250,
    vdoId: "mock_vdo_001",
    teacherId: "seed-teacher-001",
    category: "Algebra",
    teacherName: "Mr. Smith",
    teacherBio: "Mathematics veteran with 15+ years experience in equations.",
    grade: "Grade 10",
    courseType: "Full Course",
    subject: "Math",
  },
  {
    title: "Calculus Fundamentals: Limits",
    description: "The ultimate guide to limits and continuity for high school students.",
    price: 350,
    vdoId: "mock_vdo_002",
    teacherId: "seed-teacher-002",
    category: "Calculus",
    teacherName: "Dr. Doe",
    teacherBio: "Ph.D. in Applied Mathematics focusing on real-world calculus.",
    grade: "Grade 12",
    courseType: "Revision",
    subject: "Math",
  },
  {
    title: "Language: French Grammar",
    description: "Master the basics of French grammar and pronunciation.",
    price: 300,
    vdoId: "mock_vdo_004",
    teacherId: "seed-teacher-003",
    category: "Language",
    teacherName: "Mme. Lefebvre",
    teacherBio: "Native French speaker with 10 years of teaching experience.",
    grade: "Grade 11",
    courseType: "Full Course",
    subject: "French",
  }
];

export async function seedVideos() {
  try {
    if (!adminDb) return { success: false, error: "Admin SDK not configured." };

    const videosCol = adminDb.collection('videos');
    const snapshot = await videosCol.limit(1).get();
    
    if (!snapshot.empty) {
      return { success: false, error: "Videos already exist. Cleanup required for re-seed." };
    }

    for (const v of MOCK_VIDEOS) {
      await videosCol.add({
        ...v,
        createdAt: Date.now(),
      });
    }

    revalidatePath('/');
    return { success: true, message: `Successfully seeded ${MOCK_VIDEOS.length} videos.` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function seedTestUsers() {
  try {
    if (!adminAuth || !adminDb) {
      return { success: false, error: "Firebase Admin credentials missing in .env.local." };
    }

    const testAccounts = [
      { email: 'admin@test.com', password: 'password123', role: 'ADMIN', name: 'Test Admin' },
      { email: 'student@test.com', password: 'password123', role: 'STUDENT', name: 'Test Student' },
    ];

    for (const acc of testAccounts) {
      try {
        const userRecord = await adminAuth.createUser({
          email: acc.email,
          password: acc.password,
          displayName: acc.name,
        });

        const userDoc: UserDoc = {
          uid: userRecord.uid,
          email: acc.email,
          name: acc.name,
          role: acc.role as any,
          currentSessionId: uuidv4(),
          createdAt: Date.now(),
        };

        await adminDb.collection('users').doc(userRecord.uid).set(userDoc);
      } catch (e: any) {
        if (e.code === 'auth/email-already-in-use') continue;
        throw e;
      }
    }

    return { success: true, message: "Test accounts created! \nAdmin: admin@test.com \nStudent: student@test.com \nPassword: password123" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function promoteUserToAdmin(uid: string) {
  try {
    if (!adminDb) return { success: false, error: "Admin SDK not configured." };
    await adminDb.collection('users').doc(uid).update({ role: 'ADMIN' });
    return { success: true, message: "User successfully promoted to ADMIN." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
