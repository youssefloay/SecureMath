'use server';

import { adminDb } from '@/lib/firebase/adminApp';
import { OrderStatus } from '@/types';

export async function updateOrderStatus(orderId: string, status: OrderStatus, studentEmail: string) {
  try {
    const orderRef = adminDb.collection('orders').doc(orderId);
    await orderRef.update({
      status: status,
      updatedAt: Date.now(),
    });

    if (status === 'APPROVED') {
      // PHASE 5: Implementation (Mocking Resend API for now)
      console.log(`[RESEND API MOCK] Sending 'Order Approved' email to ${studentEmail}`);
      console.log(`Email Body: Your lesson is ready. Warning: You have 24 hours and 2 views starting from your first click on the video.`);
      // actual Resend implementation would go here once paid
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating order:', error);
    return { success: false, error: 'Failed to update order status' };
  }
}
