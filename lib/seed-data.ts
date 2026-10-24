import type { Gender } from '@/types';

export const DEFAULT_DATASET_VERSION = 'insee-france-2025-top-50-by-sex';
export const DEFAULT_DATASET_SOURCE =
  'https://www.insee.fr/fr/statistiques/8595130';

// Official national ranks 1–50 by sex for births registered in France in 2025.
// Source: INSEE, Fichier des prénoms, released 2026-07-16.
const DEFAULT_NAMES: Record<Gender, string[]> = {
  boy: [
    'Gabriel', 'Noah', 'Léo', 'Raphaël', 'Louis', 'Jules', 'Arthur', 'Léon', 'Adam', 'Maël',
    'Isaac', 'Sacha', 'Marceau', 'Liam', 'Eden', 'Noé', 'Elio', 'Gabin', 'Lucas', 'Aaron',
    'Mohamed', 'Malo', 'Paul', 'Ayden', 'Hugo', 'Ibrahim', 'Marius', 'Victor', 'Eliott', 'Ethan',
    'Imran', 'Aylan', 'Naël', 'Martin', 'Ezio', 'Côme', 'Gaspard', 'Zayn', 'Nathan', 'Léandre',
    'Basile', 'Théo', 'Augustin', 'Nino', 'Milo', 'Mathis', 'Lyam', 'Oscar', 'Ismaël', 'Simon',
  ],
  girl: [
    'Louise', 'Jade', 'Ambre', 'Alma', 'Alba', 'Rose', 'Emma', 'Romy', 'Adèle', 'Alice',
    'Iris', 'Lou', 'Agathe', 'Inaya', 'Anna', 'Nour', 'Lina', 'Charlie', 'Olivia', 'Julia',
    'Mia', 'Victoire', 'Jeanne', 'Giulia', 'Léonie', 'Eva', 'Esmée', 'Juliette', 'Sofia', 'Zoé',
    'Léna', 'Alya', 'Luna', 'Chloé', 'Nina', 'Victoria', 'Alix', 'Léa', 'Romane', 'Ava',
    'Charlotte', 'Elena', 'Lucie', 'Albane', 'Lyana', 'Margot', 'Gabrielle', 'Emy', 'Aya', 'Livia',
  ],
};

export function getDefaultNames(gender: Gender): readonly string[] {
  return DEFAULT_NAMES[gender];
}
