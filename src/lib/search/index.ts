import { sql } from '$lib/sqlite';
import { interpretSearch } from '$lib/search/interpret';
import { translateToQuery } from '$lib/search/translate';
import { populateDynamicVocab, type VocabOption } from '$lib/search/vocabulary';
import { adaptCard } from '$lib/adapter';
import type { Card } from '$lib/api.types';
import type { UnifiedCardRow } from '$lib/sqlite.types';

// Card search runs in four steps: interpret -> translate -> run -> adapt.
export async function searchCards(
	input: string,
	limit = 5
): Promise<{ cards: Card[]; error: Error | null }> {
	// 1. interpret: natural-language words -> NRDB search expression
	const expression = interpretSearch(input);
	// 2. translate: expression -> SQL
	const { sql: text, params, error } = translateToQuery(expression, limit);
	if (error || !text) {
		return { cards: [], error };
	}
	// 3. run: execute against the local SQLite database
	const rows = (await sql(text, ...params)) as UnifiedCardRow[];
	// 4. adapt: rows -> Card objects
	return { cards: rows.map(adaptCard), error: null };
}

// Loads set/cycle/subtype names into the search vocabulary; call once the DB is ready.
// TODO: move these lookups into a shared global state - many other places will need them.
export async function initSearchVocab(): Promise<void> {
	const [sets, cycles, subtypes] = (await Promise.all([
		sql(`SELECT id, name FROM card_sets`),
		sql(`SELECT id, name FROM card_cycles`),
		sql(`SELECT id, name FROM card_subtypes`)
	])) as [VocabOption[], VocabOption[], VocabOption[]];
	populateDynamicVocab(sets, cycles, subtypes);
}

// Loads the search vocabulary, then signals readiness via onReady. Await this before
// flipping the readiness flag so searches never run against empty subtype/set/cycle maps.
// A vocab failure is logged but still marks ready, so search degrades to the static
// vocabulary rather than never running.
export async function prepareSearch(onReady: () => void): Promise<void> {
	try {
		await initSearchVocab();
	} catch (vocabError) {
		console.error('[SEARCH] Failed to populate search vocabulary:', vocabError);
	} finally {
		onReady();
	}
}
