import { sql } from '$lib/sqlite';
import { populateDynamicVocab, type VocabOption } from '$lib/search/vocabulary';

// Call once the DB is ready.
// TODO: move these lookups into a shared global state - many other places will need them.
export async function initSearchVocab(): Promise<void> {
	const [sets, cycles, subtypes] = (await Promise.all([
		sql(`SELECT id, name FROM card_sets`),
		sql(`SELECT id, name FROM card_cycles`),
		sql(`SELECT id, name FROM card_subtypes`)
	])) as [VocabOption[], VocabOption[], VocabOption[]];
	populateDynamicVocab(sets, cycles, subtypes);
}

// Always calls onReady, even if loading fails, so search falls back to the static
// vocabulary instead of never becoming ready.
export async function prepareSearch(onReady: () => void): Promise<void> {
	try {
		await initSearchVocab();
	} catch (vocabError) {
		console.error('[SEARCH] Failed to populate search vocabulary:', vocabError);
	} finally {
		onReady();
	}
}
