import { describe, expect, it } from 'vitest';
import {
  getAllNames,
  getPublicName,
  listSlugs,
  namePath,
  parseList,
  slugify,
} from './seo';

describe('public SEO data', () => {
  it('builds stable accent-insensitive name slugs', () => {
    expect(slugify('Léo')).toBe('leo');
    expect(getPublicName('fr', 'leo')?.name).toBe('Léo');
    expect(namePath('fr', { slug: 'leo' })).toBe('/fr/prenom/leo');
    expect(namePath('es', { slug: 'leo' })).toBe('/es/nombre/leo');
  });

  it('exposes sourced meanings only when curated', () => {
    const sophia = getPublicName('en-GB', 'sophia');
    const uncommon = getAllNames('en-GB').find((name) => !name.meaning);
    expect(sophia?.meaning).toBe('wisdom');
    expect(sophia?.meaningSourceUrl).toContain('behindthename.com');
    expect(uncommon?.meaning).toBeNull();
  });

  it('derives country and thematic lists from ranking data', () => {
    const top = parseList('fr', 'top-prenoms-2025-france');
    const short = parseList('fr', 'prenoms-courts');
    expect(top?.names.length).toBeGreaterThanOrEqual(90);
    expect(short?.names.every((name) => [...name.name].length <= 4)).toBe(true);
    expect(listSlugs('fr')).toContain('prenoms-en-a');
  });
});
