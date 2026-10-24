'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, Check, Crown, RotateCcw, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  createTournament,
  getCurrentPair,
  getWinner,
  isTournamentComplete,
  nextRound,
  selectWinner,
} from '@/lib/tournament';
import { DuelHistoryEntry, Gender, TournamentState } from '@/types';

interface TournamentBracketProps {
  initialNames: string[];
  gender: Gender;
}

function remainingDuels(tournament: TournamentState) {
  return Math.floor(tournament.remainingNames.length / 2);
}

export default function TournamentBracket({ initialNames, gender }: TournamentBracketProps) {
  const router = useRouter();
  const [tournament, setTournament] = useState(() => createTournament(initialNames));
  const [history, setHistory] = useState<DuelHistoryEntry[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const pair = getCurrentPair(tournament);

  const celebrate = useCallback(() => {
    const colors = ['#be123c', '#0369a1', '#f59e0b', '#65a30d'];
    confetti({ particleCount: 110, spread: 80, origin: { y: 0.65 }, colors });
  }, []);

  const chooseName = (winnerIndex: 0 | 1 | 2) => {
    if (!pair) return;
    const selectedWinner = pair[winnerIndex];
    if (!selectedWinner) return;

    const entry: DuelHistoryEntry = {
      tournamentStateBeforeDuel: structuredClone(tournament),
      round: tournament.currentRound,
      pair,
      winner: selectedWinner,
      losers: pair.filter((_, index) => index !== winnerIndex),
    };
    const afterDuel = selectWinner(tournament, winnerIndex);
    const state = afterDuel.remainingNames.length === 0 ? nextRound(afterDuel) : afterDuel;
    const completedState = isTournamentComplete(afterDuel) ? afterDuel : state;
    const finalWinner = getWinner(completedState);

    setHistory((current) => [...current, entry]);
    setTournament(completedState);
    if (finalWinner) {
      setWinner(finalWinner);
      celebrate();
    }
  };

  const rollback = (index: number) => {
    const entry = history[index];
    if (!entry) return;
    setTournament(structuredClone(entry.tournamentStateBeforeDuel));
    setHistory((current) => current.slice(0, index));
    setWinner(null);
  };

  const restart = () => {
    setTournament(createTournament(initialNames));
    setHistory([]);
    setWinner(null);
  };

  if (winner) {
    return (
      <section className="flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center py-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl text-center"
        >
          <Crown aria-hidden="true" className="mx-auto size-12 text-amber-600" strokeWidth={1.5} />
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Votre prénom favori</p>
          <h1 className="mt-3 break-words font-serif text-6xl tracking-[-0.04em] text-stone-950 sm:text-8xl">{winner}</h1>
          <p className="mx-auto mt-5 max-w-md text-lg leading-8 text-stone-600">
            Après {history.length} choix, ce prénom arrive en tête de votre sélection.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={restart} variant="outline" size="lg" className="h-12 rounded-xl bg-white">
              <RotateCcw aria-hidden="true" /> Rejouer cette liste
            </Button>
            <Button onClick={() => router.push('/')} size="lg" className="h-12 rounded-xl bg-stone-900 text-white hover:bg-stone-800">
              Recommencer avec une autre liste
            </Button>
          </div>
        </motion.div>
        <History entries={history} onRollback={rollback} />
      </section>
    );
  }

  if (!pair) {
    return (
      <div role="alert" className="mx-auto mt-20 max-w-lg rounded-xl border border-red-200 bg-red-50 p-5 text-red-900">
        Le tournoi ne peut pas continuer avec cette liste. Revenez à l&apos;accueil et ajoutez au moins deux prénoms différents.
      </div>
    );
  }

  const duels = remainingDuels(tournament);

  return (
    <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col justify-center py-6">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Button onClick={() => router.push('/')} variant="ghost" className="-ml-3 mb-5 text-stone-600">
            <ArrowLeft aria-hidden="true" /> Quitter le tournoi
          </Button>
          <h1 className="font-serif text-4xl tracking-[-0.03em] sm:text-5xl">Lequel préférez-vous ?</h1>
          <p className="mt-2 text-stone-600">
            Manche {tournament.currentRound} · {duels} duel{duels !== 1 ? 's' : ''} à départager
          </p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200 sm:w-48" aria-label={`Manche ${tournament.currentRound}`}>
          <div
            className="h-full rounded-full bg-rose-700 transition-[width] duration-500"
            style={{ width: `${Math.max(12, 100 / Math.max(1, duels))}%` }}
          />
        </div>
      </div>

      <div className={`grid gap-4 ${pair.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        {pair.map((name, index) => (
          <motion.div
            key={`${tournament.currentRound}-${name}-${index}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              onClick={() => chooseName(index as 0 | 1 | 2)}
              className="group min-h-64 w-full rounded-[1.75rem] border border-white/80 bg-white/90 p-7 text-left shadow-[0_20px_60px_-38px_rgba(77,48,38,0.7)] transition-[transform,box-shadow,background-color] duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_28px_70px_-36px_rgba(77,48,38,0.7)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-700/30"
            >
              <span className={`flex size-11 items-center justify-center rounded-full ${gender === 'girl' ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'}`}>
                <Check aria-hidden="true" className="size-5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
              </span>
              <span className="mt-16 block break-words font-serif text-4xl tracking-[-0.03em] text-stone-950 sm:text-5xl">{name}</span>
              <span className="mt-3 block text-sm text-stone-500">Choisir ce prénom</span>
            </button>
          </motion.div>
        ))}
      </div>

      <History entries={history} onRollback={rollback} />
    </section>
  );
}

function History({
  entries,
  onRollback,
}: {
  entries: DuelHistoryEntry[];
  onRollback: (index: number) => void;
}) {
  if (entries.length === 0) return null;
  return (
    <details className="mt-10 w-full rounded-2xl border border-stone-200 bg-white/60 p-4">
      <summary className="cursor-pointer font-semibold text-stone-700">
        Historique des choix ({entries.length})
      </summary>
      <ol className="mt-4 grid gap-2">
        {entries.map((entry, index) => (
          <li key={`${entry.round}-${index}`} className="flex flex-col gap-3 rounded-xl bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="min-w-0 break-words text-stone-700">
              Manche {entry.round} · <strong className="text-stone-950">{entry.winner}</strong> préféré à {entry.losers.join(' et ')}
            </span>
            <Button variant="ghost" size="sm" onClick={() => onRollback(index)} className="self-start text-stone-600 sm:self-auto">
              <Undo2 aria-hidden="true" /> Revenir ici
            </Button>
          </li>
        ))}
      </ol>
    </details>
  );
}
