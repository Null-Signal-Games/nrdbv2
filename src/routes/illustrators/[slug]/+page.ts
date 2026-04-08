import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Printing, SQLite } from '$lib/types';
import { normalize_sqlite } from '$lib/utils';

export const ssr = false;

export const load: PageLoad = async ({ data, params }) => {
	const printings: SQLite<Printing, 'attributes'>[] =
		await sql`SELECT * FROM unified_printings WHERE illustrator_ids LIKE '%' || '"' || ${params.slug} || '"' || '%'`;

	if (!printings.length) {
		throw error(404, `Illustrator not found`);
	}

	return {
		printings: normalize_sqlite(printings) as SQLite<Printing, 'attributes'>[],
		...data
	};
};
