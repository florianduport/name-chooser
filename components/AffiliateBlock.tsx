'use client';

import { ExternalLink, Gem, Mail, Shirt, Coffee, Image as ImageIcon } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { captureAnalytics } from '@/lib/analytics-client';

const LABELS: Record<Locale, {
  title: string;
  note: string;
  placeholder: string;
  sponsored: string;
  products: Record<string, string>;
}> = {
  fr: {
    title: 'Personnalise ce prénom', note: 'Des idées cadeaux choisies autour de ce prénom.', placeholder: 'À configurer', sponsored: 'Liens sponsorisés',
    products: { 'birth-announcements': 'Faire-part', jewelry: 'Bijoux', bodysuits: 'Bodies', mugs: 'Mugs', posters: 'Affiches' },
  },
  'en-GB': {
    title: 'Personalise this name', note: 'Gift ideas made around this name.', placeholder: 'Not configured', sponsored: 'Sponsored links',
    products: { 'birth-announcements': 'Birth announcements', jewelry: 'Jewellery', bodysuits: 'Bodysuits', mugs: 'Mugs', posters: 'Posters' },
  },
  'en-US': {
    title: 'Personalize this name', note: 'Gift ideas made around this name.', placeholder: 'Not configured', sponsored: 'Sponsored links',
    products: { 'birth-announcements': 'Birth announcements', jewelry: 'Jewelry', bodysuits: 'Bodysuits', mugs: 'Mugs', posters: 'Posters' },
  },
  es: {
    title: 'Personaliza este nombre', note: 'Ideas de regalo creadas alrededor de este nombre.', placeholder: 'Sin configurar', sponsored: 'Enlaces patrocinados',
    products: { 'birth-announcements': 'Anuncios de nacimiento', jewelry: 'Joyas', bodysuits: 'Bodies', mugs: 'Tazas', posters: 'Láminas' },
  },
  pt: {
    title: 'Personalize este nome', note: 'Ideias de presentes criadas à volta deste nome.', placeholder: 'Por configurar', sponsored: 'Ligações patrocinadas',
    products: { 'birth-announcements': 'Anúncios de nascimento', jewelry: 'Joias', bodysuits: 'Bodies', mugs: 'Canecas', posters: 'Cartazes' },
  },
  it: {
    title: 'Personalizza questo nome', note: 'Idee regalo create intorno a questo nome.', placeholder: 'Da configurare', sponsored: 'Link sponsorizzati',
    products: { 'birth-announcements': 'Annunci di nascita', jewelry: 'Gioielli', bodysuits: 'Body', mugs: 'Tazze', posters: 'Poster' },
  },
};

const PRODUCTS = [
  { key: 'birth-announcements', Icon: Mail, url: process.env.NEXT_PUBLIC_AFFILIATE_BIRTH_ANNOUNCEMENTS_URL },
  { key: 'jewelry', Icon: Gem, url: process.env.NEXT_PUBLIC_AFFILIATE_JEWELRY_URL },
  { key: 'bodysuits', Icon: Shirt, url: process.env.NEXT_PUBLIC_AFFILIATE_BODYSUITS_URL },
  { key: 'mugs', Icon: Coffee, url: process.env.NEXT_PUBLIC_AFFILIATE_MUGS_URL },
  { key: 'posters', Icon: ImageIcon, url: process.env.NEXT_PUBLIC_AFFILIATE_POSTERS_URL },
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
        <span className="mt-2 text-xs text-stone-500 sm:mt-0">{copy.sponsored}</span>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {PRODUCTS.map(({ key, Icon, url }) => {
          const label = copy.products[key];
          return (
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
                <span>{label}<span className="block text-[10px] uppercase tracking-wide">{copy.placeholder}</span></span>
              </span>
            )}
          </li>
          );
        })}
      </ul>
    </aside>
  );
}
