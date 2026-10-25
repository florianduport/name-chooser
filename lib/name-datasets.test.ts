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

  it.each(['boys', 'girls'] as const)('has unique ranked %s per country', (gender) => {
    for (const dataset of datasets) {
      const names = dataset[gender];
      expect(names.length).toBeGreaterThanOrEqual(50);
      expect(names.length).toBeLessThanOrEqual(100);
      const keys = names.map((name) =>
        name.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase(),
      );
      expect(new Set(keys).size).toBe(names.length);
    }
  });

  it('puts the official Portugal 2025 partial rankings before the 2016 archive', () => {
    const portugal = datasets.find((dataset) => dataset.countryCode === 'PT');
    expect(portugal?.boys.slice(0, 10)).toEqual([
      'Francisco', 'Tomás', 'Duarte', 'Afonso', 'Vicente',
      'João', 'Lourenço', 'Martim', 'Miguel', 'Gabriel',
    ]);
    expect(portugal?.girls.slice(0, 10)).toEqual([
      'Maria', 'Alice', 'Leonor', 'Matilde', 'Benedita',
      'Aurora', 'Olívia', 'Carolina', 'Camila', 'Francisca',
    ]);
    expect(portugal?.boys).toHaveLength(50);
    expect(portugal?.girls).toHaveLength(52);
    expect(portugal?.sources).toHaveLength(2);
  });
});
