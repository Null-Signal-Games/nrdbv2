import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { FormatRow } from '$lib/types';
import { adaptFormat } from '$lib/adapter';

export const ssr = false;

export const load: PageLoad = async ({ data, params }) => {
	const format: FormatRow[] = await sql`
		SELECT
			f.*,
			(
				SELECT json_group_array(id)
				FROM (SELECT id FROM snapshots WHERE format_id = f.id ORDER BY date_start ASC)
			) as snapshot_ids,
			(
				SELECT json_group_array(id)
				FROM (SELECT id FROM restrictions WHERE format_id = f.id ORDER BY date_start ASC)
			) as restriction_ids,
			(
				SELECT card_pool_id
				FROM snapshots
				WHERE id = f.active_snapshot_id
			) as active_card_pool_id,
			(
				SELECT restriction_id
				FROM snapshots
				WHERE id = f.active_snapshot_id
			) as active_restriction_id
		FROM formats f
		WHERE f.id = ${params.slug}
	`;

	if (!format.length) {
		throw error(404, `format not found`);
	}

	return {
		format: adaptFormat(format[0]),
		...data
	};
};
