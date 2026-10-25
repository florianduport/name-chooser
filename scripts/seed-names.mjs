import { readFile } from 'node:fs/promises';
import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required to seed names');

const datasets = JSON.parse(
  await readFile(new URL('../data/name-datasets.json', import.meta.url), 'utf8'),
);
const nameMeanings = JSON.parse(
  await readFile(new URL('../data/name-meanings.json', import.meta.url), 'utf8'),
);
const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5_000,
  ssl: process.env.DATABASE_SSL === 'true'
    ? { rejectUnauthorized: false }
    : undefined,
});

const client = await pool.connect();
const dedupeKey = (name) => name
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .toLocaleLowerCase('pt-PT');

try {
  await client.query('BEGIN');
  for (const dataset of datasets) {
    if (
      dataset.boys.length < 1 ||
      dataset.girls.length < 1 ||
      dataset.boys.length > 100 ||
      dataset.girls.length > 100
    ) {
      throw new Error(`${dataset.countryCode} must contain 1–100 names per gender`);
    }
    for (const names of [dataset.boys, dataset.girls]) {
      if (new Set(names.map(dedupeKey)).size !== names.length) {
        throw new Error(`${dataset.countryCode} contains a case/accent-insensitive duplicate`);
      }
    }
    await client.query(
      `INSERT INTO name_datasets
       (country_code, country_name, source_name, source_url, coverage_year,
        publication_date, version, notes, sources, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, NOW())
       ON CONFLICT (country_code) DO UPDATE SET
         country_name = EXCLUDED.country_name,
         source_name = EXCLUDED.source_name,
         source_url = EXCLUDED.source_url,
         coverage_year = EXCLUDED.coverage_year,
         publication_date = EXCLUDED.publication_date,
         version = EXCLUDED.version,
         notes = EXCLUDED.notes,
         sources = EXCLUDED.sources,
         updated_at = NOW()`,
      [
        dataset.countryCode,
        dataset.countryName,
        dataset.sourceName,
        dataset.sourceUrl,
        dataset.coverageYear,
        dataset.publicationDate,
        dataset.version,
        dataset.notes ?? null,
        JSON.stringify(dataset.sources ?? [{
          sourceName: dataset.sourceName,
          sourceUrl: dataset.sourceUrl,
          coverageYear: dataset.coverageYear,
          publicationDate: dataset.publicationDate,
        }]),
      ],
    );
    await client.query('DELETE FROM official_names WHERE country_code = $1', [dataset.countryCode]);
    for (const [gender, names] of [['boy', dataset.boys], ['girl', dataset.girls]]) {
      await client.query(
        `INSERT INTO official_names (country_code, gender, rank, name)
         SELECT $1, $2, source.rank, source.name
         FROM UNNEST($3::text[]) WITH ORDINALITY AS source(name, rank)`,
        [dataset.countryCode, gender, names],
      );
    }
  }
  for (const entry of nameMeanings) {
    await client.query(
      `UPDATE official_names
       SET origin = $1, meanings = $2::jsonb, meaning_source_url = $3
       WHERE LOWER(UNACCENT(name)) = ANY($4::text[])`,
      [
        entry.origin,
        JSON.stringify(entry.meanings),
        entry.sourceUrl,
        entry.names.map((name) => dedupeKey(name)),
      ],
    );
  }
  await client.query('COMMIT');
  console.log(`Seeded ${datasets.length} official country datasets`);
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
