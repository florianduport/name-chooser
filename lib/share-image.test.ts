import { describe, expect, it } from 'vitest';
import { SHARE_IMAGE_DIMENSIONS } from './share-image';

describe('share image formats', () => {
  it('uses a 9:16 story canvas', () => {
    expect(SHARE_IMAGE_DIMENSIONS.story).toEqual([1080, 1920]);
  });

  it('uses a square canvas', () => {
    expect(SHARE_IMAGE_DIMENSIONS.square).toEqual([1080, 1080]);
  });
});
