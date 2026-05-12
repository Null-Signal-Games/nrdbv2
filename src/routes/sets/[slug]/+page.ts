import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Set, UnifiedCardRow } from '$lib/types';
import { normalize_sqlite } from '$lib/utils';
import { adaptCard } from '$lib/adapter';

export const ssr = false;

export const load: PageLoad = async ({ params, data }) => {
	const set: Array<{ id: string } & Set['attributes']> =
		await sql`SELECT * FROM card_sets WHERE id = ${params.slug} LIMIT 1`;
	const cards: UnifiedCardRow[] =
		await sql`SELECT * FROM unified_cards WHERE card_set_ids LIKE '%' || '"' || ${params.slug} || '"' || '%'`;

	if (!set.length) {
		throw error(404, `Set not found`);
	}

	return {
		set: normalize_sqlite(set)[0],
		cards: cards.map(adaptCard),
		...data
	};
};
