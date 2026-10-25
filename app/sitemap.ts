import type { MetadataRoute } from 'next';
import { SUPPORTED_LOCALES } from '@/lib/i18n';
import {
  getAllNames,
  listSlugs,
  nameAlternates,
  namePath,
  SITE_URL,
} from '@/lib/seo';

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
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    ...lists,
    ...names,
  ];
}
