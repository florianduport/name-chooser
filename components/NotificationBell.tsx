'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useI18n } from '@/components/LocaleProvider';
import type { AppNotification } from '@/lib/notifications-db';

export default function NotificationBell() {
  const { t } = useI18n();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const response = await fetch('/api/notifications');
    if (!response.ok) return;
    const data = await response.json();
    setNotifications(data.notifications ?? []);
    setUnreadCount(data.unreadCount ?? 0);
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(load, 0);
    const interval = window.setInterval(load, 30_000);
    const visible = () => {
      if (document.visibilityState === 'visible') void load();
    };
    document.addEventListener('visibilitychange', visible);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [load]);

  useEffect(() => {
    if (!isOpen) return;
    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={t('notification.bell')}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((open) => !open);
          if (!isOpen) void load();
        }}
        className="relative flex size-10 items-center justify-center rounded-xl bg-white/70 hover:bg-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-stone-500/30"
      >
        <Bell aria-hidden="true" className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-rose-700 px-1 text-[10px] font-bold leading-4 text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div
          role="menu"
          aria-label={t('notification.bell')}
          className="absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl border border-white bg-[#fffaf2] p-2 shadow-xl"
        >
          <p className="px-2 py-1 text-sm font-semibold">{t('notification.bell')}</p>
          {notifications.length === 0 ? (
            <p className="px-2 py-3 text-xs text-stone-500">{t('notification.empty')}</p>
          ) : (
            <ul className="mt-1 grid gap-1">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <Link
                    href={`/invites/${notification.inviteToken}`}
                    role="menuitem"
                    onClick={() => {
                      if (!notification.read) {
                        void fetch(`/api/notifications/${notification.id}/read`, { method: 'POST' });
                        setUnreadCount((count) => Math.max(0, count - 1));
                      }
                      setIsOpen(false);
                    }}
                    className={`block rounded-xl px-3 py-2 text-xs leading-5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500/30 ${
                      notification.read ? 'text-stone-500' : 'bg-rose-50 font-medium text-stone-900'
                    }`}
                  >
                    {t(
                      notification.kind === 'invitee_finished'
                        ? 'notification.inviteeFinished'
                        : 'notification.inviterFinished',
                      { name: notification.actorName },
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
