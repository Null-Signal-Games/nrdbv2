import {
	type IntentMatch,
	type SemanticIntent,
	normalizeInput,
	extractNumericIntents,
	recognizeIntents,
	assembleOutput
} from './intents';
import { RE_QUOTED_TERM } from './patterns';
import type { CardTypeIds, FactionIds } from '$lib/types';

// A quoted term swapped out for a positional placeholder. The placeholder is delimited by
// NULL so it survives lowercasing/normalization and the numeric pre-pass untouched, and is a
// single whitespace-free token so recognizeIntents keeps it whole. Restoring it in place
// (rather than extracting and re-appending) preserves its position relative to `or` - pulling
// quoted terms out would orphan the or-marker and turn `x:"tag" or x:"damage"` into an AND.
// oxlint-disable-next-line no-control-regex -- NULL is an intentional, collision-proof delimiter
const RE_PLACEHOLDER = /^\x00(\d+)\x00$/;
const RE_QUOTED_GROUP = /!?\([^()]*"[^"]+"[^()]*\)/g;

function pushTerm(terms: SemanticIntent[], token: string): string {
	const i = terms.length;
	terms.push({ kind: 'semantic', tokens: [token] });
	return ` \x00${i}\x00 `;
}

function extractQuotedTerms(input: string): { remainder: string; terms: SemanticIntent[] } {
	const terms: SemanticIntent[] = [];
	const withQuotedGroups = input.replace(RE_QUOTED_GROUP, (match) => pushTerm(terms, match));
	const remainder = withQuotedGroups.replace(
		RE_QUOTED_TERM,
		(match, prefix: string | undefined, phrase: string) => {
			// Explicit field/operator syntax (x:"...") passes through verbatim; a bare quoted
			// string (no field prefix) becomes a title/text search.
			return pushTerm(terms, prefix ? match : `"${phrase.toLowerCase()}"`);
		}
	);
	return { remainder, terms };
}

export type QueryFilter =
	| { kind: 'faction'; id: FactionIds }
	| { kind: 'cardType'; id: CardTypeIds };

interface SourceRange {
	start: number;
	end: number;
}

interface QueryFilterOccurrence {
	source: SourceRange;
	filters: QueryFilter[];
}

export interface QueryInterpretation {
	input: string;
	expression: string;
	occurrences: QueryFilterOccurrence[];
}

function toArray<T>(value: T | T[]): T[] {
	return Array.isArray(value) ? value : [value];
}

function areFiltersEqual(left: QueryFilter, right: QueryFilter): boolean {
	return left.kind === right.kind && left.id === right.id;
}

function deduplicateFilters(filters: QueryFilter[]): QueryFilter[] {
	return filters.filter(
		(filter, index) =>
			filters.findIndex((candidate) => areFiltersEqual(candidate, filter)) === index
	);
}

export function collectActiveFilters(interpretation: QueryInterpretation): QueryFilter[] {
	return deduplicateFilters(interpretation.occurrences.flatMap(({ filters }) => filters));
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
function collectNaturalFilterOccurrences(
	input: string,
	matches: IntentMatch[]
): QueryFilterOccurrence[] {
	const occurrences: QueryFilterOccurrence[] = [];
	let cursor = 0;

	for (const match of matches) {
		if (match.intent.kind !== 'faction' && match.intent.kind !== 'type') continue;
		const source = findPhraseRange(input, match.phrase, cursor);
		if (!source) continue;
		cursor = source.end;
		if (match.intent.negated) continue;

		const filters: QueryFilter[] =
			match.intent.kind === 'faction'
				? toArray(match.intent.value).map((id) => ({ kind: 'faction', id }))
				: toArray(match.intent.value).map((id) => ({ kind: 'cardType', id }));
		occurrences.push({ source, filters });
	}

	return occurrences;
}

// Interpret the query and retain the source ranges needed to toggle its filters.
export function interpretQuery(input: string): QueryInterpretation {
	const { remainder, terms } = extractQuotedTerms(input);
	const normalized = normalizeInput(remainder);
	const { intents: numericIntents, remainder: afterNumeric } = extractNumericIntents(normalized);
	const matches = recognizeIntents(afterNumeric).map((match) => {
		const { intent } = match;
		if (intent.kind === 'freeform') {
			const placeholder = RE_PLACEHOLDER.exec(intent.word);
			if (placeholder) return { ...match, intent: terms[Number(placeholder[1])] };
		}
		return match;
	});
	const expression = assembleOutput([...numericIntents, ...matches.map(({ intent }) => intent)]);
	const occurrences = collectNaturalFilterOccurrences(input, matches);
	return {
		input,
		expression,
		occurrences
	};
}

export function interpretSearch(input: string): string {
	return interpretQuery(input).expression;
}

function formatFilterPhrase(filter: QueryFilter): string {
	if (
		filter.kind === 'faction' &&
		(filter.id === 'neutral_corp' || filter.id === 'neutral_runner')
	) {
		return 'neutral';
	}
	return filter.id.replaceAll('_', ' ');
}

function normalizeQueryAfterFilterRemoval(input: string): string {
	return input.replace(/\s+/g, ' ').trim();
}

// Remove every occurrence of an active filter, or append an inactive filter as plain text.
export function toggleFilterInQuery(
	interpretation: QueryInterpretation,
	filter: QueryFilter
): string {
	const occurrences = interpretation.occurrences.filter((occurrence) =>
		occurrence.filters.some((active) => areFiltersEqual(active, filter))
	);
	if (occurrences.length === 0) {
		return [interpretation.input.trim(), formatFilterPhrase(filter)].filter(Boolean).join(' ');
	}

	const sources = occurrences
		.map(({ source }) => source)
		.sort((left, right) => right.start - left.start);
	const edited = sources.reduce(
		(query, source) => `${query.slice(0, source.start)}${query.slice(source.end)}`,
		interpretation.input
	);
	return normalizeQueryAfterFilterRemoval(edited);
}
