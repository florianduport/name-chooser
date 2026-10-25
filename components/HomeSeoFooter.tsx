import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import { listSlugs, SEO_ROUTES } from '@/lib/seo';

const TITLES: Record<Locale, string> = {
  fr: 'Découvrir les prénoms',
  'en-GB': 'Explore baby names',
  'en-US': 'Explore baby names',
  es: 'Descubrir nombres',
  pt: 'Descobrir nomes',
  it: 'Scopri i nomi',
};

export default function HomeSeoFooter({ locale }: { locale: Locale }) {
  const routes = SEO_ROUTES[locale];
  const featured = [routes.top, routes.short, routes.unisex, routes.girl, routes.boy];
  const letters = listSlugs(locale).filter((slug) => slug.startsWith(`${routes.letter}-`)).slice(0, 8);
  return (
    <footer className="bg-stone-950 px-5 py-8 text-stone-200">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-serif text-2xl tracking-[-0.03em]">{TITLES[locale]}</h2>
        <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label={TITLES[locale]}>
          {[...featured, ...letters].map((slug) => (
            <Link key={slug} href={`/${locale}/${slug}`} className="text-stone-300 underline decoration-stone-700 underline-offset-4 hover:text-white">
              {slug.replaceAll('-', ' ')}
            </Link>
          ))}
        </nav>
        <p className="mt-6 text-xs text-stone-500">LeBabyName · 100% free, forever.</p>
      </div>
    </footer>
  );
}
