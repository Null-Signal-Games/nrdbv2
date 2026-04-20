import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Format } from '$lib/types';
import { normalize_sqlite } from '$lib/utils';

export const ssr = false;

export const load: PageLoad = async ({ data }) => {
	const formats: Array<{ id: string } & Format['attributes']> = await sql`SELECT * FROM formats`;

	if (!formats.length) {
		throw error(404, `formats not found`);
	}

	return {
		formats: normalize_sqlite(formats) as Format[],
		...data
	};
};
