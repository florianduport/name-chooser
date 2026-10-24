'use client';

import { signIn } from 'next-auth/react';
import { ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SignInScreen() {
  return (
    <main className="relative flex min-h-dvh items-center overflow-hidden bg-[#f7f1e8] px-5 py-8 text-stone-900">
      <div aria-hidden="true" className="absolute -right-24 -top-32 size-80 rounded-full bg-rose-200/50 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-28 -left-24 size-80 rounded-full bg-sky-200/50 blur-3xl" />
      <section className="relative mx-auto w-full max-w-lg rounded-3xl border border-white/80 bg-white/85 p-6 text-center shadow-[0_30px_90px_-42px_rgba(77,48,38,0.5)] sm:p-10">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-stone-900 text-white">
          <Heart aria-hidden="true" className="size-5" fill="currentColor" />
        </div>
        <h1 className="mt-5 font-serif text-4xl tracking-[-0.04em] sm:text-6xl">
          Trouvez le prénom qui vous ressemble.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-stone-600 sm:text-base sm:leading-7">
          Comparez, choisissez et retrouvez vos résultats. Vos listes et vos préférences restent privées.
        </p>
        <Button
          onClick={() => signIn('google')}
          className="mt-7 h-12 w-full rounded-xl bg-stone-900 text-base text-white hover:bg-stone-800"
        >
          Continuer avec Google <ArrowRight aria-hidden="true" />
        </Button>
      </section>
    </main>
  );
}
