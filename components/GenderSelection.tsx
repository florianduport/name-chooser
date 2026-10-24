'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Baby, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Gender } from '@/types';

export default function GenderSelection() {
  const router = useRouter();

  const handleGenderSelect = (gender: Gender) => {
    router.push(`/tournament?gender=${gender}`);
  };

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-[#f7f1e8] px-5 py-12 text-stone-900">
      <div aria-hidden="true" className="absolute -right-24 -top-32 size-80 rounded-full bg-rose-200/50 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-28 -left-24 size-80 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="relative mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section>
          <div className="mb-7 flex size-12 items-center justify-center rounded-full bg-stone-900 text-white shadow-[0_12px_30px_-14px_rgba(28,25,23,0.8)]">
            <Heart aria-hidden="true" className="size-5" fill="currentColor" />
          </div>
          <h1 className="max-w-xl font-serif text-5xl leading-[0.98] tracking-[-0.04em] text-balance sm:text-7xl">
            Le prénom qui vous ressemble.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-stone-600">
            Cindy et Florian, faites confiance à vos préférences. Comparez les prénoms deux à deux jusqu&apos;à trouver votre favori.
          </p>
        </section>

        <section aria-labelledby="choose-title" className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-[0_30px_90px_-42px_rgba(77,48,38,0.5)] backdrop-blur-sm sm:p-8">
          <h2 id="choose-title" className="font-serif text-3xl tracking-[-0.03em]">Par où commence-t-on ?</h2>
          <p className="mt-2 text-stone-600">Choisissez la liste que vous souhaitez explorer.</p>
          <div className="mt-7 grid gap-3">
            <Button
              onClick={() => handleGenderSelect('girl')}
              className="group h-auto justify-between rounded-2xl bg-rose-100 px-5 py-5 text-left text-rose-950 shadow-none hover:bg-rose-200"
            >
              <span className="flex items-center gap-4">
                <span className="flex size-11 items-center justify-center rounded-full bg-white/80"><Baby aria-hidden="true" /></span>
                <span><span className="block text-lg font-semibold">Prénoms de fille</span><span className="block text-sm font-normal text-rose-900/70">Découvrir et comparer la sélection</span></span>
              </span>
              <ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              onClick={() => handleGenderSelect('boy')}
              className="group h-auto justify-between rounded-2xl bg-sky-100 px-5 py-5 text-left text-sky-950 shadow-none hover:bg-sky-200"
            >
              <span className="flex items-center gap-4">
                <span className="flex size-11 items-center justify-center rounded-full bg-white/80"><Baby aria-hidden="true" /></span>
                <span><span className="block text-lg font-semibold">Prénoms de garçon</span><span className="block text-sm font-normal text-sky-900/70">Découvrir et comparer la sélection</span></span>
              </span>
              <ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
