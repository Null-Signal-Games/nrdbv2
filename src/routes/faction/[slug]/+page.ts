import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Card, Faction, SQLite } from '$lib/types';
import { normalize_sqlite } from '$lib/utils';

export const ssr = false;

export const load: PageLoad = async ({ data, params }) => {
	const identities: SQLite<Card, 'attributes'>[] =
		await sql`SELECT * FROM unified_cards WHERE faction_id = ${params.slug} AND (card_type_id IS NOT NULL AND LOWER(card_type_id) LIKE '%_identity')`;
	const faction: SQLite<Faction, 'attributes'>[] =
		await sql`SELECT * FROM factions WHERE id = ${params.slug} LIMIT 1`;
	const cards: SQLite<Card, 'attributes'>[] =
		await sql`SELECT * FROM unified_cards WHERE faction_id = ${params.slug} AND card_type_id NOT IN ('identity')`;

	if (!faction.length) {
		throw error(404, `Faction not found`);
	}

	return {
		identities: normalize_sqlite(identities) as SQLite<Card, 'attributes'>[],
		faction: normalize_sqlite(faction)[0] as SQLite<Faction, 'attributes'>,
		cards: normalize_sqlite(cards) as SQLite<Card, 'attributes'>[],
		...data
	};
};
