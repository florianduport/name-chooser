import { writeDb } from '@/lib/db';
import { NamesDatabase, Name } from '@/types';

const boysNames = [
  'Gabriel', 'Raphaël', 'Louis', 'Léo', 'Noah', 'Arthur', 'Adam', 'Jules', 'Maël', 'Léon',
  'Lucas', 'Paul', 'Hugo', 'Ethan', 'Nathan', 'Gabin', 'Timéo', 'Aaron', 'Marius', 'Eden',
  'Naël', 'Mohamed', 'Nino', 'Gaspard', 'Sacha', 'Ismaël', 'Noé', 'Ilyes', 'Liam', 'Enzo',
  'Malo', 'Antoine', 'Théo', 'Tom', 'Yanis', 'Maxime', 'Axel', 'Elias', 'Valentin', 'Marcel',
  'Matteo', 'Amir', 'Ibrahim', 'Alexandre', 'Alexis', 'Oscar', 'Evan', 'Antonin', 'Baptiste', 'Mathis'
];

const girlsNames = [
  'Louise', 'Jade', 'Ambre', 'Alba', 'Emma', 'Alma', 'Romy', 'Rose', 'Alice', 'Anna',
  'Lina', 'Chloé', 'Léa', 'Julia', 'Mila', 'Inès', 'Agathe', 'Jeanne', 'Léna', 'Iris',
  'Lucie', 'Mia', 'Zoé', 'Luna', 'Elsa', 'Sara', 'Olivia', 'Manon', 'Éléna', 'Ava',
  'Charlotte', 'Victoria', 'Camille', 'Éléna', 'Juliette', 'Anaïs', 'Sophia', 'Lilou', 'Amélie', 'Lola',
  'Éva', 'Ella', 'Nina', 'Maya', 'Lou', 'Margot', 'Élise', 'Adèle', 'Romane', 'Louna'
];

async function seed() {
  const now = new Date().toISOString();
  
  const boys: Name[] = boysNames.map((name, index) => ({
    id: `boy-${Date.now()}-${index}`,
    name,
    gender: 'boy' as const,
    createdAt: now,
  }));
  
  const girls: Name[] = girlsNames.map((name, index) => ({
    id: `girl-${Date.now()}-${index}`,
    name,
    gender: 'girl' as const,
    createdAt: now,
  }));
  
  const data: NamesDatabase = {
    boys,
    girls,
  };
  
  await writeDb(data);
  console.log(`✅ Base de données initialisée avec ${boys.length} prénoms de garçons et ${girls.length} prénoms de filles`);
}

seed().catch(console.error);
