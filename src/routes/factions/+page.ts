import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Faction } from '$lib/types';
import { normalize_sqlite } from '$lib/utils';

export const ssr = false;

export const load: PageLoad = async ({ data }) => {
	const factions: Array<{ id: string } & Faction['attributes']> =
		await sql`SELECT * FROM factions`;

	if (!factions.length) {
		throw error(404, `Factions not found`);
	}

	return {
		factions: normalize_sqlite(factions),
		...data
	};
};
