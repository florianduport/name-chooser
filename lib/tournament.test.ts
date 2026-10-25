import { describe, expect, it, vi } from 'vitest';
import {
  createTournament,
  getCurrentPair,
  getFirstRoundPlan,
  getRoundProgress,
  getTotalDuels,
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

    expect([...tournament.remainingNames, ...tournament.selectedNames]).toHaveLength(3);
    expect([...tournament.remainingNames, ...tournament.selectedNames]).toContain('Alice');
    expect([...tournament.remainingNames, ...tournament.selectedNames]).toContain('Jean Luc');
    expect(names[0]).toBe(' Alice ');
    vi.restoreAllMocks();
  });

  it.each([
    [50, 32, 18, 14],
    [52, 32, 20, 12],
    [100, 64, 36, 28],
  ])('balances %i names into %i first-round survivors', (count, survivors, duels, byes) => {
    expect(getFirstRoundPlan(count)).toEqual({ survivors, duels, byes });
  });

  it('finishes every size from 2 to 120 with a two-name final', () => {
    for (let count = 2; count <= 120; count += 1) {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      let state = createTournament(
        Array.from({ length: count }, (_, index) => `Name ${index + 1}`),
      );
      let finalPairLength = 0;

      while (!isTournamentComplete(state)) {
        const pair = getCurrentPair(state);
        expect(pair, `missing pair for ${count} names in round ${state.currentRound}`).not.toBeNull();
        if (!pair) break;
        if (pair.length === 3) {
          expect(state.currentRound).toBe(1);
        }
        if (state.roundTotalDuels === 1 && state.currentRound === getTotalRounds(count)) {
          finalPairLength = pair.length;
        }
        state = selectWinner(state, 0);
        if (state.remainingNames.length === 0 && !isTournamentComplete(state)) {
          state = nextRound(state);
        }
      }

      expect(getWinner(state), `${count}-name tournament did not finish`).toMatch(/^Name /);
      expect(finalPairLength, `${count}-name final was not observed`).toBe(2);
      vi.restoreAllMocks();
    }
  });

  it('uses pure duels after round one for every size from 2 to 120', () => {
    for (let count = 2; count <= 120; count += 1) {
      let state = createTournament(
        Array.from({ length: count }, (_, index) => `Name ${index + 1}`),
      );
      while (!isTournamentComplete(state)) {
        const pair = getCurrentPair(state);
        if (!pair) break;
        if (state.currentRound > 1) expect(pair).toHaveLength(2);
        state = selectWinner(state, 0);
        if (state.remainingNames.length === 0 && !isTournamentComplete(state)) {
          state = nextRound(state);
        }
      }
    }
    vi.restoreAllMocks();
  });

  it('reports the balanced bracket round count', () => {
    expect(getTotalRounds(3)).toBe(2);
    expect(getTotalRounds(7)).toBe(3);
    expect(getTotalRounds(8)).toBe(3);
    expect(getTotalRounds(50)).toBe(6);
  });

  it('advances round progress after every duel', () => {
    let state = createTournament(
      Array.from({ length: 44 }, (_, index) => `Name ${index}`),
    );
    expect(getRoundProgress(state)).toEqual({ current: 1, total: 12 });
    state = selectWinner(state, 0);
    state = selectWinner(state, 0);
    expect(getRoundProgress(state)).toEqual({ current: 3, total: 12 });
  });

  it('reports overall duel progress including the two-name final', () => {
    expect(getTotalDuels(2)).toBe(1);
    expect(getTotalDuels(3)).toBe(2);
    expect(getTotalDuels(50)).toBe(49);
    expect(getTotalDuels(120)).toBe(119);
  });
});
