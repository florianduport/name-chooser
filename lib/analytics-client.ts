'use client';

import type { PostHog } from 'posthog-js';

let posthog: PostHog | null = null;
let initialization: Promise<PostHog | null> | null = null;

export function hasAnalyticsConsent() {
  if (typeof window === 'undefined') return false;
  return (
    localStorage.getItem('lebabyname-cookie-consent') === 'granted' ||
    localStorage.getItem('lebabyname-ad-consent') === 'granted'
  );
}

export async function initAnalytics() {
  if (posthog) return posthog;
  if (initialization) return initialization;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || !hasAnalyticsConsent()) return null;

  initialization = import('posthog-js').then(({ default: client }) => {
    client.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: false,
      persistence: 'localStorage+cookie',
      person_profiles: 'identified_only',
    });
    posthog = client;
    window.dispatchEvent(new Event('lebabyname-analytics-ready'));
    return client;
  });
  return initialization;
}

export function captureAnalytics(event: string, properties: Record<string, unknown> = {}) {
  posthog?.capture(event, properties);
}

export function identifyAnalytics(userId: number) {
  posthog?.identify(String(userId));
}
