import { NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';
import webpush from 'web-push';

import { prisma } from '../../../../lib/prisma';

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@justeprix.sn',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-justeprix');
    } catch (err) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
    const senderId = decoded.id;

    const body = await request.json();
    const { title, body: messageBody, lat, lng } = body;

    // Fetch all active subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        // Exclude the sender if you don't want them to receive their own alert
        // userId: { not: senderId } 
      }
    });

    const payload = JSON.stringify({
      notification: {
        title: title || 'Rassemblement !',
        body: messageBody || "Un rassemblement a été signalé à proximité.",
        icon: '/icons/icon-192x192.png',
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        data: {
          url: '/map',
          dateOfArrival: Date.now(),
          primaryKey: 1,
          lat,
          lng
        }
      }
    });

    const sendPromises = subscriptions.map((sub: any) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };
      return webpush.sendNotification(pushSubscription, payload).catch((err: any) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription has expired or is no longer valid
          return prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
        console.error('Error sending push notification to user:', sub.userId, err);
      });
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, count: sendPromises.length }, { status: 201 });
  } catch (error) {
    console.error('Alert error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send alert' }, { status: 500 });
  }
}
