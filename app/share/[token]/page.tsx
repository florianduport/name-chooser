import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Crown } from 'lucide-react';
import { getPublicResult } from '@/lib/tournaments-db';
import { isUuid } from '@/lib/tokens';
import { translate } from '@/lib/i18n';
import { getPageLocale } from '@/lib/page-locale';
import { EventTracker } from '@/components/EventTracker';
import ShareConversionLink from '@/components/ShareConversionLink';

type PageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { token } = await params;
  const result = isUuid(token) ? await getPublicResult(token) : null;
  const locale = await getPageLocale(searchParams);
  const title = result ? `${result.winner} · LeBabyName` : translate(locale, 'meta.title');
  const description = translate(locale, 'shared.teaser');
  const winner = result?.winner ?? 'LeBabyName';
  const image = `/api/og?lang=${encodeURIComponent(locale)}&kind=result&winner=${encodeURIComponent(winner)}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function SharedResultPage({
  params,
  searchParams,
}: PageProps) {
  const { token } = await params;
  if (!isUuid(token)) notFound();
  const result = await getPublicResult(token);
  if (!result) notFound();
  const locale = await getPageLocale(searchParams);
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);

  return (
    <main className="relative flex min-h-dvh items-center overflow-hidden bg-[#f7f1e8] px-4 py-6 text-stone-900">
      <EventTracker
        event="shared_result_viewed"
        properties={{ share_token: token }}
        databaseEvent={{ eventName: 'shared_result_viewed', shareToken: token, locale }}
      />
      <div aria-hidden="true" className="absolute -right-24 -top-32 size-80 rounded-full bg-rose-200/50 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-28 -left-24 size-80 rounded-full bg-sky-200/50 blur-3xl" />
      <section className="relative mx-auto w-full max-w-lg rounded-3xl border border-white/80 bg-white/85 p-7 text-center shadow-[0_30px_90px_-42px_rgba(77,48,38,0.5)]">
        <Crown aria-hidden="true" className="mx-auto size-10 text-amber-600" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{t('shared.label')}</p>
        <h1 className="mt-2 break-words font-serif text-6xl tracking-[-0.04em]">{result.winner}</h1>
        <p className="mt-4 text-sm leading-6 text-stone-600">{t('shared.teaser')}</p>
        <ShareConversionLink href={`/?lang=${locale}`} label={t('shared.cta')} shareToken={token} locale={locale} />
      </section>
    </main>
  );
}
