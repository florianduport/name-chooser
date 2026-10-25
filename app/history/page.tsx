import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, Trophy, Users } from 'lucide-react';
import { auth } from '@/auth';
import { getTournamentResults } from '@/lib/tournaments-db';
import { Button } from '@/components/ui/button';
import { getRequestLocale } from '@/lib/locale-server';
import { translate } from '@/lib/i18n';

export default async function HistoryPage() {
  const session = await auth();
  const userId = Number(session?.user?.id);
  if (!userId) redirect('/');
  const locale = await getRequestLocale();
  const t = (key: Parameters<typeof translate>[1], values?: Record<string, string | number>) =>
    translate(locale, key, values);
  const results = await getTournamentResults(userId);

  return (
    <main className="min-h-dvh bg-[#f7f1e8] px-4 py-4 text-stone-900 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" className="-ml-3">
          <Link href="/"><ArrowLeft aria-hidden="true" /> {t('common.home')}</Link>
        </Button>
        <header className="mt-4 sm:mt-8">
          <Trophy aria-hidden="true" className="size-8 text-amber-600" />
          <h1 className="mt-3 font-serif text-4xl tracking-[-0.04em] sm:text-6xl">{t('history.title')}</h1>
          <p className="mt-2 text-sm text-stone-600 sm:text-base">{t('history.subtitle')}</p>
        </header>

        {results.length === 0 ? (
          <section className="mt-6 rounded-2xl border border-white/80 bg-white/80 p-6 text-center">
            <p className="font-semibold">{t('history.empty')}</p>
            <Button asChild className="mt-4 bg-stone-900 text-white hover:bg-stone-800">
              <Link href="/">{t('history.start')}</Link>
            </Button>
          </section>
        ) : (
          <ol className="mt-6 grid gap-2">
            {results.map((result) => (
              <li key={result.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/80 bg-white/85 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-serif text-2xl tracking-[-0.02em]">{result.winner}</p>
                  <p className="text-xs text-stone-500">
                    {t('history.choices', { count: result.choices })} · {result.mode === 'database' ? t('history.official') : t('history.custom')}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <time className="text-xs text-stone-500" dateTime={result.completedAt}>
                    {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(result.completedAt))}
                  </time>
                  {result.inviteToken && (
                    <Button asChild variant="ghost" size="sm" className="h-8 text-xs">
                      <Link href={`/invites/${result.inviteToken}`}><Users aria-hidden="true" /> {t('history.compare')}</Link>
                    </Button>
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
