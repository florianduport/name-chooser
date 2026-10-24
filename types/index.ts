export type Gender = 'boy' | 'girl';

export type Name = {
  id: string;
  name: string;
  gender: Gender;
  createdAt: string;
};

export type TournamentState = {
  currentRound: number;
  remainingNames: string[];
  selectedNames: string[];
};

export type DuelHistoryEntry = {
  tournamentStateBeforeDuel: TournamentState;
  round: number;
  pair: [string, string] | [string, string, string];
  winner: string;
  losers: string[];
};

export type TournamentMode = 'custom' | 'database';
