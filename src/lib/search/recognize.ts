import type {
	AgendaRatioIntent,
	ComparisonOperator,
	Intent,
	IntentMatch,
	IntentOrConnective,
	NumericIntent,
	Connective,
	VerbatimIntent
} from './intents';
import {
	FACTION_MAP,
	SIDE_MAP,
	CARD_TYPE_MAP,
	SUBTYPE_MAP,
	SET_MAP,
	CYCLE_MAP,
	BOOLEAN_MAP,
	TEXT_MAP,
	getMaxPhraseWords,
	findNumericField
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
	RE_BARE_NUMBER_FIELD,
	RE_PLACEHOLDER,
	RE_QUOTED_GROUP,
	RE_QUOTED_TERM
} from './patterns';

function pushTerm(terms: VerbatimIntent[], expression: string): string {
	const i = terms.length;
	terms.push({ kind: 'verbatim', expression });
	return ` \x00${i}\x00 `;
}

export function extractQuotedTerms(input: string): { remainder: string; terms: VerbatimIntent[] } {
	const terms: VerbatimIntent[] = [];
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

export function restoreQuotedTerms(matches: IntentMatch[], terms: VerbatimIntent[]): IntentMatch[] {
	return matches.map((match) => {
		const { intent } = match;
		if (intent.kind === 'freeform') {
			const placeholder = RE_PLACEHOLDER.exec(intent.word);
			if (placeholder) return { ...match, intent: terms[Number(placeholder[1])] };
		}
		return match;
	});
}

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
			// non_ marks a negated word for recognizeIntents
			.replace(RE_NON_HYPHEN, 'non_$1')
			.replace(RE_NOT_WORD, 'non_$1')
	);
}

export function extractNumericIntents(normalized: string): {
	intents: (NumericIntent | AgendaRatioIntent | Connective)[];
	remainder: string;
} {
	const intents: (NumericIntent | AgendaRatioIntent | Connective)[] = [];
	const or: Connective = { kind: 'or' };

	const pushNumeric = (fieldPhrase: string, operator: ComparisonOperator, n: string) => {
		const field = findNumericField(fieldPhrase);
		if (field) intents.push({ kind: 'numeric', field, operator, value: parseInt(n, 10) });
	};
	const pushCompoundOr = (
		fieldPhrase: string,
		op1: ComparisonOperator,
		n1: string,
		op2: ComparisonOperator,
		n2: string
	) => {
		const field = findNumericField(fieldPhrase);
		if (!field) return;
		intents.push({ kind: 'numeric', field, operator: op1, value: parseInt(n1, 10) });
		intents.push(or);
		intents.push({ kind: 'numeric', field, operator: op2, value: parseInt(n2, 10) });
	};

	let remainder = normalized;

	// "5/3s" or "5/3"
	remainder = remainder.replace(RE_AGENDA_RATIO, (_, advancement, points) => {
		intents.push({
			kind: 'agenda_ratio',
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
		pushCompoundOr(field, '=', n1, '=', n2);
		return ' ';
	});

	// "0 cost", "3 strength"
	remainder = remainder.replace(RE_BARE_NUMBER_FIELD, (_, n, field) => {
		pushNumeric(field, '=', n);
		return ' ';
	});

	return { intents, remainder };
}

export function recognizeIntents(remainder: string): IntentMatch[] {
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

	const matches: IntentMatch[] = [];
	let i = 0;

	while (i < words.length) {
		const negated = negatedSet.has(i);
		const intents: IntentOrConnective[] = [];
		const consumed = matchAt(words, i, negated, intents);
		const phrase = words.slice(i, i + consumed).join(' ');
		matches.push(...intents.map((intent) => ({ intent, phrase })));
		i += consumed;
	}

	return matches;
}

// Matches the longest phrase at index i and returns words consumed.
function matchAt(
	words: string[],
	i: number,
	negated: boolean,
	intents: IntentOrConnective[]
): number {
	const maxLen = Math.min(getMaxPhraseWords(), words.length - i);

	for (let len = maxLen; len >= 1; len--) {
		const intent = intentForPhrase(words.slice(i, i + len).join(' '), negated);
		if (intent) {
			intents.push(intent);
			return len;
		}
	}

	const intent = intentForWord(words[i]);
	if (intent) intents.push(intent);
	return 1;
}

// The lookup order is text > boolean > faction > card type > subtype > set > cycle > side.
// Side phrases are single words and come last, so "corp identity" stays a card type.
function intentForPhrase(phrase: string, negated: boolean): Intent | undefined {
	const phrases = TEXT_MAP.get(phrase);
	if (phrases !== undefined) return { kind: 'text', phrases };

	const field = BOOLEAN_MAP.get(phrase);
	if (field !== undefined) return { kind: 'boolean', field, negated };

	const faction = FACTION_MAP.get(phrase);
	if (faction !== undefined) return { kind: 'faction', value: faction, negated };

	const cardType = CARD_TYPE_MAP.get(phrase);
	if (cardType !== undefined) return { kind: 'card_type', value: cardType, negated };

	const subtype = SUBTYPE_MAP.get(phrase);
	if (subtype !== undefined) return { kind: 'subtype', value: subtype, negated };

	const set = SET_MAP.get(phrase);
	if (set !== undefined) return { kind: 'set', value: set, negated };

	const cycle = CYCLE_MAP.get(phrase);
	if (cycle !== undefined) return { kind: 'cycle', value: cycle, negated };

	const side = SIDE_MAP.get(phrase);
	if (side !== undefined) return { kind: 'side', value: side, negated };

	return undefined;
}

function intentForWord(word: string): IntentOrConnective | null {
	if (word === 'or') return { kind: 'or' };
	// a bare number is one the numeric patterns found no field for
	if (/^\d+$/.test(word)) return null;
	return { kind: 'freeform', word };
}
