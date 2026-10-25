import { pool } from '@/lib/postgres';
import type { Gender, TournamentMode } from '@/types';
import { sendTournamentPush } from '@/lib/push';

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
  sourceTournamentId: string;
  sourceParticipantName: string;
  sourceWinner: string;
  attempts: Array<{
    id: string;
    participantName: string;
    winner: string;
    choices: number;
    completedAt: string;
    matches: boolean;
    commonNames: string[];
  }>;
};

export type TournamentHistory = {
  id: string;
  participantName: string;
  winner: string;
  votes: Array<{
    sequence: number;
    round: number;
    pair: string[];
    winner: string;
  }>;
  ranking: {
    winner: string[];
    finalists: string[];
    semiFinalists: string[];
  };
  commonNames: string[];
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
  const pushDeliveries: Array<{
    userId: number;
    kind: 'invitee_finished' | 'inviter_finished';
    actorName: string;
    token: string;
  }> = [];
  try {
    await client.query('BEGIN');
    const tournament = await client.query<{ id: string; invite_id: string | null }>(
      'SELECT id, invite_id FROM tournaments WHERE id = $1 AND user_id = $2 FOR UPDATE',
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
      const inviteId = tournament.rows[0].invite_id;
      if (inviteId) {
        await client.query(
          `INSERT INTO product_events
             (event_name, user_id, tournament_id, metadata)
           VALUES ('invitee_finished', $1, $2, jsonb_build_object('inviteId', $3::text))`,
          [userId, tournamentId, inviteId],
        );
        const invite = await client.query<{
          owner_user_id: number;
          token: string;
          owner_name: string | null;
          invitee_name: string | null;
        }>(
          `SELECT i.owner_user_id, i.token,
                  owner.name AS owner_name, invitee.name AS invitee_name
           FROM tournament_invites i
           JOIN users owner ON owner.id = i.owner_user_id
           JOIN users invitee ON invitee.id = $2
           WHERE i.id = $1`,
          [inviteId, userId],
        );
        const details = invite.rows[0];
        if (details && details.owner_user_id !== userId) {
          const ownerNotification = await client.query(
            `INSERT INTO notifications
             (user_id, kind, actor_name, invite_token, tournament_id)
             VALUES ($1, 'invitee_finished', $2, $3, $4)
             ON CONFLICT (user_id, kind, tournament_id) DO NOTHING
             RETURNING id`,
            [
              details.owner_user_id,
              details.invitee_name ?? 'Guest',
              details.token,
              tournamentId,
            ],
          );
          const inviteeNotification = await client.query(
            `INSERT INTO notifications
             (user_id, kind, actor_name, invite_token, tournament_id)
             VALUES ($1, 'inviter_finished', $2, $3, $4)
             ON CONFLICT (user_id, kind, tournament_id) DO NOTHING
             RETURNING id`,
            [
              userId,
              details.owner_name ?? 'Host',
              details.token,
              tournamentId,
            ],
          );
          if (ownerNotification.rowCount === 1) {
            pushDeliveries.push({
              userId: details.owner_user_id,
              kind: 'invitee_finished',
              actorName: details.invitee_name ?? 'Guest',
              token: details.token,
            });
          }
          if (inviteeNotification.rowCount === 1) {
            pushDeliveries.push({
              userId,
              kind: 'inviter_finished',
              actorName: details.owner_name ?? 'Host',
              token: details.token,
            });
          }
        }
      }
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  await Promise.all(pushDeliveries.map((delivery) =>
    sendTournamentPush(
      delivery.userId,
      delivery.kind,
      delivery.actorName,
      delivery.token,
    ),
  ));
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
    source_tournament_id: string;
    owner_user_id: number;
    owner_name: string | null;
    source_winner: string;
  }>(
    `SELECT i.id, i.token, i.source_tournament_id, i.owner_user_id,
            owner.name AS owner_name, source.winner AS source_winner
     FROM tournament_invites i
     JOIN tournaments source ON source.id = i.source_tournament_id
     JOIN users owner ON owner.id = i.owner_user_id
     WHERE i.token = $1
       AND (
         i.owner_user_id = $2 OR
         EXISTS (
           SELECT 1 FROM tournaments participant
           WHERE participant.invite_id = i.id AND participant.user_id = $2
         )
       )
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
       AND ($2 = $3::integer OR t.user_id = $2)
     GROUP BY t.id, u.name
     ORDER BY t.completed_at DESC`,
    [row.id, userId, row.owner_user_id],
  );

  const sourceRanking = await getTournamentRanking(row.source_tournament_id);
  const mappedAttempts = await Promise.all(attempts.rows.map(async (attempt) => {
    const ranking = await getTournamentRanking(attempt.id);
    const sourceHigh = new Set([
      ...sourceRanking.winner,
      ...sourceRanking.finalists,
      ...sourceRanking.semiFinalists,
    ]);
    const commonNames = [
      ...ranking.winner,
      ...ranking.finalists,
      ...ranking.semiFinalists,
    ].filter((name) => sourceHigh.has(name));
    return {
      id: attempt.id,
      participantName: attempt.participant_name ?? 'Guest',
      winner: attempt.winner,
      choices: Number(attempt.choices),
      completedAt: attempt.completed_at.toISOString(),
      matches: attempt.winner === row.source_winner,
      commonNames: Array.from(new Set(commonNames)),
    };
  }));

  return {
    token: row.token,
    sourceTournamentId: row.source_tournament_id,
    sourceParticipantName: row.owner_name ?? 'Host',
    sourceWinner: row.source_winner,
    attempts: mappedAttempts,
  };
}

async function getTournamentRanking(tournamentId: string) {
  const result = await pool.query<{
    winner: string;
    round: number;
    pair: string[];
    vote_winner: string;
  }>(
    `SELECT t.winner, v.round, v.pair, v.winner AS vote_winner
     FROM tournaments t
     JOIN tournament_votes v ON v.tournament_id = t.id
     WHERE t.id = $1 AND t.status = 'completed'
     ORDER BY v.sequence`,
    [tournamentId],
  );
  if (result.rows.length === 0) {
    return { winner: [] as string[], finalists: [] as string[], semiFinalists: [] as string[] };
  }
  const finalRound = Math.max(...result.rows.map((vote) => vote.round));
  const winner = result.rows[0].winner;
  const finalists = result.rows
    .filter((vote) => vote.round === finalRound)
    .flatMap((vote) => vote.pair.filter((name) => name !== winner));
  const semiFinalists = finalRound > 1
    ? result.rows
        .filter((vote) => vote.round === finalRound - 1)
        .flatMap((vote) => vote.pair.filter((name) => name !== vote.vote_winner))
    : [];
  return {
    winner: [winner],
    finalists: Array.from(new Set(finalists)),
    semiFinalists: Array.from(new Set(semiFinalists)),
  };
}

async function loadAuthorizedHistory(
  userId: number,
  tournamentId: string,
): Promise<Omit<TournamentHistory, 'commonNames'> | null> {
  const tournament = await pool.query<{
    id: string;
    participant_name: string | null;
    winner: string;
  }>(
    `SELECT t.id, COALESCE(u.name, u.email, 'Guest') AS participant_name, t.winner
     FROM tournaments t
     JOIN users u ON u.id = t.user_id
     WHERE t.id = $1 AND t.status = 'completed'
       AND (
         t.user_id = $2 OR
         EXISTS (
           SELECT 1 FROM tournament_invites i
           WHERE i.id = t.invite_id AND i.owner_user_id = $2
         ) OR
         EXISTS (
           SELECT 1 FROM tournament_invites i
           JOIN tournaments participant ON participant.invite_id = i.id
           WHERE i.source_tournament_id = t.id AND participant.user_id = $2
         )
       )
     LIMIT 1`,
    [tournamentId, userId],
  );
  const row = tournament.rows[0];
  if (!row) return null;
  const votes = await pool.query<{
    sequence: number;
    round: number;
    pair: string[];
    winner: string;
  }>(
    `SELECT sequence, round, pair, winner
     FROM tournament_votes
     WHERE tournament_id = $1
     ORDER BY sequence`,
    [tournamentId],
  );
  return {
    id: row.id,
    participantName: row.participant_name ?? 'Guest',
    winner: row.winner,
    votes: votes.rows,
    ranking: await getTournamentRanking(tournamentId),
  };
}

export async function getTournamentHistory(
  userId: number,
  tournamentId: string,
  againstTournamentId?: string,
): Promise<TournamentHistory | null> {
  const history = await loadAuthorizedHistory(userId, tournamentId);
  if (!history) return null;
  let commonNames: string[] = [];
  if (againstTournamentId) {
    const against = await loadAuthorizedHistory(userId, againstTournamentId);
    if (!against) return null;
    const related = await pool.query(
      `SELECT 1
       FROM tournament_invites i
       JOIN tournaments attempt ON attempt.invite_id = i.id
       WHERE (
         i.source_tournament_id = $1 AND attempt.id = $2 OR
         i.source_tournament_id = $2 AND attempt.id = $1
       )
       LIMIT 1`,
      [tournamentId, againstTournamentId],
    );
    if (related.rowCount !== 1) return null;
    const againstHigh = new Set([
      ...against.ranking.winner,
      ...against.ranking.finalists,
      ...against.ranking.semiFinalists,
    ]);
    commonNames = [
      ...history.ranking.winner,
      ...history.ranking.finalists,
      ...history.ranking.semiFinalists,
    ].filter((name) => againstHigh.has(name));
  }
  return { ...history, commonNames: Array.from(new Set(commonNames)) };
}
