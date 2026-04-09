import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Set, Card } from '$lib/types';
import { normalize_sqlite } from '$lib/utils';

export const ssr = false;

export const load: PageLoad = async ({ params, data }) => {
    const set: Array<{ id: string } & Set['attributes']> = await sql`SELECT * FROM card_set WHERE slug = ${params.slug} LIMIT 1`;
    const cards: Array<{ id: string } & Card['attributes']> = await sql`SELECT * FROM unified_cards WHERE card_set_ids LIKE '%' || '"' || ${params.slug} || '"' || '%'`;

    if (!set.length) {
        throw error(404, `Set not found`);
    }

    return {
        set: normalize_sqlite(set)[0] as Set,
        cards: normalize_sqlite(cards) as Card[],
        ...data
    };
};
