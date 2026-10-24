import { Pool } from 'pg';

declare global {
  var nameChooserPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: process.env.DATABASE_SSL === 'true'
      ? { rejectUnauthorized: false }
      : undefined,
  });
}

export const pool = global.nameChooserPool ?? createPool();

if (process.env.NODE_ENV !== 'production') {
  global.nameChooserPool = pool;
}
