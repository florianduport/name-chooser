import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/session';
import { recordVote, rollbackVotes } from '@/lib/tournaments-db';
import { validateName } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  const { id } = await params;
  const { sequence, round, pair, winner, finalWinner } = await request.json();

  if (
    !Number.isInteger(sequence) ||
    sequence < 0 ||
    !Number.isInteger(round) ||
    round < 1 ||
    !Array.isArray(pair) ||
    (pair.length !== 2 && pair.length !== 3) ||
    pair.some((name) => validateName(name)) ||
    validateName(winner) ||
    (finalWinner !== undefined && validateName(finalWinner))
  ) {
    return NextResponse.json({ error: 'Vote invalide' }, { status: 400 });
  }

  try {
    await recordVote(userId, id, {
      sequence,
      round,
      pair,
      winner,
      finalWinner,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Tournoi introuvable' }, { status: 404 });
    }
    throw error;
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  const { id } = await params;
  const fromSequence = Number(request.nextUrl.searchParams.get('fromSequence'));
  if (!Number.isInteger(fromSequence) || fromSequence < 0) {
    return NextResponse.json({ error: 'Séquence invalide' }, { status: 400 });
  }

  try {
    await rollbackVotes(userId, id, fromSequence);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Tournoi introuvable' }, { status: 404 });
    }
    throw error;
  }
}
