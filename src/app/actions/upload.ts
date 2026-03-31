'use server';

import { adminDb } from '@/lib/firebase/adminApp';
import cloudinary from '@/lib/cloudinary';
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

    if (!adminDb) {
      return { success: false, error: "Database not configured." };
    }

    // 1. Generate Order ID
    const orderId = uuidv4();
    
    // 2. Upload to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const cloudinaryResponse: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `proofs/${userId}`,
          public_id: orderId,
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const screenshotUrl = cloudinaryResponse.secure_url;

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
