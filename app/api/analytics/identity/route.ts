import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/session';
import { pool } from '@/lib/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ userId: null, isNew: false });
  const result = await pool.query<{ is_new: boolean }>(
    `SELECT created_at > NOW() - INTERVAL '10 minutes' AS is_new
     FROM users WHERE id = $1`,
    [userId],
  );
  return NextResponse.json({ userId, isNew: result.rows[0]?.is_new ?? false });
}
