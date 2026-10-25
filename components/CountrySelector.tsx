'use client';

import { useEffect, useMemo, useState } from 'react';
import { Globe2 } from 'lucide-react';
import { useI18n } from '@/components/LocaleProvider';
import type { CountryCode } from '@/lib/i18n';

type Country = {
  countryCode: CountryCode;
  countryName: string;
  sourceName: string;
  sourceUrl: string;
  coverageYear: number;
};

export default function CountrySelector() {
  const { locale, t } = useI18n();
  const [countries, setCountries] = useState<Country[]>([]);
  const [selected, setSelected] = useState<Country | null>(null);
  const displayNames = useMemo(
    () => new Intl.DisplayNames([locale], { type: 'region' }),
    [locale],
  );

  useEffect(() => {
    fetch('/api/countries')
      .then((response) => response.json())
      .then((data) => {
        setCountries(data.countries ?? []);
        const country = data.countries?.find(
          (entry: Country) => entry.countryCode === data.selected?.countryCode,
        );
        if (country) {
          setSelected(country);
        }
      });
  }, []);

  if (!selected) return <div className="h-11" aria-hidden="true" />;

  return (
    <div className="rounded-xl bg-white/70 px-3 py-2">
      <label className="flex items-center gap-2 text-xs font-semibold text-stone-700">
        <Globe2 aria-hidden="true" className="size-4" />
        <span>{t('country.label')}</span>
        <select
          value={selected.countryCode}
          onChange={async (event) => {
            const countryCode = event.target.value as CountryCode;
            const response = await fetch('/api/countries', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ countryCode }),
            });
            if (!response.ok) return;
            const country = countries.find((entry) => entry.countryCode === countryCode);
            if (country) {
              setSelected(country);
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-right outline-none"
          aria-label={t('country.change')}
        >
          {countries.map((country) => (
            <option key={country.countryCode} value={country.countryCode}>
              {displayNames.of(country.countryCode) ?? country.countryName} ({country.coverageYear})
            </option>
          ))}
        </select>
      </label>
      <a
        href={selected.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-1 block truncate text-[10px] text-stone-500 underline decoration-stone-300 underline-offset-2"
      >
        {t('country.source', { source: selected.sourceName, year: selected.coverageYear })}
      </a>
    </div>
  );
}
