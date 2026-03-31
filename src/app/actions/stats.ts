'use server';

import { adminDb } from '@/lib/firebase/adminApp';
import { OrderDoc } from '@/types';

export async function getAnalyticsStats(teacherId?: string) {
  try {
    if (!adminDb) return { success: false, error: "Database not configured." };

    let ordersQuery = adminDb.collection('orders').where('status', '==', 'APPROVED');

    if (teacherId) {
      ordersQuery = ordersQuery.where('teacherId', '==', teacherId);
    }

    const ordersSnapshot = await ordersQuery.orderBy('createdAt', 'asc').get();
    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OrderDoc));

    // 1. Process Revenue over time (Last 7 days)
    const dailyRevenue: Record<string, number> = {};
    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * msPerDay).toLocaleDateString('en-US', { weekday: 'short' });
      dailyRevenue[date] = 0;
    }

    orders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
      if (dailyRevenue[date] !== undefined) {
        dailyRevenue[date] += Number(order.price) || 0;
      }
    });

    const revenueData = Object.entries(dailyRevenue).map(([name, total]) => ({ name, total }));

    // 2. Process Performance per Video
    const videoStats: Record<string, { name: string; sales: number }> = {};
    
    // We need to fetch video titles for better UX
    const videosSnapshot = await adminDb.collection('videos').get();
    const videoNames: Record<string, string> = {};
    videosSnapshot.docs.forEach(doc => {
      videoNames[doc.id] = doc.data().title;
    });

    orders.forEach(order => {
      if (!videoStats[order.videoId]) {
        videoStats[order.videoId] = { name: videoNames[order.videoId] || 'Unknown Course', sales: 0 };
      }
      videoStats[order.videoId].sales += 1;
    });

    const performanceData = Object.values(videoStats)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    return { 
      success: true, 
      data: {
        revenueData,
        performanceData
      }
    };
  } catch (error: any) {
    console.error("Analytics error:", error);
    return { success: false, error: error.message };
  }
}
