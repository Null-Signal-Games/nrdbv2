import { CardSearchQueryBuilder } from '$lib/search_grammar_and_builder';
import type { DeckFormat } from '$lib/deck_formats';
import type { SidesIds } from '$lib/types';

export interface CardQuery {
	sql: string | null;
	params: unknown[];
	error: Error | null;
}

export interface TranslateOptions {
	limit?: number;
	format?: DeckFormat;
	side?: SidesIds;
	constraint?: { clause: string; params: readonly unknown[] };
}

// Translate an NRDB search expression into SQL.
export function translateToQuery(
	query: string,
	{ limit, format = 'all', side, constraint }: TranslateOptions = {}
): CardQuery {
	const clauses: string[] = [];
	const params: unknown[] = [];

	for (const expression of [query, format === 'all' ? '' : `format:${format}`]) {
		if (!expression.trim()) continue;
		let builder: CardSearchQueryBuilder;
		try {
			builder = new CardSearchQueryBuilder(expression);
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
		clauses.push(builder.where);
		params.push(...builder.where_values);
	}

	if (clauses.length === 0 && !side && !constraint) {
		return { sql: null, params: [], error: null };
	}

	if (side) {
		clauses.push('unified_cards.side_id = ?');
		params.push(side);
	}
	if (constraint) {
		clauses.push(constraint.clause);
		params.push(...constraint.params);
	}

	const where =
		clauses.length > 1 ? clauses.map((clause) => `(${clause})`).join(' AND ') : clauses[0];
	let text = `SELECT * FROM unified_cards WHERE ${where} ORDER BY title ASC`;

	if (limit !== undefined) {
		text += ' LIMIT ?';
		params.push(limit);
	}

	return { sql: text, params, error: null };
}
