import { CardSearchQueryBuilder } from '$lib/search_grammar_and_builder';
import type { DeckFormat } from '$lib/deck_formats';
import type { SidesIds } from '$lib/types';

export interface CompileResult {
	// Null when there is nothing to search for, or when compiling failed.
	sql: string | null;
	params: unknown[];
	error: Error | null;
}

export interface CompileOptions {
	limit?: number;
	format?: DeckFormat;
	side?: SidesIds;
	matchAllWhenBlank?: boolean;
}

// Compile an NRDB search expression into SQL.
export function compileExpression(
	expression: string,
	{ limit, format = 'all', side, matchAllWhenBlank = false }: CompileOptions = {}
): CompileResult {
	const clauses: string[] = [];
	const params: unknown[] = [];

	const formatExpression = format === 'all' ? '' : `format:${format}`;
	for (const part of [expression, formatExpression]) {
		if (!part.trim()) continue;
		let builder: CardSearchQueryBuilder;
		try {
			builder = new CardSearchQueryBuilder(part);
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

	if (side) {
		clauses.push('unified_cards.side_id = ?');
		params.push(side);
	}

	if (clauses.length === 0 && !matchAllWhenBlank) {
		return { sql: null, params: [], error: null };
	}

	const where =
		clauses.length > 1 ? clauses.map((clause) => `(${clause})`).join(' AND ') : clauses[0];
	let sql = 'SELECT * FROM unified_cards';
	if (where) sql += ` WHERE ${where}`;
	sql += ' ORDER BY title ASC';

	if (limit !== undefined) {
		sql += ' LIMIT ?';
		params.push(limit);
	}

	return { sql, params, error: null };
}
