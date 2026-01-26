import { NextRequest, NextResponse } from 'next/server';
import { nameExists, getNames } from '@/lib/db';
import { Gender } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { names, gender } = body;
    
    if (!Array.isArray(names)) {
      return NextResponse.json(
        { error: 'names doit être un tableau' },
        { status: 400 }
      );
    }
    
    if (!gender || (gender !== 'boy' && gender !== 'girl')) {
      return NextResponse.json(
        { error: 'Le genre est requis et doit être "boy" ou "girl"' },
        { status: 400 }
      );
    }
    
    const existingNames: string[] = [];
    const newNames: string[] = [];
    
    for (const name of names) {
      const trimmedName = name.trim();
      if (trimmedName) {
        const exists = await nameExists(trimmedName, gender);
        if (exists) {
          existingNames.push(trimmedName);
        } else {
          newNames.push(trimmedName);
        }
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
