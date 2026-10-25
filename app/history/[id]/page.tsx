import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Check, Medal } from 'lucide-react';
import { auth } from '@/auth';
import { getTournamentHistory } from '@/lib/tournaments-db';
import { isUuid } from '@/lib/tokens';
import { getRequestLocale } from '@/lib/locale-server';
import { translate } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

export default async function TournamentHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ against?: string }>;
}) {
  const session = await auth();
  const userId = Number(session?.user?.id);
  if (!userId) redirect('/');
  const { id } = await params;
  const { against } = await searchParams;
  if (!isUuid(id) || (against && !isUuid(against))) notFound();
  const history = await getTournamentHistory(userId, id, against);
  if (!history) notFound();
  const locale = await getRequestLocale();
  const t = (key: Parameters<typeof translate>[1], values?: Record<string, string | number>) =>
    translate(locale, key, values);
  const rounds = Map.groupBy(history.votes, (vote) => vote.round);
  const common = new Set(history.commonNames);

  return (
    <main className="min-h-dvh bg-[#f7f1e8] px-4 py-4 text-stone-900 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" className="-ml-3">
          <Link href="/history"><ArrowLeft aria-hidden="true" /> {t('history.title')}</Link>
        </Button>
        <header className="mt-4">
          <Medal aria-hidden="true" className="size-8 text-amber-600" />
          <h1 className="mt-3 font-serif text-4xl tracking-[-0.04em] sm:text-6xl">
            {t('history.detailTitle', { name: history.participantName })}
          </h1>
        </header>

        <section className="mt-5 rounded-2xl border border-white/80 bg-white/85 p-4">
          <h2 className="font-semibold">{t('history.ranking')}</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <RankingGroup label={t('history.winner')} names={history.ranking.winner} common={common} />
            <RankingGroup label={t('history.finalist')} names={history.ranking.finalists} common={common} />
            <RankingGroup label={t('history.semiFinalists')} names={history.ranking.semiFinalists} common={common} />
          </div>
        </section>

        <div className="mt-4 grid gap-4">
          {[...rounds.entries()].map(([round, votes]) => (
            <section key={round}>
              <h2 className="mb-2 text-sm font-semibold text-stone-600">
                {t('history.round', { round })}
              </h2>
              <ol className="grid gap-2">
                {votes.map((vote) => (
                  <li key={vote.sequence} className="rounded-2xl border border-white/80 bg-white/85 p-3">
                    <div className={`grid gap-2 ${vote.pair.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                      {vote.pair.map((name) => {
                        const picked = name === vote.winner;
                        return (
                          <span
                            key={name}
                            className={`relative truncate rounded-xl px-3 py-2 text-center text-sm font-semibold ${
                              picked ? 'bg-emerald-100 text-emerald-950' : 'bg-stone-100 text-stone-500'
                            } ${common.has(name) ? 'ring-2 ring-sky-400' : ''}`}
                            title={common.has(name) ? t('history.common') : undefined}
                          >
                            {picked && <Check aria-hidden="true" className="mr-1 inline size-3.5" />}
                            {name}
                          </span>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-stone-500">
                      {t('history.picked', { name: vote.winner })}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function RankingGroup({
  label,
  names,
  common,
}: {
  label: string;
  names: string[];
  common: Set<string>;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-stone-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">{label}</p>
      <div className="mt-1 grid gap-1">
        {names.length > 0 ? names.map((name) => (
          <span key={name} className={`truncate text-sm font-semibold ${common.has(name) ? 'text-sky-700' : ''}`}>
            {name}
          </span>
        )) : <span className="text-sm text-stone-400">—</span>}
      </div>
    </div>
  );
}
