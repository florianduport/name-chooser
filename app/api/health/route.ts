import { NextResponse } from 'next/server';
import { pool } from '@/lib/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await pool.query('SELECT 1');
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({ status: 'error' }, { status: 503 });
  }
}
