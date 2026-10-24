import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const database = await getDb();
    return NextResponse.json({
      status: 'ok',
      names: database.boys.length + database.girls.length,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({ status: 'error' }, { status: 503 });
  }
}
