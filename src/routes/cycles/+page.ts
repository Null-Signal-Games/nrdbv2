import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Cycle } from '$lib/types';
import { normalize_sqlite } from '$lib/utils';

export const ssr = false;

export const load: PageLoad = async ({ data }) => {
	const cycles: Array<{ id: string } & Cycle['attributes']> =
		await sql`SELECT * FROM card_cycles`;

	if (!cycles.length) {
		throw error(404, `Cycles not found`);
	}

	return {
		cycles: normalize_sqlite(cycles) as unknown as Cycle[],
		...data
	};
};
