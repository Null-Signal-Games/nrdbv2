import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { UnifiedPrintingRow } from '$lib/types';
import { adaptPrinting } from '$lib/adapter';

export const ssr = false;

export const load: PageLoad = async ({ data, params }) => {
	const printings: UnifiedPrintingRow[] =
		await sql`SELECT * FROM unified_printings WHERE illustrator_ids LIKE '%' || '"' || ${params.slug} || '"' || '%'`;

	if (!printings.length) {
		throw error(404, `Illustrator not found`);
	}

	return {
		printings: printings.map(adaptPrinting),
		...data
	};
};
