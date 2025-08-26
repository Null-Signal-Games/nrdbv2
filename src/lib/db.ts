// https://dexie.org/docs/Tutorial/Svelte#using-typescript

import Dexie, { type EntityTable } from 'dexie';
import type { Card, Set } from './types';

const db = new Dexie('NRDB') as Dexie & {
	cards: EntityTable<Card, 'id'>;
	sets: EntityTable<Set, 'id'>;
};

db.version(1).stores({
	cards: 'id',
	sets: 'id'
});

export { db };
