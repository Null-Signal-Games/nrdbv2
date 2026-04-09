import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Card, Faction } from '$lib/types';
import { normalize_sqlite } from '$lib/utils';

export const ssr = false;

export const load: PageLoad = async ({ data, params }) => {
	const identities: Array<{ id: string } & Card['attributes']> =
		await sql`SELECT * FROM unified_cards WHERE faction_id = ${params.slug} AND (card_type_id IS NOT NULL AND LOWER(card_type_id) LIKE '%_identity')`;
	const faction: Array<{ id: string } & Faction['attributes']> =
		await sql`SELECT * FROM factions WHERE id = ${params.slug} LIMIT 1`;
	const cards: Array<{ id: string } & Card['attributes']> =
		await sql`SELECT * FROM unified_cards WHERE faction_id = ${params.slug} AND card_type_id NOT IN ('identity')`;

	if (!faction.length) {
		throw error(404, `Faction not found`);
	}

	return {
		identities: normalize_sqlite(identities) as Card[],
		faction: normalize_sqlite(faction)[0] as Faction,
		cards: normalize_sqlite(cards) as Card[],
		...data
	};
};
