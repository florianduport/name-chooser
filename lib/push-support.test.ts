import { describe, expect, it } from 'vitest';
import { evaluatePushSupport, type PushEnvironment } from './push-support';

const supported: PushEnvironment = {
  hasServiceWorker: true,
  hasPushManager: true,
  hasNotification: true,
  permission: 'default',
  isIos: false,
  isStandalone: false,
};

describe('push support messaging', () => {
  it('allows a meaningful user-triggered permission request on supported browsers', () => {
    expect(evaluatePushSupport(supported)).toBe('ready');
  });

  it('reports denied permission separately from unsupported browsers', () => {
    expect(evaluatePushSupport({ ...supported, permission: 'denied' })).toBe('denied');
    expect(evaluatePushSupport({ ...supported, hasPushManager: false })).toBe('unsupported');
  });

  it('instructs iOS users to install the PWA before enabling push', () => {
    expect(evaluatePushSupport({ ...supported, isIos: true })).toBe('ios-install');
    expect(evaluatePushSupport({ ...supported, isIos: true, isStandalone: true })).toBe('ready');
  });
});
