import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/session';
import { markNotificationRead } from '@/lib/notifications-db';
import { isUuid } from '@/lib/tokens';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: 'Invalid notification' }, { status: 400 });
  const updated = await markNotificationRead(userId, id);
  return NextResponse.json({ updated });
}
