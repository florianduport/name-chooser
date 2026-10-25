import { NextResponse } from 'next/server';
import { DEFAULT_ADSENSE_CLIENT_ID } from '@/lib/adsense';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    adsEnabled: process.env.ADS_ENABLED !== 'false',
    adsenseClientId: process.env.ADSENSE_CLIENT_ID || DEFAULT_ADSENSE_CLIENT_ID,
    adSlots: {
      betweenRounds: process.env.ADSENSE_SLOT_BETWEEN_ROUNDS || null,
      beforeResult: process.env.ADSENSE_SLOT_BEFORE_RESULT || null,
      namePage: process.env.ADSENSE_SLOT_NAME_PAGE || null,
    },
  });
}
