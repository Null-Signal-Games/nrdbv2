import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Illustrator, SQLite } from '$lib/types';
import { normalize_sqlite } from '$lib/utils';

export const ssr = false;

export const load: PageLoad = async ({ data }) => {
	const illustrators: SQLite<Illustrator, 'attributes'>[] = await sql`SELECT * FROM illustrators`;

	if (!illustrators.length) {
		throw error(404, `Illustrator not found`);
	}

	return {
		illustrators: normalize_sqlite(illustrators) as SQLite<Illustrator, 'attributes'>[],
		...data
	};
};
