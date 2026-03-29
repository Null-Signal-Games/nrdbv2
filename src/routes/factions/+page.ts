// Alternative implimentation of sql querying, but blocks navigation vs doing this client side,
// though the load time difference is negligible OPFS is fast. However, client side allows for
// better progressive loading states and doesn't block navigation (while waiting for db)

/*
import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ params }) => {
    const results = await sql`SELECT * FROM factions`;

    if (!results.length) {
        error(404, `Factions not found`);
    }

    return {
        factions: results as Record<string, unknown>[],
    };
};
*/
