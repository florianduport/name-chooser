import { getDb, writeDb } from '@/lib/db';
import { mergeDefaultNames } from '@/lib/seed-data';

async function seed() {
  const data = mergeDefaultNames(await getDb());
  await writeDb(data);
  console.log(`Base initialisée avec ${data.boys.length} prénoms de garçons et ${data.girls.length} prénoms de filles`);
}

seed().catch(console.error);
