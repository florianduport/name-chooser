import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    adsEnabled: process.env.ADS_ENABLED === 'true',
    adsenseClientId: process.env.ADSENSE_CLIENT_ID || null,
    adSlots: {
      betweenRounds: process.env.ADSENSE_SLOT_BETWEEN_ROUNDS || null,
      beforeResult: process.env.ADSENSE_SLOT_BEFORE_RESULT || null,
    },
  });
}
