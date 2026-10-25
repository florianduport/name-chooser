'use client';

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

export default function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const router = useRouter();

  return (
    <label className="relative flex h-10 items-center rounded-xl bg-white/70 pl-3 pr-2 text-stone-700">
      <Languages aria-hidden="true" className="size-4 shrink-0" />
      <span className="sr-only">{t('common.language')}</span>
      <select
        value={locale}
        onChange={(event) => {
          document.cookie = `lebabyname-locale=${event.target.value}; Path=/; Max-Age=31536000; SameSite=Lax`;
          router.refresh();
        }}
        className="h-full max-w-28 appearance-none bg-transparent pl-2 pr-1 text-xs font-semibold outline-none"
      >
        {SUPPORTED_LOCALES.map((value) => (
          <option key={value} value={value}>{LABELS[value]}</option>
        ))}
      </select>
    </label>
  );
}
