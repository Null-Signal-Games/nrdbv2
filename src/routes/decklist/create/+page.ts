import { sql } from '$lib/sqlite';
import type { PageLoad } from './$types';
import type { FactionRow, UnifiedCardRow } from '$lib/types';
import { adaptCard, adaptFaction } from '$lib/adapter';

export const ssr = false;

export const load: PageLoad = async ({ data }) => {
	const factions: FactionRow[] = await sql`SELECT * FROM factions`;
	const cards: UnifiedCardRow[] = await sql`SELECT * FROM unified_cards`;

	return {
		factions: factions.map(adaptFaction),
		cards: cards.map(adaptCard),
		...data
	};
};
