import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import { LEGAL_COPY, LEGAL_PAGE_KEYS, legalPath } from '@/lib/legal';

export default function LegalFooter({ locale }: { locale: Locale }) {
  const copy = LEGAL_COPY[locale];
  return (
    <footer className="bg-stone-950 px-5 py-6 text-stone-300">
      <nav className="mx-auto flex max-w-6xl flex-wrap gap-x-5 gap-y-2 text-xs" aria-label={copy.navigation}>
        {LEGAL_PAGE_KEYS.map((page) => (
          <Link key={page} href={legalPath(locale, page)} className="underline decoration-stone-700 underline-offset-4 hover:text-white">
            {copy.pages[page].title}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
