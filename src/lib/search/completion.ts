import {
	BOOLEAN_MAP,
	CARD_TYPE_MAP,
	CYCLE_MAP,
	FACTION_MAP,
	SET_MAP,
	SUBTYPE_MAP
} from './vocabulary';

// Drop plurals when the singular exists, so "events" isn't suggested next to
// "event".
function dropPluralVariants(keys: string[]): string[] {
	const keySet = new Set(keys);
	return keys.filter((k) => {
		if (k.endsWith('ies') && keySet.has(k.slice(0, -3) + 'y')) return false;
		if (k.endsWith('es') && keySet.has(k.slice(0, -2))) return false;
		if (k.endsWith('s') && keySet.has(k.slice(0, -1))) return false;
		return true;
	});
}

// This prevents the full `weyland consortium` from being shown
// when we've already typed `weyland`.
const BLOCKLIST = new Set(['weyland consortium']);

function keepCompletablePhrases(map: Map<string, unknown>): string[] {
	return [...map.keys()].filter((k) => !k.includes('-') && k.length >= 3 && !BLOCKLIST.has(k));
}

// `sentry` should come before `security` and `sensie`
const SUBTYPE_PRIORITY = ['sentry'];

// The subtype/set/cycle lists load from the database after startup, so build
// these tiers on first use and rebuild them if the subtype list changes.
let completionTierCache: string[][] | null = null;
let completionTierCacheKey = -1;

// Tiers in priority order: card types, factions, subtypes, sets+cycles, booleans.
export function buildCompletionTiers(): string[][] {
	const key = SUBTYPE_MAP.size;
	if (completionTierCache && key === completionTierCacheKey) return completionTierCache;

	completionTierCache = [
		dropPluralVariants(keepCompletablePhrases(CARD_TYPE_MAP)).sort(),
		dropPluralVariants(keepCompletablePhrases(FACTION_MAP)).sort(),
		[
			...SUBTYPE_PRIORITY,
			...dropPluralVariants(keepCompletablePhrases(SUBTYPE_MAP))
				.filter((k) => !SUBTYPE_PRIORITY.includes(k))
				.sort()
		],
		[...keepCompletablePhrases(SET_MAP), ...keepCompletablePhrases(CYCLE_MAP)].sort(),
		dropPluralVariants(keepCompletablePhrases(BOOLEAN_MAP)).sort()
	];
	completionTierCacheKey = key;
	return completionTierCache;
}

// The bounds of the word the cursor is in.
export function getWordRangeAtCursor(
	input: string,
	cursor: number
): { start: number; end: number } {
	if (cursor < 0 || cursor > input.length) return { start: 0, end: 0 };

	const beforeCursor = input.substring(0, cursor);
	const afterCursor = input.substring(cursor);

	const start = beforeCursor.lastIndexOf(' ') + 1;
	const space = afterCursor.indexOf(' ');
	const end = space === -1 ? input.length : cursor + space;

	return { start, end };
}

export function getCompletionRemainder(input: string, cursor: number): string {
	const { start, end } = getWordRangeAtCursor(input, cursor);
	const word = input.substring(start, end);
	if (word.length < 2) return '';
	const lower = word.toLowerCase();
	for (const tier of buildCompletionTiers()) {
		const match = tier.find((k) => k.startsWith(lower) && k.length > lower.length);
		if (match) return match.slice(lower.length);
	}
	return '';
}
