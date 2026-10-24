import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/session';
import { createInvite } from '@/lib/tournaments-db';
import { isUuid } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  const { tournamentId } = await request.json();
  if (typeof tournamentId !== 'string' || !isUuid(tournamentId)) {
    return NextResponse.json({ error: 'Tournoi invalide' }, { status: 400 });
  }
  const token = await createInvite(userId, tournamentId);
  if (!token) {
    return NextResponse.json({ error: 'Résultat introuvable' }, { status: 404 });
  }
  const origin = process.env.AUTH_URL ?? request.nextUrl.origin;
  return NextResponse.json({
    token,
    url: `${origin}/invite/${token}`,
    compareUrl: `${origin}/invites/${token}`,
  });
}
