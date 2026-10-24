import { Gender, Name, NamesDatabase } from '@/types';

const DEFAULT_NAMES: Record<Gender, string[]> = {
  boy: [
    'Gabriel', 'Raphaël', 'Louis', 'Léo', 'Noah', 'Arthur', 'Adam', 'Jules', 'Maël', 'Léon',
    'Lucas', 'Paul', 'Hugo', 'Ethan', 'Nathan', 'Gabin', 'Timéo', 'Aaron', 'Marius', 'Eden',
    'Naël', 'Mohamed', 'Nino', 'Gaspard', 'Sacha', 'Ismaël', 'Noé', 'Ilyes', 'Liam', 'Enzo',
    'Malo', 'Antoine', 'Théo', 'Tom', 'Yanis', 'Maxime', 'Axel', 'Elias', 'Valentin', 'Marcel',
    'Matteo', 'Amir', 'Ibrahim', 'Alexandre', 'Alexis', 'Oscar', 'Evan', 'Antonin', 'Baptiste', 'Mathis',
  ],
  girl: [
    'Louise', 'Jade', 'Ambre', 'Alba', 'Emma', 'Alma', 'Romy', 'Rose', 'Alice', 'Anna',
    'Lina', 'Chloé', 'Léa', 'Julia', 'Mila', 'Inès', 'Agathe', 'Jeanne', 'Léna', 'Iris',
    'Lucie', 'Mia', 'Zoé', 'Luna', 'Elsa', 'Sara', 'Olivia', 'Manon', 'Éléna', 'Ava',
    'Charlotte', 'Victoria', 'Camille', 'Juliette', 'Anaïs', 'Sophia', 'Lilou', 'Amélie', 'Lola',
    'Éva', 'Ella', 'Nina', 'Maya', 'Lou', 'Margot', 'Élise', 'Adèle', 'Romane', 'Louna',
  ],
};

function createNames(gender: Gender, timestamp: string): Name[] {
  return DEFAULT_NAMES[gender].map((name, index) => ({
    id: `${gender}-${Date.now()}-${index}`,
    name,
    gender,
    createdAt: timestamp,
  }));
}

export function mergeDefaultNames(database: NamesDatabase): NamesDatabase {
  const timestamp = new Date().toISOString();

  return {
    boys: database.boys.length > 0 ? database.boys : createNames('boy', timestamp),
    girls: database.girls.length > 0 ? database.girls : createNames('girl', timestamp),
  };
}
