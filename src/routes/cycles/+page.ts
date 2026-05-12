import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { CardCycleRow } from '$lib/types';
import { adaptCardCycle } from '$lib/adapter';

export const ssr = false;

export const load: PageLoad = async ({ data }) => {
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

	if (!cycles.length) {
		throw error(404, `Cycles not found`);
	}

	return {
		cycles: cycles.map(adaptCardCycle),
		...data
	};
};
