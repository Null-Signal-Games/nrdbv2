import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { FactionRow } from '$lib/types';
import { adaptFaction } from '$lib/adapter';

export const ssr = false;

export const load: PageLoad = async ({ data }) => {
	const factions: FactionRow[] = await sql`SELECT * FROM factions`;

	if (!factions.length) {
		throw error(404, `Factions not found`);
	}

	return {
		factions: factions.map(adaptFaction),
		...data
	};
};
