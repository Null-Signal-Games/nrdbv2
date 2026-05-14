import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Printing, UnifiedPrintingRow, IllustratorRow } from '$lib/types';
import { adaptPrinting, adaptIllustrator } from '$lib/adapter';

export const ssr = false;

const empty_relationships = {
	side: { links: { related: '' } },
	cards: { links: { related: '' } },
	decklists: { links: { related: '' } },
	printings: { links: { related: '' } }
};

export const load: PageLoad = async ({ data }) => {
	const illustrators: IllustratorRow[] = await sql`SELECT * FROM illustrators`;
	const printings = await sql`
        WITH illustrator_printings AS (
            SELECT
                unified_printings.*,
                json_each.value AS illustrator_id,
                row_number() OVER (
                    PARTITION BY json_each.value
                    ORDER BY unified_printings.date_release DESC, unified_printings.id DESC
                ) AS illustrator_rank
            FROM unified_printings, json_each(unified_printings.illustrator_ids)
            WHERE unified_printings.illustrator_ids IS NOT NULL
                AND unified_printings.illustrator_ids != '[]'
        )
        SELECT *
        FROM illustrator_printings
        WHERE illustrator_rank <= 3
        ORDER BY illustrator_id ASC, illustrator_rank ASC
    `;

	if (!illustrators.length) {
		throw error(404, `Illustrator not found`);
	}

	const normalized_illustrators = illustrators.map(adaptIllustrator);
	const illustrator_printings = (
		printings as Array<
			UnifiedPrintingRow & { illustrator_id: string; illustrator_rank: number }
		>
	).reduce<Record<string, Printing[]>>((accumulator, printing_row) => {
		const adapted = adaptPrinting(printing_row);
		const { illustrator_id } = printing_row;

		const existing_printings = accumulator[illustrator_id] ?? [];
		accumulator[illustrator_id] = [
			...existing_printings,
			{
				...adapted,
				relationships: empty_relationships,
				links: { self: '' }
			}
		];

		return accumulator;
	}, {});

	return {
		illustrators: normalized_illustrators,
		illustrator_printings,
		...data
	};
};
