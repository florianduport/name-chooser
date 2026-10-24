import { NextResponse } from 'next/server';
import { getDb, writeDb } from '@/lib/db';
import { mergeDefaultNames } from '@/lib/seed-data';

export async function POST() {
  try {
    const data = mergeDefaultNames(await getDb());
    await writeDb(data);
    
    return NextResponse.json({ 
      success: true, 
      message: `Base initialisée avec ${data.boys.length} prénoms de garçons et ${data.girls.length} prénoms de filles`,
      boysCount: data.boys.length,
      girlsCount: data.girls.length,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'initialisation de la base de données' },
      { status: 500 }
    );
  }
}
