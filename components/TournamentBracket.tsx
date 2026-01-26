'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    createTournament,
    getCurrentPair,
    selectWinner,
    nextRound,
    isTournamentComplete,
    getWinner,
} from '@/lib/tournament';
import { TournamentState, Gender, DuelHistoryEntry } from '@/types';

interface TournamentBracketProps {
    initialNames: string[];
    gender: Gender;
}

function DuelHistorySection({
    history,
    onRollback,
    compact = false,
}: {
    history: DuelHistoryEntry[];
    onRollback: (i: number) => void;
    compact?: boolean;
}) {
    if (history.length === 0) return null;
    return (
        <div className={compact ? 'space-y-2' : 'space-y-4'}>
            <h3 className={compact ? 'text-lg font-semibold' : 'text-xl font-semibold'}>
                Historique des duels
            </h3>
            <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className={compact ? 'px-3 py-2 text-sm font-medium' : 'px-4 py-3 text-sm font-medium'}>Round</th>
                            <th className={compact ? 'px-3 py-2 text-sm font-medium' : 'px-4 py-3 text-sm font-medium'}>Duel</th>
                            <th className={compact ? 'px-3 py-2 text-sm font-medium' : 'px-4 py-3 text-sm font-medium'}>Gagnant</th>
                            <th className={compact ? 'px-3 py-2 text-sm font-medium' : 'px-4 py-3 text-sm font-medium'}>Éliminé(s)</th>
                            <th className={compact ? 'px-3 py-2 text-sm font-medium' : 'px-4 py-3 text-sm font-medium'}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((entry, i) => (
                            <tr key={i} className="border-b last:border-b-0 hover:bg-muted/30">
                                <td className={compact ? 'px-3 py-2 text-sm text-muted-foreground' : 'px-4 py-3 text-sm text-muted-foreground'}>{entry.round}</td>
                                <td className={compact ? 'px-3 py-2 text-sm' : 'px-4 py-3 text-sm'}>{entry.pair.join(' vs ')}</td>
                                <td className={compact ? 'px-3 py-2 text-sm' : 'px-4 py-3 text-sm'}>{entry.winner}</td>
                                <td className={compact ? 'px-3 py-2 text-sm' : 'px-4 py-3 text-sm'}>{entry.losers.join(', ')}</td>
                                <td className={compact ? 'px-3 py-2 text-sm' : 'px-4 py-3 text-sm'}>
                                    <Button variant="outline" size="sm" onClick={() => onRollback(i)}>
                                        ↩️ Revenir ici
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function TournamentBracket({ initialNames, gender }: TournamentBracketProps) {
    const router = useRouter();
    const [tournament, setTournament] = useState<TournamentState | null>(null);
    const [currentPair, setCurrentPair] = useState<[string, string] | [string, string, string] | null>(null);
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [isFinal, setIsFinal] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [nextRoundNumber, setNextRoundNumber] = useState<number | null>(null);
    const [showWinnerCenter, setShowWinnerCenter] = useState(false);
    const [winnerName, setWinnerName] = useState<string | null>(null);
    const [loserName, setLoserName] = useState<string | null>(null);
    const [duelHistory, setDuelHistory] = useState<DuelHistoryEntry[]>([]);
    const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const newTournament = createTournament(initialNames);
        setTournament(newTournament);
        const pair = getCurrentPair(newTournament);
        setCurrentPair(pair);
        setDuelHistory([]);
    }, [initialNames]);

    const triggerConfetti = useCallback(() => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            });
        }, 250);
    }, []);

    const triggerFinalConfetti = useCallback(() => {
        const duration = 5000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'],
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'],
            });
        }, 250);

        // Une grande explosion au centre
        confetti({
            particleCount: 100,
            angle: 60,
            spread: 55,
            origin: { x: 0.5 },
            colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'],
        });
        confetti({
            particleCount: 100,
            angle: 120,
            spread: 55,
            origin: { x: 0.5 },
            colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'],
        });
    }, []);

    const handleSelect = useCallback(
        (winnerIndex: 0 | 1 | 2) => {
            if (!tournament || !currentPair) return;

            const winner = currentPair[winnerIndex];
            if (winner == null) return;
            // Pour un triplet, on n'affiche pas de "loser" spécifique car il y en a 2
            const loser = currentPair.length === 3 ? null : currentPair[1 - winnerIndex];

            // Vérifier si c'est le dernier duel du round
            // C'est le dernier duel si après avoir retiré les noms du duel actuel, il ne reste plus de noms
            const isLastDuel = tournament.remainingNames.length === currentPair.length;
            
            // Déclencher les confettis uniquement si c'est le dernier duel du round
            if (isLastDuel) {
                triggerConfetti();
            }
            
            setSelectedName(winner);
            setWinnerName(winner);
            setLoserName(loser || null);

            // Étape 1: Faire disparaître le perdant immédiatement (300ms)
            // Étape 2: Déplacer le gagnant au centre (après 400ms)
            setTimeout(() => {
                setShowWinnerCenter(true);

                // Étape 3: Faire disparaître le gagnant et passer au suivant (après 1000ms supplémentaires)
                setTimeout(() => {
                    setShowWinnerCenter(false);
                    const losers =
                        currentPair.length === 3
                            ? currentPair.filter((n) => n !== winner)
                            : [currentPair[1 - winnerIndex]];
                    const entry: DuelHistoryEntry = {
                        tournamentStateBeforeDuel: structuredClone(tournament),
                        round: tournament.currentRound,
                        pair: currentPair,
                        winner,
                        losers,
                    };
                    setDuelHistory((prev) => [...prev, entry]);
                    const newTournament = selectWinner(tournament, winnerIndex);
                    setSelectedName(null);
                    setWinnerName(null);
                    setLoserName(null);

                    // #region agent log
                    fetch('http://127.0.0.1:7243/ingest/13ebe54d-7b76-4e7b-b767-6be0b64ac4e3', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'TournamentBracket.tsx:149', message: 'After selectWinner', data: { remainingNamesLength: newTournament.remainingNames.length, selectedNamesLength: newTournament.selectedNames.length, selectedNames: newTournament.selectedNames }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
                    // #endregion

                    // Si il reste 1 nom (cas impair), on l'ajoute automatiquement aux selectedNames
                    let tournamentToProcess = newTournament;
                    if (newTournament.remainingNames.length === 1) {
                        tournamentToProcess = {
                            ...newTournament,
                            remainingNames: [],
                            selectedNames: [...newTournament.selectedNames, newTournament.remainingNames[0]],
                        };
                        // #region agent log
                        fetch('http://127.0.0.1:7243/ingest/13ebe54d-7b76-4e7b-b767-6be0b64ac4e3', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'TournamentBracket.tsx:156', message: 'Added remaining name to selectedNames', data: { addedName: newTournament.remainingNames[0], newSelectedNamesLength: tournamentToProcess.selectedNames.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
                        // #endregion
                    }

                    if (tournamentToProcess.remainingNames.length === 0) {
                        // Vérifier d'abord si le tournoi est terminé (selectedNames.length === 1)
                        // AVANT d'appeler nextRound, car nextRound retourne le tournoi inchangé dans ce cas
                        if (tournamentToProcess.selectedNames.length === 1) {
                            // #region agent log
                            fetch('http://127.0.0.1:7243/ingest/13ebe54d-7b76-4e7b-b767-6be0b64ac4e3', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'TournamentBracket.tsx:165', message: 'Tournament complete path', data: { winner: tournamentToProcess.selectedNames[0] }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
                            // #endregion
                            // Le tournoi est terminé !
                            setWinner(tournamentToProcess.selectedNames[0]);
                            setIsFinal(true);
                            triggerFinalConfetti();
                        } else {
                            // #region agent log
                            fetch('http://127.0.0.1:7243/ingest/13ebe54d-7b76-4e7b-b767-6be0b64ac4e3', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'TournamentBracket.tsx:170', message: 'Going to next round', data: { selectedNamesLength: tournamentToProcess.selectedNames.length, selectedNames: tournamentToProcess.selectedNames }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
                            // #endregion
                            // Passer au round suivant
                            // Vérifier que selectedNames a au moins 2 éléments avant d'appeler nextRound
                            if (tournamentToProcess.selectedNames.length < 2) {
                                // Cas de sécurité : si selectedNames.length < 2, c'est une erreur
                                // car on ne devrait pas arriver ici si selectedNames.length === 1 (déjà vérifié)
                                console.error('Unexpected state: selectedNames.length < 2', tournamentToProcess);
                                if (tournamentToProcess.selectedNames.length === 1) {
                                    setWinner(tournamentToProcess.selectedNames[0]);
                                    setIsFinal(true);
                                    triggerFinalConfetti();
                                }
                                return;
                            }

                            const nextTournamentState = nextRound(tournamentToProcess);

                            // #region agent log
                            fetch('http://127.0.0.1:7243/ingest/13ebe54d-7b76-4e7b-b767-6be0b64ac4e3', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'TournamentBracket.tsx:172', message: 'After nextRound', data: { currentRound: nextTournamentState.currentRound, previousRound: tournament.currentRound, remainingNamesLength: nextTournamentState.remainingNames.length, selectedNamesLength: nextTournamentState.selectedNames.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
                            // #endregion

                            // Vérifier que nextRound a bien créé un nouveau round avec au moins 2 noms
                            if (nextTournamentState.currentRound > tournament.currentRound) {
                                if (nextTournamentState.remainingNames.length < 2) {
                                    // Erreur : nextRound devrait avoir créé un round avec au moins 2 noms
                                    console.error('nextRound created round with less than 2 names', nextTournamentState);
                                    // Vérifier si c'est la fin du tournoi
                                    if (isTournamentComplete(nextTournamentState)) {
                                        const finalWinner = getWinner(nextTournamentState);
                                        setWinner(finalWinner || null);
                                        setIsFinal(true);
                                        triggerFinalConfetti();
                                    }
                                    return;
                                }

                                // On passe au round suivant (nextRound a créé un nouveau round)
                                setIsTransitioning(true);
                                setNextRoundNumber(nextTournamentState.currentRound);

                                // Afficher l'animation de transition pendant 2 secondes
                                if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
                                transitionTimeoutRef.current = setTimeout(() => {
                                    transitionTimeoutRef.current = null;
                                    // #region agent log
                                    fetch('http://127.0.0.1:7243/ingest/13ebe54d-7b76-4e7b-b767-6be0b64ac4e3', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'TournamentBracket.tsx:180', message: 'Transition timeout fired', data: { remainingNamesLength: nextTournamentState.remainingNames.length, selectedNamesLength: nextTournamentState.selectedNames.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
                                    // #endregion
                                    setTournament(nextTournamentState);
                                    const pair = getCurrentPair(nextTournamentState);
                                    // #region agent log
                                    fetch('http://127.0.0.1:7243/ingest/13ebe54d-7b76-4e7b-b767-6be0b64ac4e3', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'TournamentBracket.tsx:183', message: 'getCurrentPair result', data: { pairIsNull: pair === null, pairLength: pair?.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
                                    // #endregion
                                    if (pair) {
                                        setCurrentPair(pair);
                                        setIsTransitioning(false);
                                        setNextRoundNumber(null);
                                    } else {
                                        // Si getCurrentPair retourne null, vérifier si le tournoi est terminé
                                        if (isTournamentComplete(nextTournamentState)) {
                                            const finalWinner = getWinner(nextTournamentState);
                                            setWinner(finalWinner || null);
                                            setIsFinal(true);
                                            triggerFinalConfetti();
                                        } else {
                                            // Erreur : on ne devrait pas arriver ici
                                            console.error('getCurrentPair returned null after nextRound', nextTournamentState);
                                            setIsTransitioning(false);
                                            setNextRoundNumber(null);
                                        }
                                    }
                                }, 2000);
                            } else {
                                // Si nextRound ne change pas le round, c'est que selectedNames.length === 1
                                // mais on a déjà vérifié ce cas au-dessus, donc cela ne devrait jamais arriver
                                // Double vérification de sécurité
                                if (nextTournamentState.selectedNames.length === 1) {
                                    setWinner(nextTournamentState.selectedNames[0]);
                                    setIsFinal(true);
                                    triggerFinalConfetti();
                                } else {
                                    // Fallback : on met à jour avec nextTournamentState
                                    setTournament(nextTournamentState);
                                    const pair = getCurrentPair(nextTournamentState);
                                    setCurrentPair(pair);
                                }
                            }
                        }
                    } else {
                        setTournament(newTournament);
                        const pair = getCurrentPair(newTournament);
                        setCurrentPair(pair);
                    }
                }, 1000);
            }, 400);
        },
        [tournament, currentPair, triggerConfetti, triggerFinalConfetti]
    );

    // Calculer le nombre de duels restants
    const getRemainingDuels = useCallback((tournamentState: TournamentState | null) => {
        if (!tournamentState) return 0;
        const totalRemaining = tournamentState.remainingNames.length;
        
        // Au round 1, si le nombre est impair, le premier duel est à 3
        if (tournamentState.currentRound === 1 && totalRemaining >= 3 && totalRemaining % 2 === 1) {
            // Duel à 3 + les duels restants (2 noms chacun)
            const remainingAfterTriplet = totalRemaining - 3;
            return 1 + Math.ceil(remainingAfterTriplet / 2);
        }
        
        // Sinon, calcul classique : nombre de noms / 2
        const duels = Math.ceil(totalRemaining / 2);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/13ebe54d-7b76-4e7b-b767-6be0b64ac4e3', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'TournamentBracket.tsx:283', message: 'getRemainingDuels', data: { totalRemaining, duels, currentRound: tournamentState.currentRound }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'F' }) }).catch(() => { });
        // #endregion
        return duels;
    }, []);

    const handleRollback = useCallback(
        (index: number) => {
            const entry = duelHistory[index];
            if (!entry) return;
            if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
                transitionTimeoutRef.current = null;
            }
            setTournament(entry.tournamentStateBeforeDuel);
            const pair = getCurrentPair(entry.tournamentStateBeforeDuel);
            setCurrentPair(pair);
            setDuelHistory((prev) => prev.slice(0, index));
            setSelectedName(null);
            setShowWinnerCenter(false);
            setWinnerName(null);
            setLoserName(null);
            setIsTransitioning(false);
            setNextRoundNumber(null);
            setWinner(null);
            setIsFinal(false);
        },
        [duelHistory]
    );

    if (isFinal && winner) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-start gap-8 overflow-y-auto py-8">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, type: 'spring' }}
                    className="text-center space-y-8"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                        className="text-8xl mb-4"
                    >
                        🎉
                    </motion.div>
                    <Card className="p-12 max-w-2xl mx-auto">
                        <CardContent className="space-y-6">
                            <h2 className="text-3xl font-bold text-muted-foreground">Le prénom choisi est...</h2>
                            <motion.h1
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                                className="text-7xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent"
                            >
                                {winner}
                            </motion.h1>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                            >
                                <Button
                                    onClick={() => router.push('/')}
                                    size="lg"
                                    className="mt-8"
                                >
                                    Recommencer
                                </Button>
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>
                <div className="w-full max-w-6xl px-4">
                    <DuelHistorySection history={duelHistory} onRollback={handleRollback} />
                </div>
            </div>
        );
    }

    if (isTransitioning && nextRoundNumber) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-start gap-8 overflow-y-auto p-4 py-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center space-y-6"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="text-6xl mb-4"
                    >
                        🔄
                    </motion.div>
                    <Card className="p-8 max-w-xl mx-auto">
                        <CardContent className="space-y-4">
                            <motion.h2
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-3xl font-bold"
                            >
                                Round {nextRoundNumber}
                            </motion.h2>
                            <motion.p
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-lg text-muted-foreground"
                            >
                                Vous allez maintenant revoir les prénoms que vous avez présélectionnés dans le round précédent !
                            </motion.p>
                        </CardContent>
                    </Card>
                </motion.div>
                <div className="w-full max-w-6xl px-4">
                    <DuelHistorySection history={duelHistory} onRollback={handleRollback} compact />
                </div>
            </div>
        );
    }

    if (!currentPair || !tournament) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Chargement...</p>
            </div>
        );
    }

    // Animation du gagnant au centre
    if (showWinnerCenter && winnerName) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1.1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="text-center w-full max-w-md"
                >
                    <Card className="w-full">
                        <CardContent className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="text-6xl mb-4">
                                    {gender === 'boy' ? '👦' : '👧'}
                                </div>
                                <h3 className="text-5xl font-bold">{winnerName}</h3>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    const remainingDuels = getRemainingDuels(tournament);

    return (
        <div className="flex min-h-screen flex-col items-center justify-start overflow-y-auto p-4 py-8">
            <div className="w-full max-w-6xl space-y-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">
                        Round {tournament.currentRound}
                    </h2>
                    <p className="text-muted-foreground">
                        {remainingDuels} duel{remainingDuels > 1 ? 's' : ''} restant{remainingDuels > 1 ? 's' : ''} dans ce round
                    </p>
                </div>

                <div className={`grid gap-6 relative ${currentPair.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                    {currentPair.map((name, index) => {
                        const isWinner = selectedName === name;
                        const isLoser = loserName === name;

                        return (
                            <motion.div
                                key={`${name}-${tournament.currentRound}-${index}`}
                                initial={{ opacity: 0, x: currentPair.length === 3 
                                    ? (index === 0 ? -50 : index === 1 ? 0 : 50)
                                    : (index === 0 ? -50 : 50)
                                }}
                                animate={{
                                    opacity: isLoser ? 0 : 1,
                                    x: 0,
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card
                                    className={`cursor-pointer h-64 transition-all duration-300 ${isWinner && !showWinnerCenter
                                        ? 'ring-4 ring-primary'
                                        : isLoser
                                            ? 'opacity-0 pointer-events-none'
                                            : selectedName
                                                ? 'pointer-events-none'
                                                : 'hover:shadow-xl hover:scale-[1.02]'
                                        }`}
                                    onClick={() => !selectedName && handleSelect(index as 0 | 1 | 2)}
                                >
                                    <CardContent className="flex items-center justify-center h-full">
                                        <motion.div
                                            whileHover={!selectedName ? { scale: 1.05 } : {}}
                                            whileTap={!selectedName ? { scale: 0.95 } : {}}
                                            className="text-center"
                                        >
                                            <div className="text-6xl mb-4">
                                                {gender === 'boy' ? '👦' : '👧'}
                                            </div>
                                            <h3 className="text-4xl font-bold">{name}</h3>
                                        </motion.div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    {selectedName 
                        ? 'Prénom sélectionné !' 
                        : currentPair.length === 3 
                            ? 'Cliquez sur le prénom que vous préférez parmi les 3' 
                            : 'Cliquez sur le prénom que vous préférez'}
                </div>

                <DuelHistorySection history={duelHistory} onRollback={handleRollback} />
            </div>
        </div>
    );
}
