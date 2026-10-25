import { describe, expect, it } from 'vitest';
import { SUPPORTED_LOCALES } from './i18n';
import { LEGAL_COPY, LEGAL_PAGE_KEYS, legalPath } from './legal';
import { DEFAULT_ADSENSE_CLIENT_ID } from './adsense';

describe('localized legal pages', () => {
  it('provides every legal page in every locale', () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(Object.keys(LEGAL_COPY[locale].pages).sort()).toEqual([...LEGAL_PAGE_KEYS].sort());
      for (const page of LEGAL_PAGE_KEYS) {
        expect(LEGAL_COPY[locale].pages[page].sections.length).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('builds stable locale-prefixed legal paths', () => {
    expect(legalPath('fr', 'legal-notice')).toBe('/fr/legal/legal-notice');
    expect(legalPath('en-US', 'privacy')).toBe('/en-US/legal/privacy');
  });

  it('uses the approved public AdSense publisher by default', () => {
    expect(DEFAULT_ADSENSE_CLIENT_ID).toBe('ca-pub-6104925526195992');
  });
});
