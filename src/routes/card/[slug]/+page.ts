import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { UnifiedCardRow, UnifiedPrintingRow } from '$lib/types';
import { adaptCard, adaptPrinting } from '$lib/adapter';

export const ssr = false;

export const load: PageLoad = async ({ data, params }) => {
	const slug: string = params.slug.toLowerCase();

	const id_regex = /^\d+$/;
	let printing_id: string | null = null;

	// If the slug is a printing ID, we need to find the corresponding card ID (string, i.e. `nightmare_archive`)
	if (id_regex.test(slug)) {
		const printing: UnifiedPrintingRow[] =
			await sql`SELECT * FROM unified_printings WHERE id = ${slug} LIMIT 1`;
		printing_id = printing.length ? printing[0].card_id : null;
	}

	const card: UnifiedCardRow[] =
		await sql`SELECT * FROM unified_cards WHERE id = ${printing_id ?? slug} LIMIT 1`;
	const card_next: UnifiedCardRow[] =
		await sql`SELECT * FROM unified_cards WHERE id > ${slug} ORDER BY id ASC LIMIT 1`;
	const card_prev: UnifiedCardRow[] =
		await sql`SELECT * FROM unified_cards WHERE id < ${slug} ORDER BY id DESC LIMIT 1`;
	const printings: UnifiedPrintingRow[] =
		await sql`SELECT * FROM unified_printings WHERE card_id = ${slug}`;

	if (!card.length) {
		throw error(404, `Card not found`);
	}

	return {
		card: adaptCard(card[0]),
		card_next: card_next.length ? adaptCard(card_next[0]) : undefined,
		card_prev: card_prev.length ? adaptCard(card_prev[0]) : undefined,
		printings: printings.map(adaptPrinting),
		...data
	};
};
