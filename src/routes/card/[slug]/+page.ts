import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Card, Printing, SQLite } from '$lib/types';
import { normalize_sqlite } from '$lib/utils';

export const ssr = false;

export const load: PageLoad = async ({ data, params }) => {
	const slug: string = params.slug.toLowerCase();

	const id_regex = /^\d+$/;
	let printing_id: SQLite<Printing, 'attributes'>['card_id'] | null = null;

	// If the slug is a printing ID, we need to find the corresponding card ID (string, i.e. `nightmare_archive`)
	if (id_regex.test(slug)) {
		const printing: SQLite<Printing, 'attributes'>[] =
			await sql`SELECT * FROM unified_printings WHERE id = ${slug} LIMIT 1`;
		printing_id = printing.length ? printing[0].card_id : null;
	}

	const card: SQLite<Card, 'attributes'>[] =
		await sql`SELECT * FROM unified_cards WHERE id = ${printing_id ?? slug} LIMIT 1`;
	const card_next: SQLite<Card, 'attributes'>[] =
		await sql`SELECT * FROM unified_cards WHERE id > ${slug} ORDER BY id ASC LIMIT 1`;
	const card_prev: SQLite<Card, 'attributes'>[] =
		await sql`SELECT * FROM unified_cards WHERE id < ${slug} ORDER BY id DESC LIMIT 1`;
	const printings: SQLite<Printing, 'attributes'>[] =
		await sql`SELECT * FROM unified_printings WHERE card_id = ${slug}`;

	if (!card.length) {
		throw error(404, `Card not found`);
	}

	return {
		card: normalize_sqlite(card)[0] as SQLite<Card, 'attributes'>,
		card_next: normalize_sqlite(card_next)[0] as SQLite<Card, 'attributes'>,
		card_prev: normalize_sqlite(card_prev)[0] as SQLite<Card, 'attributes'>,
		printings: normalize_sqlite(printings) as SQLite<Printing, 'attributes'>[],
		...data
	};
};
