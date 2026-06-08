import {
	FACTION_MAP,
	SIDE_MAP,
	CARD_TYPE_MAP,
	SUBTYPE_MAP,
	SET_MAP,
	CYCLE_MAP,
	BOOLEAN_MAP,
	SEMANTIC_MAP,
	MAX_PHRASE_WORDS,
	wordToField
} from './vocabulary';
import {
	RE_GTE_WORDS,
	RE_LTE_WORDS,
	RE_AT_LEAST,
	RE_AT_MOST,
	RE_GT_WORDS,
	RE_MORE_THAN,
	RE_LT_WORDS,
	RE_FEWER_THAN,
	RE_N_OR_MORE,
	RE_N_OR_FEWER,
	RE_NON_HYPHEN,
	RE_NOT_WORD,
	RE_AGENDA_RATIO,
	RE_COMPOUND_OR_FIELD_AT_END,
	RE_COMPOUND_OR_FIELD_AT_START,
	RE_SINGLE_FIELD_AT_END,
	RE_SINGLE_FIELD_AT_START,
	RE_BARE_NUMBER_OR_FIELD,
	RE_BARE_NUMBER_FIELD
} from './patterns';

export interface SideIntent {
	kind: 'side';
	value: string;
	negated: boolean;
}
export interface FactionIntent {
	kind: 'faction';
	value: string | string[];
	negated: boolean;
}
export interface TypeIntent {
	kind: 'type';
	value: string | string[];
	negated: boolean;
}
export interface SubtypeIntent {
	kind: 'subtype';
	value: string;
	negated: boolean;
}
export interface SetIntent {
	kind: 'set';
	value: string;
	negated: boolean;
}
export interface CycleIntent {
	kind: 'cycle';
	value: string;
	negated: boolean;
}
export interface NumericIntent {
	kind: 'numeric';
	field: string;
	op: string;
	value: number;
}
export interface AgendaRatioIntent {
	kind: 'agendaRatio';
	advancement: number;
	points: number;
}
export interface BooleanIntent {
	kind: 'boolean';
	field: string;
	value: 0 | 1;
}
export interface SemanticIntent {
	kind: 'semantic';
	tokens: string[];
}
export interface FreeformIntent {
	kind: 'freeform';
	word: string;
}

export interface OrMarkerIntent {
	kind: 'or_marker';
}

export type Intent =
	| SideIntent
	| FactionIntent
	| TypeIntent
	| SubtypeIntent
	| SetIntent
	| CycleIntent
	| NumericIntent
	| AgendaRatioIntent
	| BooleanIntent
	| SemanticIntent
	| FreeformIntent
	| OrMarkerIntent;

export type StructuredIntent = Exclude<Intent, OrMarkerIntent>;

// Must stay in sync with resolveNeutralFaction on the consuming side.
export const NEUTRAL_FACTION_OR_QUERY = '(f:neutral_corp or f:neutral_runner)';

export function normalizeInput(input: string): string {
	return (
		input
			.toLowerCase()
			.trim()
			.replace(RE_GTE_WORDS, '>=')
			.replace(RE_LTE_WORDS, '<=')
			.replace(RE_AT_LEAST, '>=')
			.replace(RE_AT_MOST, '<=')
			.replace(RE_GT_WORDS, '>')
			.replace(RE_MORE_THAN, '>')
			.replace(RE_LT_WORDS, '<')
			.replace(RE_FEWER_THAN, '<')
			.replace(RE_N_OR_MORE, '>=$1')
			.replace(RE_N_OR_FEWER, '<=$1')
			// non_ marks a negated word for phase 3
			.replace(RE_NON_HYPHEN, 'non_$1')
			.replace(RE_NOT_WORD, 'non_$1')
	);
}

export function extractNumericIntents(normalized: string): {
	intents: (NumericIntent | AgendaRatioIntent | OrMarkerIntent)[];
	remainder: string;
} {
	const intents: (NumericIntent | AgendaRatioIntent | OrMarkerIntent)[] = [];
	const or: OrMarkerIntent = { kind: 'or_marker' };

	const pushNumeric = (fieldWord: string, op: string, n: string) => {
		const field = wordToField(fieldWord);
		if (field) intents.push({ kind: 'numeric', field, op, value: parseInt(n, 10) });
	};
	const pushCompoundOr = (
		fieldWord: string,
		op1: string,
		n1: string,
		op2: string,
		n2: string
	) => {
		const field = wordToField(fieldWord);
		if (!field) return;
		intents.push({ kind: 'numeric', field, op: op1, value: parseInt(n1, 10) });
		intents.push(or);
		intents.push({ kind: 'numeric', field, op: op2, value: parseInt(n2, 10) });
	};

	let remainder = normalized;

	// "5/3s" or "5/3"
	remainder = remainder.replace(RE_AGENDA_RATIO, (_, advancement, points) => {
		intents.push({
			kind: 'agendaRatio',
			advancement: parseInt(advancement, 10),
			points: parseInt(points, 10)
		});
		return ' ';
	});

	// "< 2 or > 5 strength"
	remainder = remainder.replace(RE_COMPOUND_OR_FIELD_AT_END, (_, op1, n1, op2, n2, field) => {
		pushCompoundOr(field, op1, n1, op2, n2);
		return ' ';
	});

	// "strength < 2 or > 5"
	remainder = remainder.replace(RE_COMPOUND_OR_FIELD_AT_START, (_, field, op1, n1, op2, n2) => {
		pushCompoundOr(field, op1, n1, op2, n2);
		return ' ';
	});

	// "> 5 strength"
	remainder = remainder.replace(RE_SINGLE_FIELD_AT_END, (_, op, n, field) => {
		pushNumeric(field, op, n);
		return ' ';
	});

	// "rez cost > 5"
	remainder = remainder.replace(RE_SINGLE_FIELD_AT_START, (_, field, op, n) => {
		pushNumeric(field, op, n);
		return ' ';
	});

	// "1 or 2 trash"
	remainder = remainder.replace(RE_BARE_NUMBER_OR_FIELD, (_, n1, n2, field) => {
		pushCompoundOr(field, ':', n1, ':', n2);
		return ' ';
	});

	// "0 cost", "3 strength"
	remainder = remainder.replace(RE_BARE_NUMBER_FIELD, (_, n, field) => {
		pushNumeric(field, ':', n);
		return ' ';
	});

	return { intents, remainder };
}

export function recognizeIntents(remainder: string): Intent[] {
	const rawWords = remainder.trim().split(/\s+/).filter(Boolean);

	const words: string[] = [];
	const negatedSet = new Set<number>();

	for (const w of rawWords) {
		if (w.startsWith('non_')) {
			const stripped = w.slice(4);
			if (stripped) {
				negatedSet.add(words.length);
				words.push(stripped);
			}
		} else {
			words.push(w);
		}
	}

	const intents: Intent[] = [];
	let i = 0;

	while (i < words.length) {
		const negated = negatedSet.has(i);
		i += matchAt(words, i, negated, intents);
	}

	return intents;
}

// Matches the longest phrase at index i and returns words consumed. Lookup order
// semantic > boolean > faction > type > subtype > side keeps single-word side from
// shadowing "corp"/"runner" subtypes.
function matchAt(words: string[], i: number, negated: boolean, intents: Intent[]): number {
	const maxLen = Math.min(MAX_PHRASE_WORDS, words.length - i);

	for (let len = maxLen; len >= 1; len--) {
		const phrase = words.slice(i, i + len).join(' ');

		const sem = SEMANTIC_MAP.get(phrase);
		if (sem) {
			intents.push({ kind: 'semantic', tokens: sem });
			return len;
		}

		if (phrase in BOOLEAN_MAP) {
			const { field, onValue } = BOOLEAN_MAP[phrase];
			const value: 0 | 1 = negated ? ((1 - onValue) as 0 | 1) : onValue;
			intents.push({ kind: 'boolean', field, value });
			return len;
		}

		if (phrase in FACTION_MAP) {
			intents.push({ kind: 'faction', value: FACTION_MAP[phrase], negated });
			return len;
		}

		if (phrase in CARD_TYPE_MAP) {
			intents.push({ kind: 'type', value: CARD_TYPE_MAP[phrase], negated });
			return len;
		}

		if (phrase in SUBTYPE_MAP) {
			intents.push({ kind: 'subtype', value: SUBTYPE_MAP[phrase], negated });
			return len;
		}

		if (phrase in SET_MAP) {
			intents.push({ kind: 'set', value: SET_MAP[phrase], negated });
			return len;
		}

		if (phrase in CYCLE_MAP) {
			intents.push({ kind: 'cycle', value: CYCLE_MAP[phrase], negated });
			return len;
		}

		if (len === 1 && phrase in SIDE_MAP) {
			intents.push({ kind: 'side', value: SIDE_MAP[phrase], negated });
			return 1;
		}
	}

	const word = words[i];
	if (word === 'or') {
		intents.push({ kind: 'or_marker' });
		return 1;
	}
	// bare digits are leftovers from the numeric pre-pass
	if (/^\d+$/.test(word)) return 1;

	intents.push({ kind: 'freeform', word });
	return 1;
}

const KIND_PRIORITY: Record<StructuredIntent['kind'], number> = {
	side: 0,
	faction: 1,
	type: 2,
	subtype: 3,
	set: 4,
	cycle: 5,
	agendaRatio: 6,
	numeric: 7,
	boolean: 8,
	semantic: 9,
	freeform: 10
};

interface OrGroupIntent {
	kind: 'or_group';
	members: StructuredIntent[];
	priority: number;
}

type AssemblyItem = StructuredIntent | OrGroupIntent;

// Negated array factions/types are AND-negation, not OR alternatives, so they aren't expanded.
function expandForOrGroup(intent: StructuredIntent): StructuredIntent[] {
	if (
		(intent.kind === 'faction' || intent.kind === 'type') &&
		Array.isArray(intent.value) &&
		!intent.negated
	) {
		const { kind } = intent;
		return (intent.value as string[]).map(
			(v) => ({ kind, value: v, negated: false }) as StructuredIntent
		);
	}
	return [intent];
}

// A run of structured intents joined by single or_markers, starting at i.
// Stops at the first non-marker gap (or a doubled marker like "a or or b").
function collectOrChain(flat: Intent[], i: number): { members: StructuredIntent[]; next: number } {
	const members: StructuredIntent[] = [flat[i] as StructuredIntent];
	let j = i + 1;
	while (flat[j]?.kind === 'or_marker' && flat[j + 1] && flat[j + 1].kind !== 'or_marker') {
		members.push(flat[j + 1] as StructuredIntent);
		j += 2;
	}
	return { members, next: j };
}

function groupOrIntents(flat: Intent[]): AssemblyItem[] {
	const result: AssemblyItem[] = [];
	let i = 0;

	while (i < flat.length) {
		const cur = flat[i];

		if (cur.kind === 'or_marker') {
			i++; // orphaned marker, nothing to anchor it to
			continue;
		}

		const chain = collectOrChain(flat, i);
		if (chain.members.length > 1) {
			const members = chain.members.flatMap(expandForOrGroup);
			const priority = Math.min(...members.map((m) => KIND_PRIORITY[m.kind] ?? 99));
			result.push({ kind: 'or_group', members, priority });
		} else {
			result.push(cur as StructuredIntent);
		}
		i = chain.next;
	}

	return result;
}

function arrayFieldStr(prefix: string, v: string | string[], negated: boolean): string {
	if (Array.isArray(v)) {
		// negated array must match none (AND): one negative token each
		return negated
			? v.map((x) => `${prefix}!${x}`).join(' ')
			: `(${v.map((x) => `${prefix}:${x}`).join(' or ')})`;
	}
	return negated ? `${prefix}!${v}` : `${prefix}:${v}`;
}

export function intentFilterStr(intent: StructuredIntent): string {
	switch (intent.kind) {
		case 'side':
			return intent.negated ? `d!${intent.value}` : `d:${intent.value}`;
		case 'faction':
			return arrayFieldStr('f', intent.value, intent.negated);
		case 'type':
			return arrayFieldStr('t', intent.value, intent.negated);
		case 'subtype':
			return intent.negated ? `s!${intent.value}` : `s:${intent.value}`;
		case 'set':
			return intent.negated ? `e!${intent.value}` : `e:${intent.value}`;
		case 'cycle':
			return intent.negated ? `c!${intent.value}` : `c:${intent.value}`;
		case 'numeric':
			return `${intent.field}${intent.op}${intent.value}`;
		case 'agendaRatio':
			return `g:${intent.advancement} v:${intent.points}`;
		case 'boolean':
			return `${intent.field}:${intent.value}`;
		case 'semantic':
			return intent.tokens.join(' ');
		case 'freeform':
			// bare word: matched against both title and text
			return intent.word;
	}
}

export function assembleOutput(intents: Intent[]): string {
	const grouped = groupOrIntents(intents);

	const sorted = grouped
		.map((item, idx) => ({ item, idx }))
		.sort((a, b) => {
			const pa =
				a.item.kind === 'or_group' ? a.item.priority : (KIND_PRIORITY[a.item.kind] ?? 99);
			const pb =
				b.item.kind === 'or_group' ? b.item.priority : (KIND_PRIORITY[b.item.kind] ?? 99);
			return pa !== pb ? pa - pb : a.idx - b.idx;
		})
		.map(({ item }) => item);

	const parts: string[] = [];
	const freeformParts: string[] = [];

	for (const item of sorted) {
		if (item.kind === 'freeform') {
			freeformParts.push(item.word);
			continue;
		}
		if (item.kind === 'or_group') {
			const memberStrs = item.members.map((m) => intentFilterStr(m));
			parts.push(`(${memberStrs.join(' or ')})`);
			continue;
		}
		parts.push(intentFilterStr(item));
	}

	parts.push(...freeformParts);

	return parts.join(' ');
}
