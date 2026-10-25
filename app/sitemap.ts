import type { MetadataRoute } from 'next';
import { SUPPORTED_LOCALES } from '@/lib/i18n';
import {
  getAllNames,
  listSlugs,
  nameAlternates,
  namePath,
  SITE_URL,
} from '@/lib/seo';
import { LEGAL_PAGE_KEYS, legalPath } from '@/lib/legal';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const names = SUPPORTED_LOCALES.flatMap((locale) =>
    getAllNames(locale).map((name) => ({
      url: `${SITE_URL}${namePath(locale, name)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: { languages: nameAlternates(name) },
    })),
  );
  const lists = SUPPORTED_LOCALES.flatMap((locale) =>
    listSlugs(locale).map((slug) => ({
      url: `${SITE_URL}/${locale}/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  );
  const legal = SUPPORTED_LOCALES.flatMap((locale) =>
    LEGAL_PAGE_KEYS.map((page) => ({
      url: `${SITE_URL}${legalPath(locale, page)}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    })),
  );
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    ...lists,
    ...legal,
    ...names,
  ];
}
