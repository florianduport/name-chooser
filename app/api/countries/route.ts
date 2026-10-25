import { NextRequest, NextResponse } from 'next/server';
import {
  getSelectedCountry,
  listCountries,
  setSelectedCountry,
} from '@/lib/db';
import { DEFAULT_COUNTRY, type CountryCode } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/locale-server';
import { getUserId } from '@/lib/session';

const COUNTRY_CODES = new Set<CountryCode>(['FR', 'GB', 'US', 'ES', 'PT', 'IT']);

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const locale = await getRequestLocale();
  const [countries, selected] = await Promise.all([
    listCountries(),
    getSelectedCountry(userId, DEFAULT_COUNTRY[locale], locale),
  ]);
  return NextResponse.json({ countries, selected });
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const locale = await getRequestLocale();
  const { countryCode } = await request.json();
  if (!COUNTRY_CODES.has(countryCode)) {
    return NextResponse.json({ error: 'Invalid country' }, { status: 400 });
  }
  const selected = await setSelectedCountry(userId, countryCode, locale);
  return NextResponse.json({ selected });
}
