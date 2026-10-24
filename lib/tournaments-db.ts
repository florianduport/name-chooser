import { pool } from '@/lib/postgres';
import type { Gender, TournamentMode } from '@/types';

export type TournamentResult = {
  id: string;
  gender: Gender;
  mode: TournamentMode;
  winner: string;
  choices: number;
  completedAt: string;
  inviteToken: string | null;
};

export type InviteMetadata = {
  token: string;
  gender: Gender;
  nameCount: number;
  expiresAt: string;
};

export type InviteComparison = {
  token: string;
  sourceWinner: string;
  attempts: Array<{
    id: string;
    participantName: string;
    winner: string;
    choices: number;
    completedAt: string;
    matches: boolean;
  }>;
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
    invite_token: string | null;
  }>(
    `SELECT t.id, t.gender, t.mode, t.winner, t.completed_at,
            COUNT(v.id)::text AS choices, i.token AS invite_token
     FROM tournaments t
     LEFT JOIN tournament_votes v ON v.tournament_id = t.id
     LEFT JOIN tournament_invites i ON i.source_tournament_id = t.id
     WHERE t.user_id = $1 AND t.status = 'completed'
     GROUP BY t.id, i.token
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
    inviteToken: row.invite_token,
  }));
}

export async function createResultShare(
  userId: number,
  tournamentId: string,
) {
  const result = await pool.query<{ share_token: string; winner: string }>(
    `UPDATE tournaments
     SET share_token = COALESCE(share_token, gen_random_uuid())
     WHERE id = $1 AND user_id = $2 AND status = 'completed'
     RETURNING share_token, winner`,
    [tournamentId, userId],
  );
  return result.rows[0] ?? null;
}

export async function getPublicResult(token: string) {
  const result = await pool.query<{
    winner: string;
    completed_at: Date;
  }>(
    `SELECT winner, completed_at
     FROM tournaments
     WHERE share_token = $1 AND status = 'completed'
     LIMIT 1`,
    [token],
  );
  const row = result.rows[0];
  return row
    ? { winner: row.winner, completedAt: row.completed_at.toISOString() }
    : null;
}

export async function createInvite(userId: number, tournamentId: string) {
  const result = await pool.query<{ token: string }>(
    `INSERT INTO tournament_invites
       (owner_user_id, source_tournament_id, gender, mode, names)
     SELECT user_id, id, gender, mode, initial_names
     FROM tournaments
     WHERE id = $1 AND user_id = $2 AND status = 'completed'
     ON CONFLICT (owner_user_id, source_tournament_id) DO UPDATE
     SET expires_at = NOW() + INTERVAL '30 days'
     RETURNING token`,
    [tournamentId, userId],
  );
  return result.rows[0]?.token ?? null;
}

export async function getInviteMetadata(
  token: string,
): Promise<InviteMetadata | null> {
  const result = await pool.query<{
    token: string;
    gender: Gender;
    name_count: number;
    expires_at: Date;
  }>(
    `SELECT token, gender, jsonb_array_length(names) AS name_count, expires_at
     FROM tournament_invites
     WHERE token = $1 AND expires_at > NOW()
     LIMIT 1`,
    [token],
  );
  const row = result.rows[0];
  return row
    ? {
        token: row.token,
        gender: row.gender,
        nameCount: row.name_count,
        expiresAt: row.expires_at.toISOString(),
      }
    : null;
}

export async function acceptInvite(userId: number, token: string) {
  const result = await pool.query<{
    id: string;
    gender: Gender;
    mode: TournamentMode;
    names: string[];
  }>(
    `INSERT INTO tournaments
       (user_id, gender, mode, initial_names, invite_id)
     SELECT $1, gender, mode, names, id
     FROM tournament_invites
     WHERE token = $2 AND expires_at > NOW()
     RETURNING id, gender, mode, initial_names AS names`,
    [userId, token],
  );
  return result.rows[0] ?? null;
}

export async function getInviteComparison(
  userId: number,
  token: string,
): Promise<InviteComparison | null> {
  const invite = await pool.query<{
    id: string;
    token: string;
    source_winner: string;
  }>(
    `SELECT i.id, i.token, source.winner AS source_winner
     FROM tournament_invites i
     JOIN tournaments source ON source.id = i.source_tournament_id
     WHERE i.token = $1 AND i.owner_user_id = $2
     LIMIT 1`,
    [token, userId],
  );
  const row = invite.rows[0];
  if (!row) return null;

  const attempts = await pool.query<{
    id: string;
    participant_name: string | null;
    winner: string;
    choices: string;
    completed_at: Date;
  }>(
    `SELECT t.id, COALESCE(u.name, 'Invité') AS participant_name,
            t.winner, COUNT(v.id)::text AS choices, t.completed_at
     FROM tournaments t
     JOIN users u ON u.id = t.user_id
     LEFT JOIN tournament_votes v ON v.tournament_id = t.id
     WHERE t.invite_id = $1 AND t.status = 'completed'
     GROUP BY t.id, u.name
     ORDER BY t.completed_at DESC`,
    [row.id],
  );

  return {
    token: row.token,
    sourceWinner: row.source_winner,
    attempts: attempts.rows.map((attempt) => ({
      id: attempt.id,
      participantName: attempt.participant_name ?? 'Invité',
      winner: attempt.winner,
      choices: Number(attempt.choices),
      completedAt: attempt.completed_at.toISOString(),
      matches: attempt.winner === row.source_winner,
    })),
  };
}
