import type { MetadataRoute } from 'next';
import { getRequestLocale } from '@/lib/locale-server';
import { translate } from '@/lib/i18n';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const locale = await getRequestLocale();
  return {
    name: 'LeBabyName',
    short_name: 'LeBabyName',
    description: translate(locale, 'meta.description'),
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f1e8',
    theme_color: '#1c1917',
    lang: locale,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
