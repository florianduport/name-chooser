import { describe, expect, it, vi } from 'vitest';
import {
  sharePreparedFile,
  type FileShareNavigator,
} from './native-file-share';

const storyFile = { name: 'story.png', type: 'image/png' } as File;

describe('prepared mobile file sharing', () => {
  it('dispatches the prepared Story file synchronously when supported', () => {
    const share = vi.fn(() => Promise.resolve());
    const navigatorLike: FileShareNavigator = {
      canShare: vi.fn(() => true),
      share,
    };

    const result = sharePreparedFile(
      navigatorLike,
      storyFile,
      'My result',
      'https://example.com/share/token',
    );

    expect(share).toHaveBeenCalledTimes(1);
    expect(share).toHaveBeenCalledWith({
      files: [storyFile],
      text: 'My result',
      url: 'https://example.com/share/token',
    });
    expect(result).toBeInstanceOf(Promise);
  });

  it('returns null without invoking share when file sharing is unsupported', () => {
    const share = vi.fn(() => Promise.resolve());
    const navigatorLike: FileShareNavigator = {
      canShare: vi.fn(() => false),
      share,
    };

    expect(sharePreparedFile(navigatorLike, storyFile, 'Text', 'https://example.com')).toBeNull();
    expect(share).not.toHaveBeenCalled();
  });

  it('returns null when the Web Share API is unavailable', () => {
    expect(sharePreparedFile({}, storyFile, 'Text', 'https://example.com')).toBeNull();
  });
});
