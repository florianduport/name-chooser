import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/session';
import {
  createPersistedTournament,
  getTournamentResults,
} from '@/lib/tournaments-db';
import { normalizeName, validateName } from '@/lib/db';

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  return NextResponse.json({ results: await getTournamentResults(userId) });
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { gender, mode, names } = await request.json();
  if (gender !== 'boy' && gender !== 'girl') {
    return NextResponse.json({ error: 'Genre invalide' }, { status: 400 });
  }
  if (mode !== 'database' && mode !== 'custom') {
    return NextResponse.json({ error: 'Mode invalide' }, { status: 400 });
  }
  if (
    !Array.isArray(names) ||
    names.length < 2 ||
    names.length > 256 ||
    names.some((name) => validateName(name))
  ) {
    return NextResponse.json(
      { error: 'Le tournoi doit contenir entre 2 et 256 prénoms valides' },
      { status: 400 },
    );
  }

  const normalizedNames = Array.from(
    new Map(
      names.map((name: string) => {
        const normalized = normalizeName(name);
        return [normalized.toLocaleLowerCase('fr'), normalized];
      }),
    ).values(),
  );
  if (normalizedNames.length < 2) {
    return NextResponse.json(
      { error: 'Le tournoi doit contenir deux prénoms différents' },
      { status: 400 },
    );
  }

  const id = await createPersistedTournament(
    userId,
    gender,
    mode,
    normalizedNames,
  );
  return NextResponse.json({ id }, { status: 201 });
}
