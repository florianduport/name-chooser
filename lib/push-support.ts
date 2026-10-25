export type PushSupportState = 'ready' | 'denied' | 'ios-install' | 'unsupported';

export type PushEnvironment = {
  hasServiceWorker: boolean;
  hasPushManager: boolean;
  hasNotification: boolean;
  permission: NotificationPermission | 'unavailable';
  isIos: boolean;
  isStandalone: boolean;
};

export function evaluatePushSupport(environment: PushEnvironment): PushSupportState {
  if (environment.isIos && !environment.isStandalone) return 'ios-install';
  if (
    !environment.hasServiceWorker ||
    !environment.hasPushManager ||
    !environment.hasNotification
  ) return 'unsupported';
  if (environment.permission === 'denied') return 'denied';
  return 'ready';
}

export function getBrowserPushEnvironment(): PushEnvironment {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return {
    hasServiceWorker: 'serviceWorker' in navigator,
    hasPushManager: 'PushManager' in window,
    hasNotification: 'Notification' in window,
    permission: 'Notification' in window ? Notification.permission : 'unavailable',
    isIos,
    isStandalone:
      window.matchMedia('(display-mode: standalone)').matches ||
      navigatorWithStandalone.standalone === true,
  };
}
