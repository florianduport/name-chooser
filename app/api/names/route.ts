import { NextRequest, NextResponse } from 'next/server';
import { addName, getNames, validateName } from '@/lib/db';
import { Gender } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const gender = searchParams.get('gender') as Gender | null;
    
    if (!gender || (gender !== 'boy' && gender !== 'girl')) {
      return NextResponse.json(
        { error: 'Le paramètre gender est requis et doit être "boy" ou "girl"' },
        { status: 400 }
      );
    }
    
    const names = await getNames(gender);
    return NextResponse.json({ names });
  } catch (error) {
    console.error('Error fetching names:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des noms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, gender } = body;
    
    const validationError = validateName(name);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }
    
    if (!gender || (gender !== 'boy' && gender !== 'girl')) {
      return NextResponse.json(
        { error: 'Le genre est requis et doit être "boy" ou "girl"' },
        { status: 400 }
      );
    }
    
    const result = await addName(name, gender);
    return NextResponse.json(result, { status: result.created ? 201 : 200 });
  } catch (error) {
    console.error('Error adding name:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout du nom' },
      { status: 500 }
    );
  }
}
