import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Check, ChevronRight, Clock3, Users } from 'lucide-react';
import { auth } from '@/auth';
import { getInviteComparison } from '@/lib/tournaments-db';
import { isUuid } from '@/lib/tokens';
import { Button } from '@/components/ui/button';
import { getRequestLocale } from '@/lib/locale-server';
import { translate } from '@/lib/i18n';

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
  const locale = await getRequestLocale();
  const t = (key: Parameters<typeof translate>[1], values?: Record<string, string | number>) =>
    translate(locale, key, values);

  return (
    <main className="min-h-dvh bg-[#f7f1e8] px-4 py-4 text-stone-900 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" className="-ml-3">
          <Link href="/history"><ArrowLeft aria-hidden="true" /> {t('history.title')}</Link>
        </Button>
        <header className="mt-4">
          <Users aria-hidden="true" className="size-8 text-sky-700" />
          <h1 className="mt-3 font-serif text-4xl tracking-[-0.04em] sm:text-6xl">{t('compare.title')}</h1>
          <p className="mt-2 text-sm text-stone-600">{t('compare.subtitle')}</p>
        </header>

        {comparison.attempts.length === 0 ? (
          <>
            <Link
              href={`/history/${comparison.sourceTournamentId}`}
              className="mt-5 flex items-center justify-between rounded-2xl bg-stone-900 px-5 py-4 text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-stone-500/30"
            >
              <span>
                <span className="text-xs uppercase tracking-[0.16em] text-stone-400">{t('compare.yours')}</span>
                <span className="mt-1 block font-serif text-3xl">{comparison.sourceWinner}</span>
              </span>
              <ChevronRight aria-hidden="true" />
            </Link>
            <div className="mt-3 rounded-2xl border border-white/80 bg-white/80 p-5 text-center">
              <Clock3 aria-hidden="true" className="mx-auto size-6 text-stone-500" />
              <p className="mt-2 font-semibold">{t('compare.waiting')}</p>
              <p className="mt-1 text-sm text-stone-600">{t('compare.waitingDescription')}</p>
            </div>
          </>
        ) : (
          <ol className="mt-5 grid gap-4">
            {comparison.attempts.map((attempt) => (
              <li key={attempt.id} className="grid gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/history/${comparison.sourceTournamentId}?against=${attempt.id}`}
                    className="flex min-w-0 items-center justify-between gap-2 rounded-2xl bg-stone-900 px-4 py-3 text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-stone-500/30"
                  >
                    <span className="min-w-0">
                      <span className="truncate text-xs text-stone-400">{comparison.sourceParticipantName}</span>
                      <span className="block truncate font-serif text-2xl">{comparison.sourceWinner}</span>
                    </span>
                    <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
                  </Link>
                  <Link
                    href={`/history/${attempt.id}?against=${comparison.sourceTournamentId}`}
                    className="flex min-w-0 items-center justify-between gap-2 rounded-2xl border border-white/80 bg-white/85 px-4 py-3 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-stone-500/30"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-xs text-stone-500">{attempt.participantName}</span>
                      <span className="block truncate font-serif text-2xl">{attempt.winner}</span>
                    </span>
                    <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-2 px-1">
                  <span className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${attempt.matches ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-100 text-stone-700'}`}>
                    {attempt.matches && <Check aria-hidden="true" className="size-3.5" />}
                    {attempt.matches ? t('compare.same') : t('compare.different')}
                  </span>
                  {attempt.commonNames.length > 0 && (
                    <span className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-900">
                      {t('compare.common', { names: attempt.commonNames.join(', ') })}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}
