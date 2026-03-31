import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/adminApp';

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json();
    const authHeader = req.headers.get('Authorization');

    if (!title || !authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing title or authorization' }, { status: 400 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decodedToken.uid;
    
    // Check if user is ADMIN or TEACHER
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    if (!userData || (userData.role !== 'ADMIN' && userData.role !== 'TEACHER')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    const API_SECRET = process.env.VDOCIPHER_API_SECRET;
    if (!API_SECRET) {
      return NextResponse.json({ error: 'VdoCipher API Secret not configured' }, { status: 500 });
    }

    // Call VdoCipher API to get upload credentials
    // Note: VdoCipher API v2 uses a PUT/POST request to create a video and get clientPayload
    const response = await fetch(`https://dev.vdocipher.com/api/videos?title=${encodeURIComponent(title)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Apisecret ${API_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('VdoCipher API Error:', errorData);
      return NextResponse.json({ error: 'Failed to initialize upload with VdoCipher', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    
    // data should contain { video_id, clientPayload }
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('VdoCipher Upload Init Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
