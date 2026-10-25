import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_LOCALES } from '@/lib/i18n';

export async function POST(request: NextRequest) {
  const { locale } = await request.json();
  if (!SUPPORTED_LOCALES.includes(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
  }
  const response = NextResponse.json({ locale });
  response.cookies.set('lebabyname-locale', locale, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 31_536_000,
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}
