import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    const boysCount = db.boys.length;
    const girlsCount = db.girls.length;
    
    return NextResponse.json({ 
      initialized: boysCount > 0 && girlsCount > 0,
      boysCount,
      girlsCount 
    });
  } catch (error) {
    console.error('Error checking database:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de la base de données' },
      { status: 500 }
    );
  }
}
