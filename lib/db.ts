import { pool } from '@/lib/postgres';
import type { CountryCode, Locale } from '@/lib/i18n';
import type { Gender, Name } from '@/types';

export const MAX_NAME_LENGTH = 60;

export type DatasetInfo = {
  countryCode: CountryCode;
  countryName: string;
  sourceName: string;
  sourceUrl: string;
  coverageYear: number;
  version: string;
};

export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function validateName(value: unknown): string | null {
  if (typeof value !== 'string') return 'Name must be text';
  const normalized = normalizeName(value);
  if (!normalized) return 'Name is required';
  if (normalized.length > MAX_NAME_LENGTH) {
    return `Name cannot exceed ${MAX_NAME_LENGTH} characters`;
  }
  return null;
}

async function ensureUserDataset(
  userId: number,
  preferredCountry: CountryCode,
  locale: Locale,
): Promise<DatasetInfo> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [userId]);
    await client.query(
      `INSERT INTO user_profiles (user_id, selected_country, locale)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId, preferredCountry, locale],
    );
    const profile = await client.query<{ selected_country: CountryCode }>(
      'SELECT selected_country FROM user_profiles WHERE user_id = $1 FOR UPDATE',
      [userId],
    );
    const country = profile.rows[0].selected_country;
    const dataset = await client.query<{
      country_code: CountryCode;
      country_name: string;
      source_name: string;
      source_url: string;
      coverage_year: number;
      version: string;
    }>(
      `SELECT country_code, country_name, source_name, source_url,
              coverage_year, version
       FROM name_datasets WHERE country_code = $1`,
      [country],
    );
    const info = dataset.rows[0];
    if (!info) throw new Error(`Missing official dataset for ${country}`);

    const current = await client.query<{
      dataset_version: string;
      country_code: CountryCode;
    }>(
      'SELECT dataset_version, country_code FROM user_datasets WHERE user_id = $1 FOR UPDATE',
      [userId],
    );

    if (
      current.rows[0]?.dataset_version !== info.version ||
      current.rows[0]?.country_code !== country
    ) {
      await client.query(
        `DELETE FROM user_names
         WHERE user_id = $1 AND source <> 'custom'`,
        [userId],
      );
      await client.query(
        `INSERT INTO user_names
         (user_id, name, gender, source, source_rank)
         SELECT $1, name, gender, $2, rank
         FROM official_names
         WHERE country_code = $3`,
        [userId, `official-${country.toLowerCase()}`, country],
      );
      await client.query(
        `INSERT INTO user_datasets (user_id, dataset_version, country_code)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO UPDATE SET
           dataset_version = EXCLUDED.dataset_version,
           country_code = EXCLUDED.country_code,
           initialized_at = NOW()`,
        [userId, info.version, country],
      );
    }
    await client.query(
      'UPDATE user_profiles SET locale = $2, updated_at = NOW() WHERE user_id = $1',
      [userId, locale],
    );
    await client.query('COMMIT');
    return {
      countryCode: info.country_code,
      countryName: info.country_name,
      sourceName: info.source_name,
      sourceUrl: info.source_url,
      coverageYear: info.coverage_year,
      version: info.version,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getNames(
  userId: number,
  gender: Gender,
  preferredCountry: CountryCode,
  locale: Locale,
): Promise<{ names: Name[]; dataset: DatasetInfo }> {
  const dataset = await ensureUserDataset(userId, preferredCountry, locale);
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

  return {
    dataset,
    names: result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      gender: row.gender,
      createdAt: row.created_at.toISOString(),
    })),
  };
}

export async function addName(
  userId: number,
  name: string,
  gender: Gender,
): Promise<{ name: Name; created: boolean }> {
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

export async function listCountries() {
  const result = await pool.query<{
    country_code: CountryCode;
    country_name: string;
    source_name: string;
    source_url: string;
    coverage_year: number;
  }>(
    `SELECT country_code, country_name, source_name, source_url, coverage_year
     FROM name_datasets
     ORDER BY country_code`,
  );
  return result.rows.map((row) => ({
    countryCode: row.country_code,
    countryName: row.country_name,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    coverageYear: row.coverage_year,
  }));
}

export async function getSelectedCountry(
  userId: number,
  preferredCountry: CountryCode,
  locale: Locale,
) {
  return ensureUserDataset(userId, preferredCountry, locale);
}

export async function setSelectedCountry(
  userId: number,
  country: CountryCode,
  locale: Locale,
) {
  await pool.query(
    `INSERT INTO user_profiles (user_id, selected_country, locale)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE SET
       selected_country = EXCLUDED.selected_country,
       locale = EXCLUDED.locale,
       updated_at = NOW()`,
    [userId, country, locale],
  );
  return ensureUserDataset(userId, country, locale);
}
