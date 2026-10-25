import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Heart } from 'lucide-react';
import {
  isLocale,
  listAlternates,
  listSlugs,
  namePath,
  parseList,
  SITE_URL,
} from '@/lib/seo';
import { SUPPORTED_LOCALES, type Locale } from '@/lib/i18n';

type Props = { params: Promise<{ locale: string; segment: string }> };

export function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((locale) =>
    listSlugs(locale).map((segment) => ({ locale, segment })),
  );
}

export const dynamicParams = false;
export const dynamic = 'force-static';
export const revalidate = 86_400;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam, segment } = await params;
  if (!isLocale(localeParam)) return {};
  const locale = localeParam as Locale;
  const list = parseList(locale, segment);
  if (!list) return {};
  const canonical = `${SITE_URL}/${locale}/${segment}`;
  const image = `/api/og?lang=${encodeURIComponent(locale)}&kind=list&winner=${encodeURIComponent(list.title)}`;
  return {
    title: list.title,
    description: list.description,
    alternates: { canonical, languages: listAlternates(list.kind, list.letter) },
    openGraph: {
      type: 'website',
      title: list.title,
      description: list.description,
      url: canonical,
      images: [{ url: image, width: 1200, height: 630, alt: list.title }],
    },
    twitter: { card: 'summary_large_image', title: list.title, description: list.description, images: [image] },
  };
}

export default async function PublicListPage({ params }: Props) {
  const { locale: localeParam, segment } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const list = parseList(locale, segment);
  if (!list) notFound();
  const canonical = `${SITE_URL}/${locale}/${segment}`;
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: list.title,
    numberOfItems: list.names.length,
    itemListElement: list.names.map((name, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: name.name,
      url: `${SITE_URL}${namePath(locale, name)}`,
    })),
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'LeBabyName', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: list.title, item: canonical },
    ],
  };

  return (
    <main className="min-h-dvh bg-[#f7f1e8] text-stone-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <header className="border-b border-stone-200/80 bg-white/65">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 font-serif text-lg font-semibold tracking-[-0.03em]">
            <span className="flex size-9 items-center justify-center rounded-full bg-stone-900 text-white">
              <Heart aria-hidden="true" className="size-4" fill="currentColor" />
            </span>
            LeBabyName
          </Link>
          <Link href={`/?lang=${locale}`} className="inline-flex items-center gap-1 text-sm font-medium text-stone-700">
            Start a duel <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-6xl px-5 py-10 sm:py-16">
        <header className="max-w-4xl">
          <h1 className="font-serif text-5xl leading-[0.98] tracking-[-0.04em] text-balance sm:text-7xl">{list.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">{list.description}</p>
          <p className="mt-3 text-sm text-stone-500">
            <a href={list.dataset.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              {list.dataset.sourceName}
            </a>
            {' · '}{list.dataset.coverageYear}
          </p>
        </header>

        {list.names.length > 0 ? (
          <ol className="mt-12 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {list.names.map((name, index) => {
              const localRanking = name.rankings.find((ranking) =>
                ranking.countryCode === list.dataset.countryCode &&
                (list.kind !== 'boy' && list.kind !== 'girl' || ranking.gender === list.kind),
              );
              return (
                <li key={name.slug} className="group border-t border-stone-300">
                  <Link href={namePath(locale, name)} className="flex items-center justify-between gap-4 py-4 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-rose-700/30">
                    <span className="flex min-w-0 items-baseline gap-3">
                      <span className="w-7 shrink-0 text-right text-xs tabular-nums text-stone-500">{localRanking?.rank ?? index + 1}</span>
                      <span className="truncate font-serif text-2xl tracking-[-0.03em]">{name.name}</span>
                    </span>
                    <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-stone-400 transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-12 border-y border-stone-300 py-8 text-stone-600">No names match this list yet.</p>
        )}

        <nav className="mt-14 border-t border-stone-200 pt-7" aria-label="Related lists">
          <ul className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
            {listSlugs(locale).filter((item) => item !== segment).slice(0, 12).map((item) => (
              <li key={item}><Link href={`/${locale}/${item}`} className="underline decoration-stone-300 underline-offset-4 hover:decoration-stone-700">{item.replaceAll('-', ' ')}</Link></li>
            ))}
          </ul>
        </nav>
      </article>
    </main>
  );
}
