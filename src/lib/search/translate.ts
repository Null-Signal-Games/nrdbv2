import { CardSearchQueryBuilder } from '$lib/search_grammar_and_builder';

export interface CardQuery {
	sql: string | null;
	params: unknown[];
	error: Error | null;
}

export interface TranslateOptions {
	limit?: number;
	constraint?: { clause: string; params: readonly unknown[] };
}

// Translate an NRDB search expression into SQL.
export function translateToQuery(
	query: string,
	{ limit, constraint }: TranslateOptions = {}
): CardQuery {
	let builder: CardSearchQueryBuilder | null = null;

	if (query.trim()) {
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
	} else if (!constraint) {
		return { sql: null, params: [], error: null };
	}

	const clauses: string[] = [];
	const params: unknown[] = [];

	if (builder) {
		clauses.push(builder.where);
		params.push(...builder.where_values);
	}
	if (constraint) {
		clauses.push(constraint.clause);
		params.push(...constraint.params);
	}

	const where =
		clauses.length > 1 ? clauses.map((clause) => `(${clause})`).join(' AND ') : clauses[0];
	const joins = builder?.left_joins.join(' ') ?? '';
	const from = joins ? `unified_cards ${joins}` : 'unified_cards';
	let text = `SELECT * FROM ${from} WHERE ${where} ORDER BY title ASC`;

	if (limit !== undefined) {
		text += ' LIMIT ?';
		params.push(limit);
	}

	return { sql: text, params, error: null };
}
