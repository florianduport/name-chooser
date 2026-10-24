import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DATASET_VERSION,
  getDefaultNames,
} from './seed-data';

describe('official 2025 default dataset', () => {
  it.each(['boy', 'girl'] as const)('contains 50 unique ranked %s names', (gender) => {
    const names = getDefaultNames(gender);
    expect(names).toHaveLength(50);
    expect(new Set(names.map((name) => name.toLocaleLowerCase('fr'))).size).toBe(50);
  });

  it('keeps the official leading and 50th-ranked names', () => {
    expect(getDefaultNames('boy').at(0)).toBe('Gabriel');
    expect(getDefaultNames('boy').at(-1)).toBe('Simon');
    expect(getDefaultNames('girl').at(0)).toBe('Louise');
    expect(getDefaultNames('girl').at(-1)).toBe('Livia');
    expect(DEFAULT_DATASET_VERSION).toBe('insee-france-2025-top-50-by-sex');
  });
});
