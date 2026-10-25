import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/session';
import { getNotifications } from '@/lib/notifications-db';

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await getNotifications(userId));
}
