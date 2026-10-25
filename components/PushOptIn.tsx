'use client';

import { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/LocaleProvider';
import {
  evaluatePushSupport,
  getBrowserPushEnvironment,
  type PushSupportState,
} from '@/lib/push-support';

export default function PushOptIn({ onDismiss }: { onDismiss: () => void }) {
  const { t } = useI18n();
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [support, setSupport] = useState<PushSupportState | 'dismissed'>('ready');

  useEffect(() => {
    fetch('/api/push/public-key')
      .then((response) => response.json())
      .then((data) => {
        if (data.enabled && data.publicKey) {
          setPublicKey(data.publicKey);
          setSupport(evaluatePushSupport(getBrowserPushEnvironment()));
        } else onDismiss();
      })
      .catch(onDismiss);
  }, [onDismiss]);

  const enable = async () => {
    if (!publicKey) return;
    const currentSupport = evaluatePushSupport(getBrowserPushEnvironment());
    if (currentSupport !== 'ready') {
      setSupport(currentSupport);
      return;
    }
    setIsWorking(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setSupport(permission === 'denied' ? 'denied' : 'dismissed');
        return;
      }
      await navigator.serviceWorker.register('/sw.js');
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing ?? await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const response = await fetch('/api/push/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!response.ok) throw new Error('subscription failed');
      onDismiss();
    } catch {
      const nextSupport = evaluatePushSupport(getBrowserPushEnvironment());
      setSupport(nextSupport === 'ready' ? 'unsupported' : nextSupport);
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="col-span-2 mt-2 rounded-2xl bg-sky-50 p-3 text-sky-950">
      <div className="flex gap-3">
        <BellRing aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="text-sm font-semibold">{t('push.title')}</p>
          <p className="mt-1 text-xs leading-5 text-sky-900/75">
            {support === 'ios-install'
              ? t('push.iosInstall')
              : support === 'denied'
                ? t('push.denied')
                : support === 'dismissed'
                  ? t('push.dismissed')
                : support === 'unsupported'
                  ? t('push.unsupported')
                  : t('push.description')}
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="ghost" size="sm" onClick={onDismiss}>{t('push.later')}</Button>
        <Button size="sm" disabled={isWorking || support !== 'ready'} onClick={enable} className="bg-sky-900 text-white hover:bg-sky-800">
          {t('push.enable')}
        </Button>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const bytes = atob(base64);
  return Uint8Array.from([...bytes].map((character) => character.charCodeAt(0)));
}
