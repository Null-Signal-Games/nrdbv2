import { sql } from '$lib/sqlite';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Illustrator, Printing } from '$lib/types';
import { normalize_sqlite } from '$lib/utils';

export const ssr = false;

const empty_relationships = {
	side: { links: { related: '' } },
	cards: { links: { related: '' } },
	decklists: { links: { related: '' } },
	printings: { links: { related: '' } }
};

export const load: PageLoad = async ({ data }) => {
	const illustrators: Array<{ id: string } & Illustrator['attributes']> =
		await sql`SELECT * FROM illustrators`;
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

	const normalized_illustrators = normalize_sqlite(illustrators) as Illustrator[];
	const normalized_printings = normalize_sqlite(printings) as Array<
		Printing & {
			attributes: Printing['attributes'] & {
				illustrator_id: string;
				illustrator_rank: number;
			};
		}
	>;

	const illustrator_printings = normalized_printings.reduce<Record<string, Printing[]>>(
		(accumulator, printing) => {
			const { illustrator_id, illustrator_rank, ...attributes } = printing.attributes;

			void illustrator_rank;

			const existing_printings = accumulator[illustrator_id] ?? [];
			accumulator[illustrator_id] = [
				...existing_printings,
				{
					id: printing.id,
					type: printing.type,
					attributes,
					relationships: empty_relationships,
					links: { self: '' }
				}
			];

			return accumulator;
		},
		{}
	);

	return {
		illustrators: normalized_illustrators,
		illustrator_printings,
		...data
	};
};
