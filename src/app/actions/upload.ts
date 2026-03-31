'use server';

import { adminDb, adminStorage } from '@/lib/firebase/adminApp';
import { OrderDoc } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function uploadReceipt(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const videoId = formData.get('videoId') as string;
    const teacherId = formData.get('teacherId') as string;
    const price = Number(formData.get('price'));
    const paymentCode = formData.get('paymentCode') as string;

    if (!file || !userId || !videoId) {
      return { success: false, error: "Missing required fields." };
    }

    if (!adminStorage || !adminDb) {
      return { success: false, error: "Storage not configured." };
    }

    // 1. Generate Order ID
    const orderId = uuidv4();
    const fileName = `proofs/${userId}/${orderId}.jpg`;
    
    // 2. Upload to Firebase Storage via Admin SDK (Bypass CORS)
    const bucket = adminStorage.bucket();
    const blob = bucket.file(fileName);
    const buffer = Buffer.from(await file.arrayBuffer());

    await blob.save(buffer, {
      contentType: file.type,
      metadata: {
        firebaseStorageDownloadTokens: uuidv4(),
      }
    });

    // Generate a public URL (or use the firebase-admin convention)
    // Note: For simplicity in this dev phase, we'll use a direct link format
    const screenshotUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;

    // 3. Create Order Doc
    const newOrder: OrderDoc = {
      id: orderId,
      userId,
      teacherId,
      videoId,
      status: 'PENDING',
      paymentCode,
      screenshotUrl,
      activatedAt: null,
      viewCount: 0,
      price,
      createdAt: Date.now(),
    };

    await adminDb.collection('orders').doc(orderId).set(newOrder);

    return { success: true, orderId };
  } catch (error: any) {
    console.error("Upload error:", error);
    return { success: false, error: error.message || "Failed to process upload." };
  }
}
