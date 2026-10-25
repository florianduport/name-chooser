import { describe, expect, it } from 'vitest';
import {
  MESSAGES,
  SUPPORTED_LOCALES,
  resolveLocale,
  translate,
} from './i18n';

describe('i18n', () => {
  it('has every French key in every locale', () => {
    const keys = Object.keys(MESSAGES.fr).sort();
    for (const locale of SUPPORTED_LOCALES) {
      expect(Object.keys(MESSAGES[locale]).sort()).toEqual(keys);
    }
  });

  it('detects regional English and supported browser languages', () => {
    expect(resolveLocale('en-US,en;q=0.9')).toBe('en-US');
    expect(resolveLocale('en-AU,en;q=0.9')).toBe('en-GB');
    expect(resolveLocale('es-ES,es;q=0.9')).toBe('es');
    expect(resolveLocale('pt-BR,pt;q=0.9')).toBe('pt');
  });

  it('interpolates translated values', () => {
    expect(translate('it', 'winner.summary', { count: 4 })).toContain('4');
    expect(translate('en-US', 'image.label')).toBe('MY FAVORITE NAME');
  });
});
