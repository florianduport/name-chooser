import { TournamentState } from '@/types';

// Mélanger un tableau de manière aléatoire (Fisher-Yates)
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Vérifier qu'il n'y a pas de doublons dans un tableau (utilitaire)
export function hasDuplicates<T>(array: T[]): boolean {
  return new Set(array).size !== array.length;
}

// Créer un nouveau tournoi avec une liste de noms
export function createTournament(names: string[]): TournamentState {
  const seen = new Set<string>();
  const uniqueNames = names
    .map((name) => name.trim().replace(/\s+/g, ' '))
    .filter((name) => {
      if (!name) return false;
      const key = name.toLocaleLowerCase('fr');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  
  const shuffledNames = shuffleArray(uniqueNames);
  const plan = getFirstRoundPlan(shuffledNames.length);

  return {
    currentRound: 1,
    remainingNames: shuffledNames.slice(plan.byes),
    selectedNames: shuffledNames.slice(0, plan.byes),
    roundByeCount: plan.byes,
    roundTotalDuels: plan.duels,
  };
}

export function getFirstRoundPlan(namesCount: number) {
  if (namesCount < 2) return { survivors: namesCount, duels: 0, byes: namesCount };
  let survivors = 1;
  while (survivors * 2 < namesCount) survivors *= 2;
  const duels = namesCount - survivors;
  const byes = survivors - duels;
  return { survivors, duels, byes };
}

export function getCurrentPair(tournament: TournamentState): [string, string] | [string, string, string] | null {
  if (tournament.remainingNames.length < 2) {
    return null;
  }

  const name1 = tournament.remainingNames[0];
  const name2 = tournament.remainingNames[1];

  if (name1 === name2 && tournament.remainingNames.length > 2) {
    return [name1, tournament.remainingNames[2]];
  }

  return [name1, name2];
}

// Sélectionner un gagnant et éliminer le(s) perdant(s)
export function selectWinner(
  tournament: TournamentState,
  winnerIndex: 0 | 1 | 2
): TournamentState {
  const pair = getCurrentPair(tournament);
  if (!pair) {
    return tournament;
  }
  
  if (pair.length === 3) {
    const winner = pair[winnerIndex];
    const newRemainingNames = tournament.remainingNames.slice(3);
    const newSelectedNames = [...tournament.selectedNames, winner];
    
    return {
      ...tournament,
      remainingNames: newRemainingNames,
      selectedNames: newSelectedNames,
    };
  }
  
  const idx = winnerIndex as 0 | 1;
  const winner = pair[idx];
  const newRemainingNames = tournament.remainingNames.slice(2);
  const newSelectedNames = [...tournament.selectedNames, winner];
  
  return {
    ...tournament,
    remainingNames: newRemainingNames,
    selectedNames: newSelectedNames,
  };
}

export function nextRound(tournament: TournamentState): TournamentState {
  if (tournament.remainingNames.length > 0) {
    return tournament;
  }

  if (tournament.selectedNames.length === 1) {
    return tournament;
  }

  const shuffledSelected = shuffleArray(tournament.selectedNames);

  return {
    currentRound: tournament.currentRound + 1,
    remainingNames: shuffledSelected,
    selectedNames: [],
    roundByeCount: 0,
    roundTotalDuels: shuffledSelected.length / 2,
  };
}

// Vérifier si le tournoi est terminé
export function isTournamentComplete(tournament: TournamentState): boolean {
  return (
    tournament.remainingNames.length === 0 &&
    tournament.selectedNames.length === 1
  );
}

// Obtenir le gagnant final
export function getWinner(tournament: TournamentState): string | null {
  if (!isTournamentComplete(tournament)) {
    return null;
  }
  
  return tournament.selectedNames[0];
}

// Obtenir le nombre total de rounds nécessaires
export function getTotalRounds(namesCount: number): number {
  if (namesCount < 2) return 0;
  return Math.ceil(Math.log2(namesCount));
}

export function getRoundProgress(tournament: TournamentState) {
  const completed = tournament.selectedNames.length - tournament.roundByeCount;
  const total = tournament.roundTotalDuels;
  return {
    current: Math.min(completed + 1, total),
    total,
  };
}

export function getTotalDuels(namesCount: number): number {
  return Math.max(0, namesCount - 1);
}
