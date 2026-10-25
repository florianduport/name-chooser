import { cookies, headers } from 'next/headers';
import { resolveLocale, type Locale } from '@/lib/i18n';

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const saved = cookieStore.get('lebabyname-locale')?.value;
  if (saved) return resolveLocale(saved);
  const headerStore = await headers();
  return resolveLocale(headerStore.get('accept-language'));
}
