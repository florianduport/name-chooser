'use client';

import { useEffect, useRef, useState } from 'react';
import { Languages } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/components/LocaleProvider';
import { SUPPORTED_LOCALES, type Locale } from '@/lib/i18n';

const LABELS: Record<Locale, string> = {
  fr: 'Français',
  'en-GB': 'English (UK)',
  'en-US': 'English (US)',
  es: 'Español',
  pt: 'Português',
  it: 'Italiano',
};

const FLAGS: Record<Locale, string> = {
  fr: '🇫🇷',
  'en-GB': '🇬🇧',
  'en-US': '🇺🇸',
  es: '🇪🇸',
  pt: '🇵🇹',
  it: '🇮🇹',
};

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const setLocale = async (value: Locale) => {
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: value }),
    });
    setIsOpen(false);
    router.refresh();
  };

  useEffect(() => {
    if (!isOpen) return;
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', escape);
    };
  }, [isOpen]);

  if (compact) {
    return (
      <div ref={menuRef} className="relative">
        <button
          type="button"
          aria-label={`${t('common.language')}: ${LABELS[locale]}`}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          title={LABELS[locale]}
          onClick={() => setIsOpen((open) => !open)}
          className="flex size-10 items-center justify-center rounded-xl bg-white/70 text-xl transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-stone-500/30"
        >
          <span aria-hidden="true">{FLAGS[locale]}</span>
        </button>
        {isOpen && (
          <div
            role="menu"
            aria-label={t('common.language')}
            className="absolute right-0 top-12 z-50 grid grid-cols-3 gap-1 rounded-2xl border border-white bg-[#fffaf2] p-2 shadow-xl"
          >
            {SUPPORTED_LOCALES.map((value) => (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={locale === value}
                aria-label={LABELS[value]}
                title={LABELS[value]}
                onClick={() => void setLocale(value)}
                className={`flex size-11 items-center justify-center rounded-xl text-xl hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500/30 ${
                  locale === value ? 'bg-white ring-1 ring-stone-200' : ''
                }`}
              >
                <span aria-hidden="true">{FLAGS[value]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <label className="relative flex h-10 items-center rounded-xl bg-white/70 pl-3 pr-2 text-stone-700">
      <Languages aria-hidden="true" className="size-4 shrink-0" />
      <span className="sr-only">{t('common.language')}</span>
      <select
        value={locale}
        onChange={(event) => void setLocale(event.target.value as Locale)}
        className="h-full max-w-28 appearance-none bg-transparent pl-2 pr-1 text-xs font-semibold outline-none"
      >
        {SUPPORTED_LOCALES.map((value) => (
          <option key={value} value={value}>{LABELS[value]}</option>
        ))}
      </select>
    </label>
  );
}
