'use client';

import { signIn } from 'next-auth/react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GoogleIcon from '@/components/GoogleIcon';
import { useI18n } from '@/components/LocaleProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function SignInScreen({
  callbackUrl,
  title,
  description,
}: {
  callbackUrl?: string;
  title?: string;
  description?: string;
}) {
  const { t } = useI18n();
  return (
    <main className="relative flex min-h-dvh items-center overflow-hidden bg-[#f7f1e8] px-5 py-8 text-stone-900">
      <div aria-hidden="true" className="absolute -right-24 -top-32 size-80 rounded-full bg-rose-200/50 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-28 -left-24 size-80 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="absolute right-3 top-3 z-10"><LanguageSwitcher /></div>
      <section className="relative mx-auto w-full max-w-lg rounded-3xl border border-white/80 bg-white/85 p-6 text-center shadow-[0_30px_90px_-42px_rgba(77,48,38,0.5)] sm:p-10">
        <div className="flex items-center justify-center gap-2">
          <span className="flex size-11 items-center justify-center rounded-full bg-stone-900 text-white">
            <Heart aria-hidden="true" className="size-5" fill="currentColor" />
          </span>
          <span className="font-serif text-xl font-semibold tracking-[-0.03em]">LeBabyName</span>
        </div>
        <h1 className="mt-5 font-serif text-4xl tracking-[-0.04em] sm:text-6xl">
          {title ?? t('landing.headline')}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-stone-600 sm:text-base sm:leading-7">
          {description ?? t('landing.subhead')}
        </p>
        <p className="mt-2 text-xs text-stone-500">{t('landing.privacy')}</p>
        <Button
          onClick={() => signIn('google', { redirectTo: callbackUrl ?? '/' })}
          className="mt-6 h-12 w-full rounded-xl border border-stone-300 bg-white text-base text-stone-800 shadow-sm hover:bg-stone-50"
        >
          <GoogleIcon /> {t('landing.google')}
        </Button>
      </section>
    </main>
  );
}
