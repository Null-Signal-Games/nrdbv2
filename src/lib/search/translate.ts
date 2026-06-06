import { CardSearchQueryBuilder } from '$lib/search_grammar_and_builder';

export interface CardQuery {
	sql: string | null;
	params: unknown[];
	error: Error | null;
}

// Translate an NRDB search expression into SQL.
export function buildQuery(query: string, limit = 5): CardQuery {
	if (!query.trim()) {
		return { sql: null, params: [], error: null };
	}

	// The builder throws (rather than setting parse_error) on compile errors like an unknown keyword.
	let builder: CardSearchQueryBuilder;
	try {
		builder = new CardSearchQueryBuilder(query);
	} catch (e) {
		return {
			sql: null,
			params: [],
			error: e instanceof Error ? e : new Error(String(e))
		};
	}
	if (builder.parse_error) {
		return { sql: null, params: [], error: builder.parse_error };
	}

	const joins = builder.left_joins.join(' ');
	const from = joins ? `unified_cards ${joins}` : 'unified_cards';
	const text = `SELECT * FROM ${from} WHERE ${builder.where} ORDER BY title ASC LIMIT ?`;
	return { sql: text, params: [...builder.where_values, limit], error: null };
}
