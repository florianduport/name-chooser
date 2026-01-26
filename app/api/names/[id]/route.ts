import { NextRequest, NextResponse } from 'next/server';
import { deleteName } from '@/lib/db';
import { Gender } from '@/types';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const gender = searchParams.get('gender') as Gender | null;

    if (!gender || (gender !== 'boy' && gender !== 'girl')) {
      return NextResponse.json(
        { error: 'Le paramètre gender est requis et doit être "boy" ou "girl"' },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: 'L\'ID est requis' },
        { status: 400 }
      );
    }

    const deleted = await deleteName(id, gender);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Nom non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting name:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du nom' },
      { status: 500 }
    );
  }
}
