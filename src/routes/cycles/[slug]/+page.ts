import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { UnifiedCardRow, CardCycleRow } from '$lib/types';
import { adaptCard, adaptCardCycle } from '$lib/adapter';

export const ssr = false;

export const load: PageLoad = async ({ data, params }) => {
	const cycle: CardCycleRow[] = await sql`
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
		WHERE cc.id = ${params.slug}
	`;
	const cards: UnifiedCardRow[] =
		await sql`SELECT * FROM unified_cards WHERE card_cycle_ids LIKE '%' || '"' || ${params.slug} || '"' || '%'`;

	if (!cycle.length) {
		throw error(404, `Cycle not found`);
	}

	return {
		cycle: adaptCardCycle(cycle[0]),
		cards: cards.map(adaptCard),
		...data
	};
};
