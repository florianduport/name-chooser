import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to run migrations');
}

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5_000,
  ssl: process.env.DATABASE_SSL === 'true'
    ? { rejectUnauthorized: false }
    : undefined,
});

const migration = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  "emailVerified" TIMESTAMPTZ,
  image TEXT
);

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,
  oauth_token_secret TEXT,
  oauth_token TEXT,
  UNIQUE (provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS verification_token (
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);

CREATE TABLE IF NOT EXISTS user_datasets (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  dataset_version TEXT NOT NULL,
  initialized_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(60) NOT NULL,
  gender VARCHAR(4) NOT NULL CHECK (gender IN ('boy', 'girl')),
  source VARCHAR(32) NOT NULL DEFAULT 'custom',
  source_rank INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_names_unique_name
  ON user_names (user_id, gender, LOWER(name));
CREATE INDEX IF NOT EXISTS user_names_user_gender
  ON user_names (user_id, gender);

CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gender VARCHAR(4) NOT NULL CHECK (gender IN ('boy', 'girl')),
  mode VARCHAR(16) NOT NULL CHECK (mode IN ('database', 'custom')),
  initial_names JSONB NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed')),
  winner VARCHAR(60),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS tournaments_user_created
  ON tournaments (user_id, created_at DESC);

ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS share_token UUID;
CREATE UNIQUE INDEX IF NOT EXISTS tournaments_share_token
  ON tournaments (share_token)
  WHERE share_token IS NOT NULL;

CREATE TABLE IF NOT EXISTS tournament_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  owner_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  gender VARCHAR(4) NOT NULL CHECK (gender IN ('boy', 'girl')),
  mode VARCHAR(16) NOT NULL CHECK (mode IN ('database', 'custom')),
  names JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);
CREATE UNIQUE INDEX IF NOT EXISTS tournament_invites_source_owner
  ON tournament_invites (owner_user_id, source_tournament_id);

ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS invite_id UUID REFERENCES tournament_invites(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS tournaments_invite
  ON tournaments (invite_id, completed_at DESC)
  WHERE invite_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS tournament_votes (
  id BIGSERIAL PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  round INTEGER NOT NULL,
  pair JSONB NOT NULL,
  winner VARCHAR(60) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tournament_id, sequence)
);
`;

try {
  let lastError;
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      await pool.query(migration);
      console.log('Database migrations complete');
      lastError = undefined;
      break;
    } catch (error) {
      lastError = error;
      console.error(`Migration attempt ${attempt}/10 failed`);
      if (attempt < 10) {
        await new Promise((resolve) => setTimeout(resolve, 3_000));
      }
    }
  }
  if (lastError) throw lastError;
} finally {
  await pool.end();
}
