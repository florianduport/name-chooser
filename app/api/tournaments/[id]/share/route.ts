import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/session';
import { createResultShare } from '@/lib/tournaments-db';
import { isUuid } from '@/lib/tokens';
import { getRequestLocale } from '@/lib/locale-server';
import { recordProductEvent } from '@/lib/events';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: 'Tournoi invalide' }, { status: 400 });
  }
  const shared = await createResultShare(userId, id);
  if (!shared) {
    return NextResponse.json({ error: 'Résultat introuvable' }, { status: 404 });
  }
  const origin = process.env.AUTH_URL ?? new URL(request.url).origin;
  const locale = await getRequestLocale();
  await recordProductEvent({
    eventName: 'result_share_created',
    userId,
    tournamentId: id,
    shareToken: shared.share_token,
    locale,
  });
  return NextResponse.json({
    winner: shared.winner,
    url: `${origin}/share/${shared.share_token}?lang=${encodeURIComponent(locale)}`,
  });
}
