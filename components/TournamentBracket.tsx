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
import { DuelHistoryEntry, Gender, TournamentMode, TournamentState } from '@/types';

interface TournamentBracketProps {
  initialNames: string[];
  gender: Gender;
  tournamentId: string;
  mode: TournamentMode;
}

function remainingDuels(tournament: TournamentState) {
  return Math.floor(tournament.remainingNames.length / 2);
}

export default function TournamentBracket({
  initialNames,
  gender,
  tournamentId,
  mode,
}: TournamentBracketProps) {
  const router = useRouter();
  const [tournament, setTournament] = useState(() => createTournament(initialNames));
  const [activeTournamentId, setActiveTournamentId] = useState(tournamentId);
  const [history, setHistory] = useState<DuelHistoryEntry[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pair = getCurrentPair(tournament);

  const celebrate = useCallback(() => {
    const colors = ['#be123c', '#0369a1', '#f59e0b', '#65a30d'];
    confetti({ particleCount: 110, spread: 80, origin: { y: 0.65 }, colors });
  }, []);

  const chooseName = async (winnerIndex: 0 | 1 | 2) => {
    if (!pair || isSaving) return;
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

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/tournaments/${activeTournamentId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sequence: history.length,
          round: tournament.currentRound,
          pair,
          winner: selectedWinner,
          finalWinner: finalWinner ?? undefined,
        }),
      });
      if (!response.ok) throw new Error('Votre choix n’a pas pu être enregistré.');
      setHistory((current) => [...current, entry]);
      setTournament(completedState);
      if (finalWinner) {
        setWinner(finalWinner);
        celebrate();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'L’enregistrement a échoué.');
    } finally {
      setIsSaving(false);
    }
  };

  const rollback = async (index: number) => {
    const entry = history[index];
    if (!entry || isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/tournaments/${activeTournamentId}/votes?fromSequence=${index}`,
        { method: 'DELETE' },
      );
      if (!response.ok) throw new Error('Impossible de revenir à ce choix.');
      setTournament(structuredClone(entry.tournamentStateBeforeDuel));
      setHistory((current) => current.slice(0, index));
      setWinner(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Le retour a échoué.');
    } finally {
      setIsSaving(false);
    }
  };

  const restart = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names: initialNames, gender, mode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Impossible de relancer le tournoi.');
      setActiveTournamentId(data.id);
      setTournament(createTournament(initialNames));
      setHistory([]);
      setWinner(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'La relance a échoué.');
    } finally {
      setIsSaving(false);
    }
  };

  if (winner) {
    return (
      <section className="flex min-h-[calc(100dvh-1.5rem)] flex-col items-center justify-center py-3 sm:min-h-[calc(100dvh-3rem)] sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl text-center"
        >
          <Crown aria-hidden="true" className="mx-auto size-10 text-amber-600 sm:size-12" strokeWidth={1.5} />
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 sm:mt-6 sm:text-sm">Votre prénom favori</p>
          <h1 className="mt-2 break-words font-serif text-5xl tracking-[-0.04em] text-stone-950 sm:mt-3 sm:text-8xl">{winner}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600 sm:mt-5 sm:text-lg sm:leading-8">
            Après {history.length} choix, ce prénom arrive en tête de votre sélection.
          </p>
          {error && <p role="alert" className="mt-3 text-sm text-red-800">{error}</p>}
          <div className="mt-4 grid grid-cols-2 justify-center gap-2 sm:mt-8 sm:flex sm:gap-3">
            <Button onClick={restart} disabled={isSaving} variant="outline" size="lg" className="h-12 whitespace-normal rounded-xl bg-white">
              <RotateCcw aria-hidden="true" /> Rejouer
            </Button>
            <Button onClick={() => router.push('/')} size="lg" className="h-12 whitespace-normal rounded-xl bg-stone-900 text-white hover:bg-stone-800">
              Autre liste
            </Button>
          </div>
        </motion.div>
        <History entries={history} onRollback={rollback} disabled={isSaving} />
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
    <section className="mx-auto flex h-[calc(100dvh-1.5rem)] min-h-[32rem] w-full max-w-6xl flex-col overflow-y-auto py-0 sm:h-auto sm:min-h-[calc(100dvh-3rem)] sm:justify-center sm:py-6">
      <div className="mb-3 flex items-end justify-between gap-3 sm:mb-8 sm:gap-5">
        <div className="min-w-0">
          <Button onClick={() => router.push('/')} variant="ghost" size="icon-lg" aria-label="Quitter le tournoi" className="-ml-3 mb-1 text-stone-600 sm:mb-5 sm:w-auto sm:px-4">
            <ArrowLeft aria-hidden="true" /> <span className="hidden sm:inline">Quitter le tournoi</span>
          </Button>
          <h1 className="truncate font-serif text-2xl tracking-[-0.03em] sm:text-5xl">Lequel préférez-vous ?</h1>
          <p className="mt-1 text-xs text-stone-600 sm:mt-2 sm:text-base">
            Manche {tournament.currentRound} · {duels} duel{duels !== 1 ? 's' : ''} à départager
          </p>
        </div>
        <div className="mb-1 h-2 w-20 shrink-0 overflow-hidden rounded-full bg-stone-200 sm:w-48" aria-label={`Manche ${tournament.currentRound}`}>
          <div
            className="h-full rounded-full bg-rose-700 transition-[width] duration-500"
            style={{ width: `${Math.max(12, 100 / Math.max(1, duels))}%` }}
          />
        </div>
      </div>

      {error && <p role="alert" className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-900">{error}</p>}

      <div className={`grid min-h-0 flex-1 gap-2 sm:gap-4 ${pair.length === 3 ? 'grid-rows-3 md:grid-cols-3 md:grid-rows-1' : 'grid-cols-2'}`}>
        {pair.map((name, index) => (
          <motion.div
            key={`${tournament.currentRound}-${name}-${index}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-0"
          >
            <button
              type="button"
              disabled={isSaving}
              onClick={() => chooseName(index as 0 | 1 | 2)}
              className="group flex h-full min-h-0 w-full flex-col justify-between rounded-2xl border border-white/80 bg-white/90 p-3 text-left shadow-[0_20px_60px_-38px_rgba(77,48,38,0.7)] transition-[transform,box-shadow,background-color] duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_28px_70px_-36px_rgba(77,48,38,0.7)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-700/30 disabled:pointer-events-none disabled:opacity-60 sm:min-h-64 sm:rounded-[1.75rem] sm:p-7"
            >
              <span className={`flex size-9 items-center justify-center rounded-full sm:size-11 ${gender === 'girl' ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'}`}>
                <Check aria-hidden="true" className="size-4 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:size-5" />
              </span>
              <span className="block break-words font-serif text-2xl tracking-[-0.03em] text-stone-950 sm:mt-16 sm:text-5xl">{name}</span>
              <span className="block text-xs text-stone-500 sm:mt-3 sm:text-sm">Choisir</span>
            </button>
          </motion.div>
        ))}
      </div>

      <History entries={history} onRollback={rollback} disabled={isSaving} />
    </section>
  );
}

function History({
  entries,
  onRollback,
  disabled,
}: {
  entries: DuelHistoryEntry[];
  onRollback: (index: number) => Promise<void>;
  disabled: boolean;
}) {
  if (entries.length === 0) return null;
  return (
    <details className="mt-2 w-full shrink-0 rounded-xl border border-stone-200 bg-white/60 p-3 sm:mt-10 sm:rounded-2xl sm:p-4">
      <summary className="cursor-pointer text-sm font-semibold text-stone-700 sm:text-base">
        Historique des choix ({entries.length})
      </summary>
      <ol className="mt-4 grid gap-2">
        {entries.map((entry, index) => (
          <li key={`${entry.round}-${index}`} className="flex flex-col gap-3 rounded-xl bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="min-w-0 break-words text-stone-700">
              Manche {entry.round} · <strong className="text-stone-950">{entry.winner}</strong> préféré à {entry.losers.join(' et ')}
            </span>
            <Button disabled={disabled} variant="ghost" size="sm" onClick={() => onRollback(index)} className="self-start text-stone-600 sm:self-auto">
              <Undo2 aria-hidden="true" /> Revenir ici
            </Button>
          </li>
        ))}
      </ol>
    </details>
  );
}
