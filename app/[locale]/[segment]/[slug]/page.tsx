import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Heart, MapPin, Sparkles } from 'lucide-react';
import AffiliateBlock from '@/components/AffiliateBlock';
import { EventTracker } from '@/components/EventTracker';
import AdSlot from '@/components/AdSlot';
import LegalFooter from '@/components/LegalFooter';
import {
  getAllNames,
  getPublicName,
  getRelatedNames,
  isLocale,
  listSlugs,
  nameAlternates,
  namePath,
  parseList,
  SEO_ROUTES,
  seoCopy,
  SITE_URL,
} from '@/lib/seo';
import { SUPPORTED_LOCALES, type Locale } from '@/lib/i18n';

type Props = {
  params: Promise<{ locale: string; segment: string; slug: string }>;
};

export function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((locale) =>
    getAllNames(locale).map((name) => ({
      locale,
      segment: SEO_ROUTES[locale].nameSegment,
      slug: name.slug,
    })),
  );
}

export const dynamicParams = false;
export const dynamic = 'force-static';
export const revalidate = 86_400;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam, segment, slug } = await params;
  if (!isLocale(localeParam) || segment !== SEO_ROUTES[localeParam].nameSegment) return {};
  const locale = localeParam as Locale;
  const name = getPublicName(locale, slug);
  if (!name) return {};
  const copy = seoCopy(locale);
  const title = copy.nameTitle(name.name);
  const description = copy.nameDescription(name.name);
  const canonical = `${SITE_URL}${namePath(locale, name)}`;
  const image = `/api/og?lang=${encodeURIComponent(locale)}&kind=name&winner=${encodeURIComponent(name.name)}`;
  return {
    title,
    description,
    alternates: { canonical, languages: nameAlternates(name) },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonical,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function NamePage({ params }: Props) {
  const { locale: localeParam, segment, slug } = await params;
  if (!isLocale(localeParam) || segment !== SEO_ROUTES[localeParam].nameSegment) notFound();
  const locale = localeParam as Locale;
  const name = getPublicName(locale, slug);
  if (!name) notFound();
  const copy = seoCopy(locale);
  const related = getRelatedNames(locale, name);
  const gender = name.genders.length > 1
    ? copy.unisex
    : name.genders[0] === 'girl' ? copy.girl : copy.boy;
  const primaryGender = name.genders.includes('girl') ? 'girl' : 'boy';
  const canonical = `${SITE_URL}${namePath(locale, name)}`;
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: copy.breadcrumbHome, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: copy.lists, item: `${SITE_URL}/${locale}/${SEO_ROUTES[locale].top}` },
      { '@type': 'ListItem', position: 3, name: name.name, item: canonical },
    ],
  };

  return (
    <main className="min-h-dvh bg-[#f7f1e8] text-stone-900">
      <EventTracker event="name_page_viewed" properties={{ name: name.name, locale }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <header className="border-b border-stone-200/80 bg-white/65">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 font-serif text-lg font-semibold tracking-[-0.03em]">
            <span className="flex size-9 items-center justify-center rounded-full bg-stone-900 text-white">
              <Heart aria-hidden="true" className="size-4" fill="currentColor" />
            </span>
            LeBabyName
          </Link>
          <Link href={`/${locale}/${SEO_ROUTES[locale].top}`} className="text-sm font-medium text-stone-700 underline decoration-stone-300 underline-offset-4 hover:decoration-stone-700">
            {copy.lists}
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <h1 className="break-words font-serif text-6xl leading-none tracking-[-0.04em] sm:text-8xl">{name.name}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">{copy.nameDescription(name.name)}</p>
            <Link
              href={`/tournament?gender=${primaryGender}&name=${encodeURIComponent(name.name)}`}
              className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-stone-900 px-5 py-3 font-semibold text-white hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-700/30"
            >
              <Sparkles aria-hidden="true" className="size-5" />
              {copy.cta(name.name)}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <dl className="divide-y divide-stone-200 border-y border-stone-200">
            <div className="grid grid-cols-[7rem_1fr] gap-4 py-4">
              <dt className="text-sm font-semibold text-stone-500">{copy.gender}</dt>
              <dd className="font-medium">{gender}</dd>
            </div>
            {name.origin && (
              <div className="grid grid-cols-[7rem_1fr] gap-4 py-4">
                <dt className="text-sm font-semibold text-stone-500">{copy.origin}</dt>
                <dd className="font-medium">{name.origin}</dd>
              </div>
            )}
            {name.meaning && (
              <div className="grid grid-cols-[7rem_1fr] gap-4 py-4">
                <dt className="text-sm font-semibold text-stone-500">{copy.meaning}</dt>
                <dd>
                  <span className="font-medium">{name.meaning}</span>
                  {name.meaningSourceUrl && (
                    <a href={name.meaningSourceUrl} rel="noopener noreferrer" target="_blank" className="ml-2 text-xs text-stone-500 underline underline-offset-2">
                      {copy.source}
                    </a>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <section className="mt-14" aria-labelledby="popularity-heading">
          <h2 id="popularity-heading" className="font-serif text-3xl tracking-[-0.03em]">{copy.popularity}</h2>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {name.rankings.sort((a, b) => a.rank - b.rank).map((ranking) => (
              <li key={`${ranking.countryCode}-${ranking.gender}`} className="flex items-center justify-between gap-4 border-b border-stone-200 py-3">
                <span className="flex items-center gap-2 text-sm text-stone-700"><MapPin aria-hidden="true" className="size-4" />{copy.rank(ranking.rank, ranking.countryName, ranking.year)}</span>
                <a href={ranking.sourceUrl} rel="noopener noreferrer" target="_blank" className="shrink-0 text-xs text-stone-500 underline underline-offset-2">{ranking.sourceName}</a>
              </li>
            ))}
          </ul>
        </section>

        <AdSlot placement="name-page" />

        <section className="mt-14" aria-labelledby="related-heading">
          <h2 id="related-heading" className="font-serif text-3xl tracking-[-0.03em]">{copy.related}</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {related.map((candidate) => (
              <li key={candidate.slug}>
                <Link href={namePath(locale, candidate)} className="inline-flex rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium hover:border-stone-500">
                  {candidate.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <AffiliateBlock name={name.name} locale={locale} />

        <nav className="mt-10 border-t border-stone-200 pt-6" aria-label={copy.lists}>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {listSlugs(locale).slice(0, 5).map((listSlug) => (
              <li key={listSlug}><Link href={`/${locale}/${listSlug}`} className="underline decoration-stone-300 underline-offset-4 hover:decoration-stone-700">{parseList(locale, listSlug)?.title ?? listSlug}</Link></li>
            ))}
          </ul>
        </nav>
      </article>
      <LegalFooter locale={locale} />
    </main>
  );
}
