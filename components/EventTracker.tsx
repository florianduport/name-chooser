'use client';

import { useEffect } from 'react';
import { captureAnalytics } from '@/lib/analytics-client';
import { initAnalytics } from '@/lib/analytics-client';

export function EventTracker({
  event,
  properties = {},
  databaseEvent,
}: {
  event: string;
  properties?: Record<string, unknown>;
  databaseEvent?: {
    eventName: string;
    tournamentId?: string;
    shareToken?: string;
    locale?: string;
    metadata?: Record<string, unknown>;
  };
}) {
  const serializedProperties = JSON.stringify(properties);
  const serializedDatabaseEvent = databaseEvent ? JSON.stringify(databaseEvent) : null;
  useEffect(() => {
    const analyticsProperties = JSON.parse(serializedProperties) as Record<string, unknown>;
    const capture = () => initAnalytics().then((client) => {
      if (client) captureAnalytics(event, analyticsProperties);
    });
    capture();
    window.addEventListener('lebabyname-consent', capture);
    const storedEvent = serializedDatabaseEvent
      ? JSON.parse(serializedDatabaseEvent) as typeof databaseEvent
      : null;
    if (storedEvent) {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storedEvent),
        keepalive: true,
      }).catch(() => undefined);
    }
    return () => window.removeEventListener('lebabyname-consent', capture);
  }, [event, serializedDatabaseEvent, serializedProperties]);
  return null;
}

export function trackDatabaseEvent(
  eventName: string,
  data: Record<string, unknown> = {},
) {
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventName, ...data }),
    keepalive: true,
  }).catch(() => undefined);
}
