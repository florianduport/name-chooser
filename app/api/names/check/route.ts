import { NextRequest, NextResponse } from 'next/server';
import { getNames, normalizeName, validateName } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { names, gender } = body;
    
    if (!Array.isArray(names) || names.length < 2 || names.length > 256) {
      return NextResponse.json(
        { error: 'La liste doit contenir entre 2 et 256 prénoms' },
        { status: 400 }
      );
    }
    
    if (!gender || (gender !== 'boy' && gender !== 'girl')) {
      return NextResponse.json(
        { error: 'Le genre est requis et doit être "boy" ou "girl"' },
        { status: 400 }
      );
    }
    
    const invalidName = names.find((name) => validateName(name));
    if (invalidName !== undefined) {
      return NextResponse.json(
        { error: validateName(invalidName) },
        { status: 400 },
      );
    }

    const storedNames = await getNames(gender);
    const storedKeys = new Set(
      storedNames.map((item) => item.name.toLocaleLowerCase('fr')),
    );
    const existingNames: string[] = [];
    const newNames: string[] = [];

    for (const value of names) {
      const name = normalizeName(value);
      if (storedKeys.has(name.toLocaleLowerCase('fr'))) {
        existingNames.push(name);
      } else {
        newNames.push(name);
      }
    }
    
    return NextResponse.json({ existingNames, newNames });
  } catch (error) {
    console.error('Error checking names:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des noms' },
      { status: 500 }
    );
  }
}
