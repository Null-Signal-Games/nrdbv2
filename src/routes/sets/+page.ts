import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Set, Cycle } from '$lib/types';
import { normalize_sqlite } from '$lib/utils';

export const ssr = false;

export const load: PageLoad = async ({ data }) => {
    const sets: Array<{ id: string } & Set['attributes']> = await sql`SELECT * FROM card_sets`;
    const cycles: Array<{ id: string } & Cycle['attributes']> =
        await sql`SELECT * FROM card_cycles`;

    if (!sets.length) {
        throw error(404, `Sets not found`);
    }

    return {
        sets: normalize_sqlite(sets) as Set[],
        cycles: normalize_sqlite(cycles) as Cycle[],
        ...data
    };
};
