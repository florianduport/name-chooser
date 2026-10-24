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
  
  // Mélanger les noms pour rendre le tournoi plus intéressant
  const shuffledNames = shuffleArray(uniqueNames);
  
  return {
    currentRound: 1,
    remainingNames: shuffledNames,
    selectedNames: [],
  };
}

// Obtenir les deux ou trois prochains noms à comparer
// Si le nombre est impair, un duel à trois évite un passage automatique.
export function getCurrentPair(tournament: TournamentState): [string, string] | [string, string, string] | null {
  if (tournament.remainingNames.length >= 3 && tournament.remainingNames.length % 2 === 1) {
    return [
      tournament.remainingNames[0],
      tournament.remainingNames[1],
      tournament.remainingNames[2]
    ];
  }
  
  // Sinon, on fait un duel à 2 comme d'habitude
  if (tournament.remainingNames.length < 2) {
    return null;
  }
  
  // Garantir qu'on ne propose jamais deux fois le même nom dans la même paire
  const name1 = tournament.remainingNames[0];
  const name2 = tournament.remainingNames[1];
  
  // Cette vérification est théoriquement inutile car on retire les noms après usage,
  // mais c'est une sécurité supplémentaire
  if (name1 === name2 && tournament.remainingNames.length > 2) {
    // Si par hasard on a un doublon (ne devrait jamais arriver), on prend le suivant
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
  
  // Si c'est un triplet (3 noms)
  if (pair.length === 3) {
    const winner = pair[winnerIndex];
    // Retirer les 3 noms de la liste restante (slice(3) retire les 3 premiers)
    const newRemainingNames = tournament.remainingNames.slice(3);
    // Ajouter le gagnant à la liste des sélectionnés pour le round suivant
    const newSelectedNames = [...tournament.selectedNames, winner];
    
    return {
      ...tournament,
      remainingNames: newRemainingNames,
      selectedNames: newSelectedNames,
    };
  }
  
  // Si c'est un duel classique (2 noms) — winnerIndex est nécessairement 0 ou 1
  const idx = winnerIndex as 0 | 1;
  const winner = pair[idx];
  // Retirer les deux noms de la liste restante (slice(2) retire les 2 premiers)
  const newRemainingNames = tournament.remainingNames.slice(2);
  
  // Ajouter le gagnant à la liste des sélectionnés pour le round suivant
  const newSelectedNames = [...tournament.selectedNames, winner];
  
  return {
    ...tournament,
    remainingNames: newRemainingNames,
    selectedNames: newSelectedNames,
  };
}

// Passer au round suivant
export function nextRound(tournament: TournamentState): TournamentState {
  // Si il reste encore des noms dans le round actuel, on ne peut pas passer au suivant
  if (tournament.remainingNames.length > 0) {
    return tournament;
  }
  
  // Si il n'y a qu'un seul nom sélectionné, c'est le gagnant final
  if (tournament.selectedNames.length === 1) {
    return tournament;
  }
  
  // Mélanger les noms sélectionnés pour le nouveau round
  // Pas besoin de vérifier les doublons car selectedNames ne contient que des gagnants uniques
  const shuffledSelected = shuffleArray(tournament.selectedNames);
  
  return {
    currentRound: tournament.currentRound + 1,
    remainingNames: shuffledSelected,
    selectedNames: [],
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
  let rounds = 0;
  let remaining = Math.max(0, namesCount);
  while (remaining > 1) {
    remaining = Math.floor(remaining / 2);
    rounds += 1;
  }
  return rounds;
}

export function getRoundProgress(tournament: TournamentState) {
  const completed = tournament.selectedNames.length;
  const remaining = Math.floor(tournament.remainingNames.length / 2);
  const total = completed + remaining;
  return {
    current: Math.min(completed + 1, total),
    total,
  };
}

export function getTotalDuels(namesCount: number): number {
  let names = namesCount;
  let total = 0;
  while (names > 1) {
    const duels = Math.floor(names / 2);
    total += duels;
    names = duels;
  }
  return total;
}
