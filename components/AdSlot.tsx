'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { captureAnalytics } from '@/lib/analytics-client';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdSlot({
  placement,
  enabled: enabledProp,
  clientId: clientIdProp,
}: {
  placement: 'between-rounds' | 'before-result';
  enabled?: boolean;
  clientId?: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [consented, setConsented] = useState(false);
  const [config, setConfig] = useState<{ enabled: boolean; clientId?: string; slotId?: string }>({
    enabled: enabledProp ?? false,
    clientId: clientIdProp,
  });
  const enabled = enabledProp ?? config.enabled;
  const clientId = clientIdProp ?? config.clientId;
  const slotId = config.slotId;

  useEffect(() => {
    if (enabledProp !== undefined) return;
    fetch('/api/public-config')
      .then((response) => response.json())
      .then((value) => setConfig({
        enabled: value.adsEnabled === true,
        clientId: typeof value.adsenseClientId === 'string' ? value.adsenseClientId : undefined,
        slotId: typeof value.adSlots?.[placement === 'between-rounds' ? 'betweenRounds' : 'beforeResult'] === 'string'
          ? value.adSlots[placement === 'between-rounds' ? 'betweenRounds' : 'beforeResult']
          : undefined,
      }))
      .catch(() => undefined);
  }, [enabledProp, placement]);

  useEffect(() => {
    if (!enabled) return;
    const refresh = () => setConsented(
      localStorage.getItem('lebabyname-cookie-consent') === 'granted' ||
      localStorage.getItem('lebabyname-ad-consent') === 'granted',
    );
    refresh();
    window.addEventListener('lebabyname-consent', refresh);
    return () => window.removeEventListener('lebabyname-consent', refresh);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !consented || !clientId || document.querySelector('script[data-lebabyname-ads]')) return;
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.lebabynameAds = 'true';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
    document.head.appendChild(script);
  }, [clientId, consented, enabled]);

  useEffect(() => {
    if (enabled && consented) captureAnalytics('ad_impression', { placement });
  }, [consented, enabled, placement]);

  useEffect(() => {
    if (!enabled || !consented || !clientId || !slotId) return;
    const timer = window.setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // The placeholder remains non-blocking if the provider rejects a slot.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [clientId, consented, enabled, slotId]);

  if (!enabled || dismissed) return null;
  return (
    <aside className="relative my-3 min-h-12 rounded-xl border border-stone-200 bg-white/70 px-10 py-3 text-center text-xs text-stone-500" aria-label="Advertisement">
      <span className="uppercase tracking-[0.14em]">Advertisement</span>
      <p className="mt-1">{consented ? 'Ad space' : 'Ads stay off until you accept optional cookies.'}</p>
      {consented && clientId && slotId && (
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-1.5 top-1.5 rounded-md p-1 text-stone-500 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500"
        aria-label="Dismiss advertisement"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </aside>
  );
}
