import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { UnifiedCardRow, CardSetRow } from '$lib/types';
import { adaptCard, adaptCardSet } from '$lib/adapter';

export const ssr = false;

export const load: PageLoad = async ({ params, data }) => {
	const set: CardSetRow[] = await sql`
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
		WHERE cs.id = ${params.slug}
		LIMIT 1
	`;
	const cards: UnifiedCardRow[] =
		await sql`SELECT * FROM unified_cards WHERE card_set_ids LIKE '%' || '"' || ${params.slug} || '"' || '%'`;

	if (!set.length) {
		throw error(404, `Set not found`);
	}

	return {
		set: adaptCardSet(set[0]),
		cards: cards.map(adaptCard),
		...data
	};
};
