import { NextResponse } from 'next/server';
import { isPushConfigured } from '@/lib/push';

export async function GET() {
  return NextResponse.json({
    enabled: isPushConfigured(),
    publicKey: isPushConfigured() ? process.env.VAPID_PUBLIC_KEY : null,
  });
}
