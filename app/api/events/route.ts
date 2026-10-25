import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/session';
import { PRODUCT_EVENT_NAMES, recordProductEvent } from '@/lib/events';
import { isUuid } from '@/lib/tokens';
import { resolveLocale } from '@/lib/i18n';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || !PRODUCT_EVENT_NAMES.includes(body.eventName)) {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
  }
  const tournamentId = typeof body.tournamentId === 'string' && isUuid(body.tournamentId)
    ? body.tournamentId
    : null;
  const shareToken = typeof body.shareToken === 'string' && isUuid(body.shareToken)
    ? body.shareToken
    : null;
  const metadata = body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)
    ? Object.fromEntries(Object.entries(body.metadata).slice(0, 12))
    : {};
  await recordProductEvent({
    eventName: body.eventName,
    userId: await getUserId(),
    tournamentId,
    shareToken,
    locale: resolveLocale(body.locale),
    metadata,
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
