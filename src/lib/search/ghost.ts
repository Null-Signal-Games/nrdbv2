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

function keepCompletablePhrases(map: Record<string, unknown>): string[] {
	return Object.keys(map).filter((k) => !k.includes('-') && k.length >= 3 && !BLOCKLIST.has(k));
}

// `sentry` should come before `security` and `sensie`
const SUBTYPE_PRIORITY = ['sentry'];

// The subtype/set/cycle lists load from the database after startup, so build
// these tiers on first use and rebuild them if the subtype list changes.
let completionTierCache: string[][] | null = null;
let completionTierCacheKey = -1;

// Tiers in priority order: card types, factions, subtypes, sets+cycles, booleans.
export function buildCompletionTiers(): string[][] {
	const key = Object.keys(SUBTYPE_MAP).length;
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
	text: string,
	cursorPosition: number
): { start: number; end: number } {
	if (cursorPosition < 0 || cursorPosition > text.length) return { start: 0, end: 0 };

	const beforeCursor = text.substring(0, cursorPosition);
	const afterCursor = text.substring(cursorPosition);

	const start = beforeCursor.lastIndexOf(' ') + 1;
	const space = afterCursor.indexOf(' ');
	const end = space === -1 ? text.length : cursorPosition + space;

	return { start, end };
}

// The rest of the word we can fill in, or '' if there's nothing to suggest.
export function getGhostRemainder(text: string, cursor: number): string {
	const { start, end } = getWordRangeAtCursor(text, cursor);
	const word = text.substring(start, end);
	if (word.length < 2) return '';
	const lower = word.toLowerCase();
	for (const tier of buildCompletionTiers()) {
		const match = tier.find((k) => k.startsWith(lower) && k.length > lower.length);
		if (match) return match.slice(lower.length);
	}
	return '';
}
