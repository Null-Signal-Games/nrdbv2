import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { CardSetRow, CardCycleRow } from '$lib/types';
import { adaptCardCycle, adaptCardSet } from '$lib/adapter';

export const ssr = false;

export const load: PageLoad = async ({ data }) => {
	const sets: CardSetRow[] = await sql`
		SELECT
			cs.*,
			(
				SELECT id
				FROM unified_printings
				WHERE card_set_id = cs.id
				ORDER BY id ASC
				LIMIT 1
			) as first_printing_id
		FROM card_sets cs
	`;
	const cycles: CardCycleRow[] = await sql`
		SELECT
			cc.*,
			(
				SELECT json_group_array(id)
				FROM card_sets
				WHERE card_cycle_id = cc.id
			) as card_set_ids,
			(
				SELECT id
				FROM unified_printings
				WHERE card_cycle_id = cc.id
				ORDER BY id ASC
				LIMIT 1
			) as first_printing_id
		FROM card_cycles cc
	`;

	if (!sets.length) {
		throw error(404, `Sets not found`);
	}

	return {
		sets: sets.map(adaptCardSet),
		cycles: cycles.map(adaptCardCycle),
		...data
	};
};
