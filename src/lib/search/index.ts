import { sql } from '$lib/sqlite';
import { interpret } from '$lib/search/interpret';
import { compileExpression, type CompileOptions } from '$lib/search/compile';
import { adaptCard } from '$lib/adapter';
import type { Card } from '$lib/api.types';
import type { UnifiedCardRow } from '$lib/sqlite.types';

export type SearchMode = 'literal' | 'interpreted';

export interface SearchCardsOptions extends CompileOptions {
	mode?: SearchMode;
}

// Card search runs in four steps: optionally interpret -> compile -> run -> adapt.
export async function searchCards(
	input: string,
	options: SearchCardsOptions = {}
): Promise<{ cards: Card[]; error: Error | null }> {
	const { mode = 'literal', ...compileOptions } = options;
	// 1. interpret: typed input -> NRDB search expression
	const expression = mode === 'interpreted' ? interpret(input).expression : input;
	// 2. compile: expression -> SQL
	const { sql: statement, params, error } = compileExpression(expression, compileOptions);
	if (error || !statement) {
		return { cards: [], error };
	}
	// 3. run: execute the SQL against the local SQLite database
	const rows = (await sql(statement, ...params)) as UnifiedCardRow[];
	// 4. adapt: rows -> Card objects
	return { cards: rows.map(adaptCard), error: null };
}
