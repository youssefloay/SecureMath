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

    if (status === 'APPROVED' || status === 'REJECTED') {
      try {
        const orderDoc = await adminDb.collection('orders').doc(orderId).get();
        const orderData = orderDoc.data();
        if (orderData) {
          const userDoc = await adminDb.collection('users').doc(orderData.userId).get();
          const videoDoc = await adminDb.collection('videos').doc(orderData.videoId).get();
          const studentName = userDoc.data()?.name || 'Student';
          const videoTitle = videoDoc.data()?.title || 'Lesson';
          
          const { sendApprovalEmail, sendRejectionEmail } = await import('@/lib/mail');
          
          if (status === 'APPROVED') {
            await sendApprovalEmail(studentEmail, orderId, studentName, videoTitle);
          } else {
            await sendRejectionEmail(studentEmail, orderId, studentName, "The screenshot provided was unclear or does not match the transaction details.");
          }
        }
      } catch (emailError) {
        console.error("Non-blocking email error:", emailError);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating order:', error);
    return { success: false, error: 'Failed to update order status' };
  }
}
export async function getOrder(id: string) {
  try {
    if (!adminDb) return { success: false, error: "Admin SDK not configured." };
    const doc = await adminDb.collection('orders').doc(id).get();
    if (!doc.exists) return { success: false, error: "Order not found." };
    return { success: true, data: { id: doc.id, ...doc.data() } as any };
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return { success: false, error: error.message };
  }
}
