// https://dexie.org/docs/Tutorial/Svelte#using-typescript

import Dexie, { type EntityTable } from 'dexie';
import type { Card, Cycle, Set, Faction, Format, Printing } from './types';

export interface CacheMeta {
    key: string;
    value: string;
}

const db = new Dexie('NRDB') as Dexie & {
    cards: EntityTable<Card, 'id'>;
    cycles: EntityTable<Cycle, 'id'>;
    sets: EntityTable<Set, 'id'>;
    factions: EntityTable<Faction, 'id'>;
    formats: EntityTable<Format, 'id'>;
    printings: EntityTable<Printing, 'id'>;
    meta: EntityTable<CacheMeta, 'key'>;
};

db.version(1).stores({
    cards: 'id',
    cycles: 'id',
    sets: 'id',
    factions: 'id',
    formats: 'id',
    printings: 'id'
});

db.version(2).stores({
    meta: 'key'
});

export { db };
