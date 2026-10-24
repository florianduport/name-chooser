import { describe, expect, it, vi } from 'vitest';
import {
  createTournament,
  getCurrentPair,
  getTotalRounds,
  getWinner,
  isTournamentComplete,
  nextRound,
  selectWinner,
} from './tournament';

describe('tournament', () => {
  it('normalizes and deduplicates names without changing the caller list', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const names = [' Alice ', 'alice', 'Jean  Luc', 'Zoé'];
    const tournament = createTournament(names);

    expect(tournament.remainingNames).toHaveLength(3);
    expect(tournament.remainingNames).toContain('Alice');
    expect(tournament.remainingNames).toContain('Jean Luc');
    expect(names[0]).toBe(' Alice ');
    vi.restoreAllMocks();
  });

  it('uses a three-name choice for odd rounds', () => {
    const tournament = {
      currentRound: 2,
      remainingNames: ['A', 'B', 'C'],
      selectedNames: [],
    };

    expect(getCurrentPair(tournament)).toEqual(['A', 'B', 'C']);
  });

  it.each([2, 3, 5, 7, 10])('finishes a %i-name tournament with one winner', (count) => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    let state = createTournament(
      Array.from({ length: count }, (_, index) => `Name ${index + 1}`),
    );

    while (!isTournamentComplete(state)) {
      expect(getCurrentPair(state)).not.toBeNull();
      state = selectWinner(state, 0);
      if (state.remainingNames.length === 0 && !isTournamentComplete(state)) {
        state = nextRound(state);
      }
    }

    expect(getWinner(state)).toMatch(/^Name /);
    vi.restoreAllMocks();
  });

  it('reports the actual number of rounds for the odd-name format', () => {
    expect(getTotalRounds(3)).toBe(1);
    expect(getTotalRounds(7)).toBe(2);
    expect(getTotalRounds(8)).toBe(3);
  });
});
