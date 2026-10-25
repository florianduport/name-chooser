import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Heart } from 'lucide-react';
import { SUPPORTED_LOCALES, type Locale } from '@/lib/i18n';
import {
  isLegalPageKey,
  LEGAL_COPY,
  LEGAL_PAGE_KEYS,
  legalPath,
  type LegalPageKey,
} from '@/lib/legal';
import { isLocale, SITE_URL } from '@/lib/seo';
import LegalFooter from '@/components/LegalFooter';

type Props = { params: Promise<{ locale: string; page: string }> };

export function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((locale) =>
    LEGAL_PAGE_KEYS.map((page) => ({ locale, page })),
  );
}

export const dynamicParams = false;
export const dynamic = 'force-static';
export const revalidate = 86_400;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam, page: pageParam } = await params;
  if (!isLocale(localeParam) || !isLegalPageKey(pageParam)) return {};
  const locale = localeParam as Locale;
  const page = pageParam as LegalPageKey;
  const copy = LEGAL_COPY[locale].pages[page];
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: `${SITE_URL}${legalPath(locale, page)}`,
      languages: Object.fromEntries(
        SUPPORTED_LOCALES.map((alternateLocale) => [
          alternateLocale,
          `${SITE_URL}${legalPath(alternateLocale, page)}`,
        ]),
      ),
    },
  };
}

export default async function LegalPage({ params }: Props) {
  const { locale: localeParam, page: pageParam } = await params;
  if (!isLocale(localeParam) || !isLegalPageKey(pageParam)) notFound();
  const locale = localeParam as Locale;
  const page = pageParam as LegalPageKey;
  const localeCopy = LEGAL_COPY[locale];
  const copy = localeCopy.pages[page];

  return (
    <main className="min-h-dvh bg-[#f7f1e8] text-stone-900">
      <header className="border-b border-stone-200/80 bg-white/65">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 font-serif text-lg font-semibold tracking-[-0.03em]">
            <span className="flex size-9 items-center justify-center rounded-full bg-stone-900 text-white">
              <Heart aria-hidden="true" className="size-4" fill="currentColor" />
            </span>
            LeBabyName
          </Link>
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-stone-700">
            <ArrowLeft aria-hidden="true" className="size-4" /> {localeCopy.back}
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-10 sm:py-16">
        <h1 className="font-serif text-5xl leading-none tracking-[-0.04em] text-balance sm:text-7xl">{copy.title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">{copy.description}</p>
        <p className="mt-3 text-xs text-stone-500">{copy.updated}</p>

        <div className="mt-12 divide-y divide-stone-300 border-y border-stone-300">
          {copy.sections.map((section) => (
            <section key={section.title} className="py-7">
              <h2 className="font-serif text-2xl tracking-[-0.03em]">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3 max-w-[72ch] text-base leading-7 text-stone-700">{paragraph}</p>
              ))}
            </section>
          ))}
        </div>

        <nav className="mt-10" aria-label={localeCopy.navigation}>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {LEGAL_PAGE_KEYS.filter((item) => item !== page).map((item) => (
              <li key={item}>
                <Link href={legalPath(locale, item)} className="underline decoration-stone-300 underline-offset-4 hover:decoration-stone-700">
                  {localeCopy.pages[item].title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </article>
      <LegalFooter locale={locale} />
    </main>
  );
}
