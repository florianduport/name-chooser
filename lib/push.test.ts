import { afterEach, describe, expect, it } from 'vitest';
import { isPushConfigured } from './push';

const original = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
  subject: process.env.VAPID_SUBJECT,
};

afterEach(() => {
  process.env.VAPID_PUBLIC_KEY = original.publicKey;
  process.env.VAPID_PRIVATE_KEY = original.privateKey;
  process.env.VAPID_SUBJECT = original.subject;
});

describe('optional Web Push configuration', () => {
  it('stays disabled when VAPID settings are absent', () => {
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
    delete process.env.VAPID_SUBJECT;
    expect(isPushConfigured()).toBe(false);
  });

  it('enables only when all VAPID settings are present', () => {
    process.env.VAPID_PUBLIC_KEY = 'public';
    process.env.VAPID_PRIVATE_KEY = 'private';
    process.env.VAPID_SUBJECT = 'mailto:test@example.com';
    expect(isPushConfigured()).toBe(true);
    delete process.env.VAPID_PRIVATE_KEY;
    expect(isPushConfigured()).toBe(false);
  });
});
