import { getRequestLocale } from '@/lib/locale-server';
import { resolveLocale } from '@/lib/i18n';

export async function getPageLocale(
  searchParams?: Promise<{ lang?: string | string[] }>,
) {
  const params = searchParams ? await searchParams : undefined;
  const explicit = Array.isArray(params?.lang) ? params.lang[0] : params?.lang;
  return explicit ? resolveLocale(explicit) : getRequestLocale();
}
