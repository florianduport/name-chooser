import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Crown, Heart } from 'lucide-react';
import { getPublicResult } from '@/lib/tournaments-db';
import { isUuid } from '@/lib/tokens';
import { Button } from '@/components/ui/button';

export default async function SharedResultPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!isUuid(token)) notFound();
  const result = await getPublicResult(token);
  if (!result) notFound();

  return (
    <main className="relative flex min-h-dvh items-center overflow-hidden bg-[#f7f1e8] px-4 py-6 text-stone-900">
      <div aria-hidden="true" className="absolute -right-24 -top-32 size-80 rounded-full bg-rose-200/50 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-28 -left-24 size-80 rounded-full bg-sky-200/50 blur-3xl" />
      <section className="relative mx-auto w-full max-w-lg rounded-3xl border border-white/80 bg-white/85 p-7 text-center shadow-[0_30px_90px_-42px_rgba(77,48,38,0.5)]">
        <Crown aria-hidden="true" className="mx-auto size-10 text-amber-600" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Le prénom favori</p>
        <h1 className="mt-2 break-words font-serif text-6xl tracking-[-0.04em]">{result.winner}</h1>
        <p className="mt-4 text-sm leading-6 text-stone-600">Un tournoi de préférences a fait émerger ce prénom.</p>
        <Button asChild className="mt-7 h-12 w-full rounded-xl bg-stone-900 text-white hover:bg-stone-800">
          <Link href="/"><Heart aria-hidden="true" /> Essayer LeBabyName</Link>
        </Button>
      </section>
    </main>
  );
}
