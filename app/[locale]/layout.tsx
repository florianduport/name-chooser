import { notFound } from 'next/navigation';
import LocaleProvider from '@/components/LocaleProvider';
import { SUPPORTED_LOCALES } from '@/lib/i18n';
import { isLocale } from '@/lib/seo';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export default async function PublicLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
}
