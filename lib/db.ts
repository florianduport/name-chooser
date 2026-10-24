import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { NamesDatabase, Name, Gender } from '@/types';

export const MAX_NAME_LENGTH = 60;

const file = process.env.DATA_FILE_PATH || join(process.cwd(), 'data', 'names.json');
const adapter = new JSONFile<NamesDatabase>(file);
const database = new Low(adapter, { boys: [], girls: [] });
let initialized = false;
let mutationQueue = Promise.resolve();

async function ensureDatabase() {
  if (!initialized) {
    await mkdir(dirname(file), { recursive: true });
    await database.read();
    if (!database.data) {
      database.data = { boys: [], girls: [] };
      await database.write();
    }
    initialized = true;
  }
}

function withMutation<T>(operation: () => Promise<T>): Promise<T> {
  const result = mutationQueue.then(operation, operation);
  mutationQueue = result.then(() => undefined, () => undefined);
  return result;
}

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

export async function getNames(gender: Gender): Promise<Name[]> {
  await mutationQueue;
  await ensureDatabase();
  await database.read();
  return [...database.data[gender === 'boy' ? 'boys' : 'girls']];
}

export async function addName(
  name: string,
  gender: Gender,
): Promise<{ name: Name; created: boolean }> {
  return withMutation(async () => {
    await ensureDatabase();
    await database.read();
    const normalizedName = normalizeName(name);
    const namesArray = gender === 'boy' ? database.data.boys : database.data.girls;
    const existingName = namesArray.find(
      (item) => item.name.localeCompare(normalizedName, 'fr', { sensitivity: 'base' }) === 0,
    );

    if (existingName) return { name: existingName, created: false };

    const newName: Name = {
      id: randomUUID(),
      name: normalizedName,
      gender,
      createdAt: new Date().toISOString(),
    };

    namesArray.push(newName);
    await database.write();
    return { name: newName, created: true };
  });
}

export async function nameExists(name: string, gender: Gender): Promise<boolean> {
  const normalizedName = normalizeName(name);
  const names = await getNames(gender);
  return names.some(
    (item) => item.name.localeCompare(normalizedName, 'fr', { sensitivity: 'base' }) === 0,
  );
}

export async function addNames(names: string[], gender: Gender): Promise<Name[]> {
  const results: Name[] = [];
  for (const name of names) {
    if (normalizeName(name)) {
      results.push((await addName(name, gender)).name);
    }
  }
  return results;
}

export async function getDb(): Promise<NamesDatabase> {
  await mutationQueue;
  await ensureDatabase();
  await database.read();
  return structuredClone(database.data);
}

export async function writeDb(data: NamesDatabase): Promise<void> {
  await withMutation(async () => {
    await ensureDatabase();
    database.data = structuredClone(data);
    await database.write();
  });
}

export async function deleteName(id: string, gender: Gender): Promise<boolean> {
  return withMutation(async () => {
    await ensureDatabase();
    await database.read();
    const key = gender === 'boy' ? 'boys' : 'girls';
    const namesArray = database.data[key];
    const initialLength = namesArray.length;
    const filteredArray = namesArray.filter((name) => name.id !== id);
    if (filteredArray.length === initialLength) return false;
    database.data[key] = filteredArray;
    await database.write();
    return filteredArray.length < initialLength;
  });
}
