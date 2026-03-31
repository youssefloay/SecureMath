'use server';

import { adminDb } from '@/lib/firebase/adminApp';
import { VideoDoc } from '@/types';
import { revalidatePath } from 'next/cache';

export async function addVideo(data: Omit<VideoDoc, 'id'>) {
  try {
    if (!adminDb) return { success: false, error: "Admin SDK not configured." };
    
    const docRef = await adminDb.collection('videos').add({
      ...data,
      createdAt: Date.now(),
    });

    revalidatePath('/');
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Error adding video:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteVideo(id: string) {
  try {
    if (!adminDb) return { success: false, error: "Admin SDK not configured." };
    await adminDb.collection('videos').doc(id).delete();
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting video:", error);
    return { success: false, error: error.message };
  }
}
export async function getVideo(id: string) {
  try {
    if (!adminDb) return { success: false, error: "Admin SDK not configured." };
    const doc = await adminDb.collection('videos').doc(id).get();
    if (!doc.exists) return { success: false, error: "Video not found." };
    return { success: true, data: { id: doc.id, ...doc.data() } as VideoDoc };
  } catch (error: any) {
    console.error("Error fetching video:", error);
    return { success: false, error: error.message };
  }
}
