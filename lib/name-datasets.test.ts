import { describe, expect, it } from 'vitest';
import datasets from '../data/name-datasets.json';

describe('official country name datasets', () => {
  it('contains all supported countries with source metadata', () => {
    expect(datasets.map((dataset) => dataset.countryCode).sort()).toEqual([
      'ES', 'FR', 'GB', 'IT', 'PT', 'US',
    ]);
    for (const dataset of datasets) {
      expect(dataset.sourceName).toBeTruthy();
      expect(dataset.sourceUrl).toMatch(/^https:\/\//);
      expect(dataset.coverageYear).toBeGreaterThanOrEqual(2016);
      expect(dataset.version).toContain(dataset.countryCode.toLowerCase());
    }
  });

  it.each(['boys', 'girls'] as const)('has 50 unique ranked %s per country', (gender) => {
    for (const dataset of datasets) {
      expect(dataset[gender]).toHaveLength(50);
      expect(new Set(dataset[gender].map((name) => name.toLocaleLowerCase())).size).toBe(50);
    }
  });
});
