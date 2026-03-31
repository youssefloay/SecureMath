import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/adminApp';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    const authHeader = req.headers.get('Authorization');

    if (!orderId || !authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing parameters or authorization' }, { status: 400 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decodedToken.uid;
    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const orderData = orderDoc.data()!;

    // 1. Ownership Check
    if (orderData.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden: Not your order' }, { status: 403 });
    }

    // 2. Payment Check
    if (orderData.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Forbidden: Payment not approved' }, { status: 403 });
    }

    // 3. Activation Logic & DRM Rules
    let { activatedAt, viewCount } = orderData;
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    if (!activatedAt) {
      // First time viewing
      activatedAt = now;
      viewCount = 1;
      await orderRef.update({ activatedAt, viewCount });
    } else {
      // Subsequent viewing
      if (now - activatedAt > TWENTY_FOUR_HOURS) {
         return NextResponse.json({ error: 'Forbidden: Time Expired (24h limit reached)' }, { status: 403 });
      }
      if (viewCount >= 2) {
         return NextResponse.json({ error: 'Forbidden: View Limit Reached (Max 2 views)' }, { status: 403 });
      }
      viewCount++;
      await orderRef.update({ viewCount });
    }

    // 4. Get Video Metadata for vdoId
    const videoRef = adminDb.collection('videos').doc(orderData.videoId);
    const videoDoc = await videoRef.get();
    
    if (!videoDoc.exists) {
      return NextResponse.json({ error: 'Video source not found' }, { status: 404 });
    }
    
    const vdoId = videoDoc.data()?.vdoId;
    if (!vdoId) {
      return NextResponse.json({ error: 'Video configuration missing' }, { status: 500 });
    }

    // 5. VdoCipher API Call (Real Implementation)
    const API_SECRET = process.env.VDOCIPHER_API_SECRET;
    const ip = req.headers.get('x-forwarded-for') || '0.0.0.0';
    const email = decodedToken.email;

    const vdoResponse = await fetch(`https://dev.vdocipher.com/api/videos/${vdoId}/otp`, {
      method: 'POST',
      headers: {
        'Authorization': `Apisecret ${API_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        annotate: `[{"type":"text", "text":"${email}", "alpha":"0.3", "color":"0xFFFFFF", "size":"15", "interval":"5000"}]`,
        // Or simple text format if preferred:
        // annotate: `User: ${email} | IP: ${ip}`
      }),
    });

    if (!vdoResponse.ok) {
       console.error('VdoCipher API Error', await vdoResponse.text());
       return NextResponse.json({ error: 'Video secure gateway error' }, { status: 502 });
    }

    const { otp, playbackInfo } = await vdoResponse.json();

    return NextResponse.json({
      otp,
      playbackInfo,
      remainingTimeMs: TWENTY_FOUR_HOURS - (now - activatedAt),
      viewCount,
    }, { status: 200 });

  } catch (error) {
    console.error('VdoCipher Route Error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
