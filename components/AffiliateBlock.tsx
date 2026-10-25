'use client';

import { ExternalLink, Gem, Mail, Shirt, Coffee, Image as ImageIcon } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { captureAnalytics } from '@/lib/analytics-client';

const LABELS: Record<Locale, { title: string; note: string; placeholder: string }> = {
  fr: { title: 'Personnalise ce prénom', note: 'Des idées cadeaux choisies autour de ce prénom.', placeholder: 'Lien partenaire de démonstration' },
  'en-GB': { title: 'Personalise this name', note: 'Gift ideas made around this name.', placeholder: 'Demo affiliate link' },
  'en-US': { title: 'Personalize this name', note: 'Gift ideas made around this name.', placeholder: 'Demo affiliate link' },
  es: { title: 'Personaliza este nombre', note: 'Ideas de regalo creadas alrededor de este nombre.', placeholder: 'Enlace afiliado de demostración' },
  pt: { title: 'Personalize este nome', note: 'Ideias de presentes criadas à volta deste nome.', placeholder: 'Ligação de afiliado de demonstração' },
  it: { title: 'Personalizza questo nome', note: 'Idee regalo create intorno a questo nome.', placeholder: 'Link affiliato dimostrativo' },
};

const PRODUCTS = [
  { key: 'birth-announcements', label: 'Birth announcements', Icon: Mail, url: process.env.NEXT_PUBLIC_AFFILIATE_BIRTH_ANNOUNCEMENTS_URL },
  { key: 'jewelry', label: 'Jewelry', Icon: Gem, url: process.env.NEXT_PUBLIC_AFFILIATE_JEWELRY_URL },
  { key: 'bodysuits', label: 'Bodysuits', Icon: Shirt, url: process.env.NEXT_PUBLIC_AFFILIATE_BODYSUITS_URL },
  { key: 'mugs', label: 'Mugs', Icon: Coffee, url: process.env.NEXT_PUBLIC_AFFILIATE_MUGS_URL },
  { key: 'posters', label: 'Posters', Icon: ImageIcon, url: process.env.NEXT_PUBLIC_AFFILIATE_POSTERS_URL },
] as const;

export default function AffiliateBlock({ name, locale }: { name: string; locale: Locale }) {
  const copy = LABELS[locale];
  return (
    <aside className="mt-10 border-y border-stone-200 py-6" aria-labelledby="affiliate-title">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="affiliate-title" className="font-serif text-2xl tracking-[-0.03em]">{copy.title}</h2>
          <p className="mt-1 text-sm text-stone-600">{copy.note}</p>
        </div>
        <span className="mt-2 text-xs text-stone-500 sm:mt-0">Sponsored</span>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {PRODUCTS.map(({ key, label, Icon, url }) => (
          <li key={key}>
            {url ? (
              <a
                href={url.replaceAll('{name}', encodeURIComponent(name))}
                rel="sponsored noopener noreferrer"
                target="_blank"
                onClick={() => captureAnalytics('affiliate_clicked', { product: key, name })}
                className="flex min-h-20 flex-col justify-between rounded-xl border border-stone-200 bg-white p-3 text-sm font-medium text-stone-800 transition-colors hover:border-stone-400 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-rose-700/30"
              >
                <Icon aria-hidden="true" className="size-4 text-rose-700" />
                <span className="flex items-end justify-between gap-1">{label}<ExternalLink aria-hidden="true" className="size-3" /></span>
              </a>
            ) : (
              <span
                className="flex min-h-20 flex-col justify-between rounded-xl border border-dashed border-stone-300 bg-stone-50 p-3 text-sm text-stone-500"
                title={copy.placeholder}
              >
                <Icon aria-hidden="true" className="size-4" />
                <span>{label}<span className="block text-[10px] uppercase tracking-wide">Placeholder</span></span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
