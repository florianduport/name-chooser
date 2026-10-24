import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Check, Clock3, Users } from 'lucide-react';
import { auth } from '@/auth';
import { getInviteComparison } from '@/lib/tournaments-db';
import { isUuid } from '@/lib/tokens';
import { Button } from '@/components/ui/button';

export default async function InviteComparisonPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const session = await auth();
  const userId = Number(session?.user?.id);
  if (!userId) redirect('/');
  const { token } = await params;
  if (!isUuid(token)) notFound();
  const comparison = await getInviteComparison(userId, token);
  if (!comparison) notFound();

  return (
    <main className="min-h-dvh bg-[#f7f1e8] px-4 py-4 text-stone-900 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" className="-ml-3">
          <Link href="/history"><ArrowLeft aria-hidden="true" /> Résultats</Link>
        </Button>
        <header className="mt-4">
          <Users aria-hidden="true" className="size-8 text-sky-700" />
          <h1 className="mt-3 font-serif text-4xl tracking-[-0.04em] sm:text-6xl">Comparez vos favoris</h1>
          <p className="mt-2 text-sm text-stone-600">Votre résultat et ceux des personnes invitées, réunis au même endroit.</p>
        </header>

        <section className="mt-5 rounded-2xl bg-stone-900 px-5 py-4 text-white">
          <p className="text-xs uppercase tracking-[0.16em] text-stone-400">Votre favori</p>
          <p className="mt-1 font-serif text-3xl">{comparison.sourceWinner}</p>
        </section>

        {comparison.attempts.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-white/80 bg-white/80 p-5 text-center">
            <Clock3 aria-hidden="true" className="mx-auto size-6 text-stone-500" />
            <p className="mt-2 font-semibold">En attente d&apos;un résultat</p>
            <p className="mt-1 text-sm text-stone-600">Revenez ici après la participation de votre invité.</p>
          </div>
        ) : (
          <ol className="mt-3 grid gap-2">
            {comparison.attempts.map((attempt) => (
              <li key={attempt.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/85 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-stone-500">{attempt.participantName}</p>
                  <p className="truncate font-serif text-2xl">{attempt.winner}</p>
                </div>
                <span className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${attempt.matches ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-100 text-stone-700'}`}>
                  {attempt.matches && <Check aria-hidden="true" className="size-3.5" />}
                  {attempt.matches ? 'Même favori' : 'Choix différent'}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}
