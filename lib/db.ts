import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { NamesDatabase, Name, Gender } from '@/types';

const file = join(process.cwd(), 'data', 'names.json');

const adapter = new JSONFile<NamesDatabase>(file);
const db = new Low(adapter, { boys: [], girls: [] });

// Initialiser la base de données si elle est vide
export async function initDb() {
    await db.read();
    if (db.data.boys.length === 0 && db.data.girls.length === 0) {
        db.data = { boys: [], girls: [] };
        await db.write();
    }
}

// Obtenir tous les noms pour un genre
export async function getNames(gender: Gender): Promise<Name[]> {
    await db.read();
    return db.data[gender === 'boy' ? 'boys' : 'girls'];
}

// Ajouter un nom à la base de données
export async function addName(name: string, gender: Gender): Promise<Name> {
    await db.read();

    const namesArray = gender === 'boy' ? db.data.boys : db.data.girls;

    // Vérifier si le nom existe déjà
    const existingName = namesArray.find(
        (n) => n.name.toLowerCase() === name.toLowerCase()
    );

    if (existingName) {
        return existingName;
    }

    const newName: Name = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        gender,
        createdAt: new Date().toISOString(),
    };

    namesArray.push(newName);
    await db.write();

    return newName;
}

// Vérifier si un nom existe dans la base de données
export async function nameExists(name: string, gender: Gender): Promise<boolean> {
    await db.read();
    const namesArray = gender === 'boy' ? db.data.boys : db.data.girls;
    return namesArray.some(
        (n) => n.name.toLowerCase() === name.toLowerCase()
    );
}

// Ajouter plusieurs noms à la base de données
export async function addNames(names: string[], gender: Gender): Promise<Name[]> {
    const addedNames: Name[] = [];
    for (const name of names) {
        const trimmedName = name.trim();
        if (trimmedName) {
            const nameObj = await addName(trimmedName, gender);
            addedNames.push(nameObj);
        }
    }
    return addedNames;
}

// Obtenir la base de données complète (pour l'initialisation)
export async function getDb(): Promise<NamesDatabase> {
    await db.read();
    return db.data || { boys: [], girls: [] };
}

// Écrire dans la base de données (pour le seed)
export async function writeDb(data: NamesDatabase): Promise<void> {
    db.data = data;
    await db.write();
}

// Supprimer un nom de la base de données par ID
export async function deleteName(id: string, gender: Gender): Promise<boolean> {
    await db.read();
    const namesArray = gender === 'boy' ? db.data.boys : db.data.girls;
    const initialLength = namesArray.length;
    const filteredArray = namesArray.filter(n => n.id !== id);
    db.data[gender === 'boy' ? 'boys' : 'girls'] = filteredArray;
    await db.write();
    return filteredArray.length < initialLength;
}
