import type { Interpretation } from './interpret';
import type { CardTypeIds, FactionIds } from '$lib/types';

// Filters are the faction and card type toggles in the deckbuilder toolbar. They mirror the
// typed input: a toggle is active when the input names it, and toggling edits the input.

export type Filter = { kind: 'faction'; id: FactionIds } | { kind: 'cardType'; id: CardTypeIds };

interface SourceRange {
	start: number;
	end: number;
}

interface FilterOccurrence {
	source: SourceRange;
	filters: Filter[];
}

function toArray<T>(value: T | T[]): T[] {
	return Array.isArray(value) ? value : [value];
}

function areFiltersEqual(left: Filter, right: Filter): boolean {
	return left.kind === right.kind && left.id === right.id;
}

function deduplicateFilters(filters: Filter[]): Filter[] {
	return filters.filter(
		(filter, index) =>
			filters.findIndex((candidate) => areFiltersEqual(candidate, filter)) === index
	);
}

export function collectActiveFilters(interpretation: Interpretation): Filter[] {
	return deduplicateFilters(
		collectFilterOccurrences(interpretation).flatMap(({ filters }) => filters)
	);
}

// Escape regex metacharacters (e.g. `.`, `*`, `+`) so recognized phrases match literally
function escapeRegex(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Find the next original source range for a phrase recognized from normalized input.
function findPhraseRange(input: string, phrase: string, from: number): SourceRange | undefined {
	const pattern = phrase.split(/\s+/).map(escapeRegex).join('\\s+');
	const matches = new RegExp(`\\b${pattern}\\b`, 'gi');
	matches.lastIndex = from;
	for (let match = matches.exec(input); match; match = matches.exec(input)) {
		return { start: match.index, end: match.index + match[0].length };
	}
	return undefined;
}

// Link each positive faction or card type intent to the text that produced it.
function collectFilterOccurrences({ input, matches }: Interpretation): FilterOccurrence[] {
	const occurrences: FilterOccurrence[] = [];
	let cursor = 0;

	for (const match of matches) {
		if (match.intent.kind !== 'faction' && match.intent.kind !== 'type') continue;
		const source = findPhraseRange(input, match.phrase, cursor);
		if (!source) continue;
		cursor = source.end;
		if (match.intent.negated) continue;

		const filters: Filter[] =
			match.intent.kind === 'faction'
				? toArray(match.intent.value).map((id) => ({ kind: 'faction', id }))
				: toArray(match.intent.value).map((id) => ({ kind: 'cardType', id }));
		occurrences.push({ source, filters });
	}

	return occurrences;
}

function formatFilterPhrase(filter: Filter): string {
	if (
		filter.kind === 'faction' &&
		(filter.id === 'neutral_corp' || filter.id === 'neutral_runner')
	) {
		return 'neutral';
	}
	return filter.id.replaceAll('_', ' ');
}

function collapseWhitespace(input: string): string {
	return input.replace(/\s+/g, ' ').trim();
}

// Remove every occurrence of an active filter, or append an inactive filter as plain text.
export function toggleFilterInInput(interpretation: Interpretation, filter: Filter): string {
	const occurrences = collectFilterOccurrences(interpretation).filter((occurrence) =>
		occurrence.filters.some((active) => areFiltersEqual(active, filter))
	);
	if (occurrences.length === 0) {
		return [interpretation.input.trim(), formatFilterPhrase(filter)].filter(Boolean).join(' ');
	}

	const sources = occurrences
		.map(({ source }) => source)
		.sort((left, right) => right.start - left.start);
	const edited = sources.reduce(
		(input, source) => `${input.slice(0, source.start)}${input.slice(source.end)}`,
		interpretation.input
	);
	return collapseWhitespace(edited);
}
