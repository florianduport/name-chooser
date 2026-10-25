'use client';

import { Suspense, useCallback, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  captureAnalytics,
  hasAnalyticsConsent,
  identifyAnalytics,
  initAnalytics,
} from '@/lib/analytics-client';

type Identity = { userId: number | null; isNew: boolean };

function AnalyticsEffects() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const start = useCallback(async () => {
    if (!hasAnalyticsConsent()) return;
    const client = await initAnalytics();
    if (!client) return;
    const response = await fetch('/api/analytics/identity', { cache: 'no-store' });
    if (!response.ok) return;
    const identity = await response.json() as Identity;
    if (!identity.userId) return;
    identifyAnalytics(identity.userId);
    const signupKey = `lebabyname-signup-captured-${identity.userId}`;
    if (identity.isNew && !localStorage.getItem(signupKey)) {
      captureAnalytics('signup');
      localStorage.setItem(signupKey, 'true');
    }
  }, []);

  useEffect(() => {
    start();
    window.addEventListener('lebabyname-consent', start);
    return () => window.removeEventListener('lebabyname-consent', start);
  }, [start]);

  useEffect(() => {
    const capturePageview = () => initAnalytics().then((client) => {
      if (!client) return;
      const query = searchParams.toString();
      captureAnalytics('$pageview', {
        $current_url: `${window.location.origin}${pathname}${query ? `?${query}` : ''}`,
      });
    });
    if (hasAnalyticsConsent()) capturePageview();
    window.addEventListener('lebabyname-consent', capturePageview);
    return () => window.removeEventListener('lebabyname-consent', capturePageview);
  }, [pathname, searchParams]);

  return null;
}

export default function PostHogAnalytics() {
  return (
    <Suspense fallback={null}>
      <AnalyticsEffects />
    </Suspense>
  );
}
