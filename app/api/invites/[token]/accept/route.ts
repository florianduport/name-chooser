import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/session';
import { acceptInvite } from '@/lib/tournaments-db';
import { isUuid } from '@/lib/tokens';
import { recordProductEvent } from '@/lib/events';
import { getRequestLocale } from '@/lib/locale-server';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  const { token } = await params;
  if (!isUuid(token)) {
    return NextResponse.json({ error: 'Invitation invalide' }, { status: 400 });
  }
  const tournament = await acceptInvite(userId, token);
  if (!tournament) {
    return NextResponse.json(
      { error: 'Cette invitation est invalide ou a expiré' },
      { status: 404 },
    );
  }
  await recordProductEvent({
    eventName: 'invite_accepted',
    userId,
    tournamentId: tournament.id,
    locale: await getRequestLocale(),
    metadata: { inviteToken: token },
  });
  return NextResponse.json(tournament, { status: 201 });
}
