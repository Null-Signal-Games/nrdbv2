import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Card, Faction } from "$lib/types";

export const ssr = false;

export const load: PageLoad = async ({ data, params }) => {
    // All below can later be reduced in SELECT scope to only fetch required data for presentation
    const identities: Card[] = await sql`SELECT * FROM unified_cards WHERE faction_id = ${params.slug} AND (card_type_id IS NOT NULL AND LOWER(card_type_id) LIKE '%_identity')`;
    const faction: Faction[] = await sql`SELECT * FROM factions WHERE id = ${params.slug}`;
    const cards: Card[] = await sql`SELECT * FROM unified_cards WHERE faction_id = ${params.slug} AND card_type_id NOT IN ('identity')`;

    if (!faction.length) {
        throw error(404, `Faction not found`);
    }

    return {
        identities,
        faction: faction[0],
        cards: cards,
        // `...data` inherits data from +page.server.ts. Namely decklists (streamed via promise), also returned last as to 
        // overwrite above faction and cards data if +page.server.ts returns them (i.e. cold load w/o sqlite, 
        // and no `nrdb_cache` cookie found/set)
        ...data,
    };
};