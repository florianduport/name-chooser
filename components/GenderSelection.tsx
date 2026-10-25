'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { ArrowRight, Baby, Heart, LogOut, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CountrySelector from '@/components/CountrySelector';
import { useI18n } from '@/components/LocaleProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Gender } from '@/types';

export default function GenderSelection() {
  const router = useRouter();
  const { t } = useI18n();

  const handleGenderSelect = (gender: Gender) => {
    router.push(`/tournament?gender=${gender}`);
  };

  return (
    <main className="relative flex min-h-dvh items-center overflow-hidden bg-[#f7f1e8] px-4 py-4 text-stone-900 sm:px-5 sm:py-12">
      <div aria-hidden="true" className="absolute -right-24 -top-32 size-80 rounded-full bg-rose-200/50 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-28 -left-24 size-80 rounded-full bg-sky-200/50 blur-3xl" />
      <nav aria-label={t('common.account')} className="absolute right-3 top-3 z-10 flex gap-1">
        <LanguageSwitcher />
        <Button asChild variant="ghost" size="icon-lg" aria-label={t('home.results')} className="bg-white/60">
          <Link href="/history"><Trophy aria-hidden="true" /></Link>
        </Button>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label={t('home.logout')}
          className="bg-white/60"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut aria-hidden="true" />
        </Button>
      </nav>
      <div className="relative mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
        <section>
          <div className="mb-3 flex items-center gap-2 sm:mb-7">
            <span className="flex size-10 items-center justify-center rounded-full bg-stone-900 text-white shadow-[0_12px_30px_-14px_rgba(28,25,23,0.8)] sm:size-12">
              <Heart aria-hidden="true" className="size-5" fill="currentColor" />
            </span>
            <span className="font-serif text-lg font-semibold tracking-[-0.03em]">LeBabyName</span>
          </div>
          <h1 className="max-w-xl font-serif text-4xl leading-[0.98] tracking-[-0.04em] text-balance sm:text-7xl">
            {t('landing.headline')}
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-stone-600 sm:mt-6 sm:text-lg sm:leading-8">
            {t('landing.subhead')}
          </p>
        </section>

        <section aria-labelledby="choose-title" className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-[0_30px_90px_-42px_rgba(77,48,38,0.5)] backdrop-blur-sm sm:rounded-[2rem] sm:p-8">
          <h2 id="choose-title" className="font-serif text-2xl tracking-[-0.03em] sm:text-3xl">{t('home.where')}</h2>
          <p className="mt-1 text-sm text-stone-600 sm:mt-2 sm:text-base">{t('home.choose')}</p>
          <div className="mt-3"><CountrySelector /></div>
          <div className="mt-3 grid gap-2.5 sm:mt-5 sm:gap-3">
            <Button
              onClick={() => handleGenderSelect('girl')}
              className="group h-auto min-h-16 justify-between rounded-2xl bg-rose-100 px-4 py-3 text-left text-rose-950 shadow-none hover:bg-rose-200 sm:px-5 sm:py-5"
            >
              <span className="flex min-w-0 items-center gap-3 sm:gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/80 sm:size-11"><Baby aria-hidden="true" /></span>
                <span className="min-w-0"><span className="block text-base font-semibold sm:text-lg">{t('home.girlNames')}</span><span className="block truncate text-xs font-normal text-rose-900/70 sm:text-sm">{t('mode.official')}</span></span>
              </span>
              <ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              onClick={() => handleGenderSelect('boy')}
              className="group h-auto min-h-16 justify-between rounded-2xl bg-sky-100 px-4 py-3 text-left text-sky-950 shadow-none hover:bg-sky-200 sm:px-5 sm:py-5"
            >
              <span className="flex min-w-0 items-center gap-3 sm:gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/80 sm:size-11"><Baby aria-hidden="true" /></span>
                <span className="min-w-0"><span className="block text-base font-semibold sm:text-lg">{t('home.boyNames')}</span><span className="block truncate text-xs font-normal text-sky-900/70 sm:text-sm">{t('mode.official')}</span></span>
              </span>
              <ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
