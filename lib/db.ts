import type { PoolClient } from 'pg';
import { pool } from '@/lib/postgres';
import {
  DEFAULT_DATASET_VERSION,
  getDefaultNames,
} from '@/lib/seed-data';
import type { Gender, Name } from '@/types';

export const MAX_NAME_LENGTH = 60;

export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function validateName(value: unknown): string | null {
  if (typeof value !== 'string') return 'Le prénom doit être du texte';
  const normalized = normalizeName(value);
  if (!normalized) return 'Le prénom est requis';
  if (normalized.length > MAX_NAME_LENGTH) {
    return `Le prénom ne peut pas dépasser ${MAX_NAME_LENGTH} caractères`;
  }
  return null;
}

async function ensureUserDataset(userId: number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [userId]);
    const dataset = await client.query<{ dataset_version: string }>(
      'SELECT dataset_version FROM user_datasets WHERE user_id = $1 FOR UPDATE',
      [userId],
    );

    if (dataset.rows[0]?.dataset_version !== DEFAULT_DATASET_VERSION) {
      await client.query('DELETE FROM user_names WHERE user_id = $1', [userId]);
      await insertDefaults(client, userId, 'boy');
      await insertDefaults(client, userId, 'girl');
      await client.query(
        `INSERT INTO user_datasets (user_id, dataset_version)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE
         SET dataset_version = EXCLUDED.dataset_version,
             initialized_at = NOW()`,
        [userId, DEFAULT_DATASET_VERSION],
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

async function insertDefaults(
  client: PoolClient,
  userId: number,
  gender: Gender,
) {
  const names = getDefaultNames(gender);
  await client.query(
    `INSERT INTO user_names (user_id, name, gender, source, source_rank)
     SELECT $1, source.name, $2, 'insee-2025', source.rank
     FROM UNNEST($3::text[]) WITH ORDINALITY AS source(name, rank)`,
    [userId, gender, names],
  );
}

export async function getNames(userId: number, gender: Gender): Promise<Name[]> {
  await ensureUserDataset(userId);
  const result = await pool.query<{
    id: string;
    name: string;
    gender: Gender;
    created_at: Date;
  }>(
    `SELECT id, name, gender, created_at
     FROM user_names
     WHERE user_id = $1 AND gender = $2
     ORDER BY source_rank NULLS LAST, name`,
    [userId, gender],
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    gender: row.gender,
    createdAt: row.created_at.toISOString(),
  }));
}

export async function addName(
  userId: number,
  name: string,
  gender: Gender,
): Promise<{ name: Name; created: boolean }> {
  await ensureUserDataset(userId);
  const normalizedName = normalizeName(name);
  const inserted = await pool.query<{
    id: string;
    name: string;
    gender: Gender;
    created_at: Date;
  }>(
    `INSERT INTO user_names (user_id, name, gender)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING
     RETURNING id, name, gender, created_at`,
    [userId, normalizedName, gender],
  );

  const row = inserted.rows[0] ?? (
    await pool.query<{
      id: string;
      name: string;
      gender: Gender;
      created_at: Date;
    }>(
      `SELECT id, name, gender, created_at
       FROM user_names
       WHERE user_id = $1 AND gender = $2 AND LOWER(name) = LOWER($3)
       LIMIT 1`,
      [userId, gender, normalizedName],
    )
  ).rows[0];

  return {
    created: inserted.rowCount === 1,
    name: {
      id: row.id,
      name: row.name,
      gender: row.gender,
      createdAt: row.created_at.toISOString(),
    },
  };
}

export async function deleteName(
  userId: number,
  id: string,
  gender: Gender,
): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM user_names WHERE id = $1 AND user_id = $2 AND gender = $3',
    [id, userId, gender],
  );
  return result.rowCount === 1;
}
