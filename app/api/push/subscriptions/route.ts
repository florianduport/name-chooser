import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/session';
import {
  deletePushSubscription,
  savePushSubscription,
} from '@/lib/notifications-db';
import { getRequestLocale } from '@/lib/locale-server';

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { endpoint, keys } = await request.json();
  if (
    typeof endpoint !== 'string' ||
    typeof keys?.p256dh !== 'string' ||
    typeof keys?.auth !== 'string'
  ) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  }
  await savePushSubscription(
    userId,
    { endpoint, p256dh: keys.p256dh, auth: keys.auth },
    await getRequestLocale(),
  );
  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { endpoint } = await request.json();
  if (typeof endpoint !== 'string') {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
  }
  await deletePushSubscription(userId, endpoint);
  return NextResponse.json({ success: true });
}
