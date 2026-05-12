import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { FactionRow, UnifiedCardRow } from '$lib/types';
import { adaptCard, adaptFaction } from '$lib/adapter';

export const ssr = false;

export const load: PageLoad = async ({ data, params }) => {
	const identities: UnifiedCardRow[] =
		await sql`SELECT * FROM unified_cards WHERE faction_id = ${params.slug} AND (card_type_id IS NOT NULL AND LOWER(card_type_id) LIKE '%_identity')`;
	const faction: FactionRow[] =
		await sql`SELECT * FROM factions WHERE id = ${params.slug} LIMIT 1`;
	const cards: UnifiedCardRow[] =
		await sql`SELECT * FROM unified_cards WHERE faction_id = ${params.slug} AND card_type_id NOT IN ('identity')`;

	if (!faction.length) {
		throw error(404, `Faction not found`);
	}

	return {
		identities: identities.map(adaptCard),
		faction: adaptFaction(faction[0] as unknown as FactionRow),
		cards: cards.map(adaptCard),
		...data
	};
};
