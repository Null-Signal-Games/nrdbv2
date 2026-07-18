import { adaptCard } from '$lib/adapter';
import { sql } from '$lib/sqlite';
import type { UnifiedCardRow } from '$lib/types';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ data, params }) => {
	const cards: UnifiedCardRow[] =
		await sql`SELECT * FROM unified_cards WHERE id = ${params.slug} LIMIT 1`;
	const card = data.card ?? (cards[0] ? adaptCard(cards[0]) : undefined);

	if (!card) {
		throw error(404, 'Card not found');
	}

	return {
		...data,
		card
	};
};
