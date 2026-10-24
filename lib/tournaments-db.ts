import { pool } from '@/lib/postgres';
import type { Gender, TournamentMode } from '@/types';

export type TournamentResult = {
  id: string;
  gender: Gender;
  mode: TournamentMode;
  winner: string;
  choices: number;
  completedAt: string;
};

export async function createPersistedTournament(
  userId: number,
  gender: Gender,
  mode: TournamentMode,
  names: string[],
): Promise<string> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO tournaments (user_id, gender, mode, initial_names)
     VALUES ($1, $2, $3, $4::jsonb)
     RETURNING id`,
    [userId, gender, mode, JSON.stringify(names)],
  );
  return result.rows[0].id;
}

export async function recordVote(
  userId: number,
  tournamentId: string,
  vote: {
    sequence: number;
    round: number;
    pair: string[];
    winner: string;
    finalWinner?: string;
  },
) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tournament = await client.query(
      'SELECT id FROM tournaments WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [tournamentId, userId],
    );
    if (tournament.rowCount !== 1) throw new Error('NOT_FOUND');

    await client.query(
      `INSERT INTO tournament_votes
       (tournament_id, user_id, sequence, round, pair, winner)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6)
       ON CONFLICT (tournament_id, sequence) DO UPDATE
       SET round = EXCLUDED.round,
           pair = EXCLUDED.pair,
           winner = EXCLUDED.winner`,
      [
        tournamentId,
        userId,
        vote.sequence,
        vote.round,
        JSON.stringify(vote.pair),
        vote.winner,
      ],
    );

    if (vote.finalWinner) {
      await client.query(
        `UPDATE tournaments
         SET status = 'completed', winner = $3, completed_at = NOW()
         WHERE id = $1 AND user_id = $2`,
        [tournamentId, userId, vote.finalWinner],
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function rollbackVotes(
  userId: number,
  tournamentId: string,
  fromSequence: number,
) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tournament = await client.query(
      'SELECT id FROM tournaments WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [tournamentId, userId],
    );
    if (tournament.rowCount !== 1) throw new Error('NOT_FOUND');
    await client.query(
      `DELETE FROM tournament_votes
       WHERE tournament_id = $1 AND user_id = $2 AND sequence >= $3`,
      [tournamentId, userId, fromSequence],
    );
    await client.query(
      `UPDATE tournaments
       SET status = 'active', winner = NULL, completed_at = NULL
       WHERE id = $1 AND user_id = $2`,
      [tournamentId, userId],
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getTournamentResults(
  userId: number,
): Promise<TournamentResult[]> {
  const result = await pool.query<{
    id: string;
    gender: Gender;
    mode: TournamentMode;
    winner: string;
    choices: string;
    completed_at: Date;
  }>(
    `SELECT t.id, t.gender, t.mode, t.winner, t.completed_at,
            COUNT(v.id)::text AS choices
     FROM tournaments t
     LEFT JOIN tournament_votes v ON v.tournament_id = t.id
     WHERE t.user_id = $1 AND t.status = 'completed'
     GROUP BY t.id
     ORDER BY t.completed_at DESC
     LIMIT 50`,
    [userId],
  );

  return result.rows.map((row) => ({
    id: row.id,
    gender: row.gender,
    mode: row.mode,
    winner: row.winner,
    choices: Number(row.choices),
    completedAt: row.completed_at.toISOString(),
  }));
}
