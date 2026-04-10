import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Card, Cycle } from '$lib/types';
import { normalize_sqlite } from '$lib/utils';

export const ssr = false;

export const load: PageLoad = async ({ data, params }) => {
	const cycle: Array<{ id: string } & Cycle['attributes']> =
		await sql`SELECT * FROM card_cycles WHERE id = ${params.slug}`;
	const cards: Array<{ id: string } & Card['attributes']> =
		await sql`SELECT * FROM unified_cards WHERE card_cycle_ids LIKE '%' || '"' || ${params.slug} || '"' || '%'`;

	if (!cycle.length) {
		throw error(404, `Cycle not found`);
	}

	return {
		cycle: normalize_sqlite(cycle)[0] as Cycle,
		cards: normalize_sqlite(cards) as Card[],
		...data
	};
};
