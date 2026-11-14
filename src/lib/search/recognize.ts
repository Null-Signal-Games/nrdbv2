import type {
	AgendaRatioIntent,
	IntentMatch,
	IntentOrConnective,
	NumericIntent,
	Connective,
	SemanticIntent
} from './intents';
import {
	FACTION_MAP,
	SIDE_MAP,
	CARD_TYPE_MAP,
	SUBTYPE_MAP,
	SET_MAP,
	CYCLE_MAP,
	BOOLEAN_MAP,
	SEMANTIC_MAP,
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

function pushTerm(terms: SemanticIntent[], token: string): string {
	const i = terms.length;
	terms.push({ kind: 'semantic', tokens: [token] });
	return ` \x00${i}\x00 `;
}

export function extractQuotedTerms(input: string): { remainder: string; terms: SemanticIntent[] } {
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

export function restoreQuotedTerms(matches: IntentMatch[], terms: SemanticIntent[]): IntentMatch[] {
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

	const pushNumeric = (fieldPhrase: string, operator: string, n: string) => {
		const field = findNumericField(fieldPhrase);
		if (field) intents.push({ kind: 'numeric', field, operator, value: parseInt(n, 10) });
	};
	const pushCompoundOr = (
		fieldPhrase: string,
		op1: string,
		n1: string,
		op2: string,
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

// Matches the longest phrase at index i and returns words consumed. At each length the
// lookup order is semantic > boolean > faction > card type > subtype > set > cycle > side.
// Side comes last and only matches single words, so "corp identity" stays a card type.
function matchAt(
	words: string[],
	i: number,
	negated: boolean,
	intents: IntentOrConnective[]
): number {
	const maxLen = Math.min(getMaxPhraseWords(), words.length - i);

	for (let len = maxLen; len >= 1; len--) {
		const phrase = words.slice(i, i + len).join(' ');

		const sem = SEMANTIC_MAP.get(phrase);
		if (sem) {
			intents.push({ kind: 'semantic', tokens: sem });
			return len;
		}

		const boolean = BOOLEAN_MAP.get(phrase);
		if (boolean) {
			const value: 0 | 1 = negated ? ((1 - boolean.onValue) as 0 | 1) : boolean.onValue;
			intents.push({ kind: 'boolean', field: boolean.field, value });
			return len;
		}

		const faction = FACTION_MAP.get(phrase);
		if (faction) {
			intents.push({ kind: 'faction', value: faction, negated });
			return len;
		}

		const cardType = CARD_TYPE_MAP.get(phrase);
		if (cardType) {
			intents.push({ kind: 'card_type', value: cardType, negated });
			return len;
		}

		const subtype = SUBTYPE_MAP.get(phrase);
		if (subtype) {
			intents.push({ kind: 'subtype', value: subtype, negated });
			return len;
		}

		const set = SET_MAP.get(phrase);
		if (set) {
			intents.push({ kind: 'set', value: set, negated });
			return len;
		}

		const cycle = CYCLE_MAP.get(phrase);
		if (cycle) {
			intents.push({ kind: 'cycle', value: cycle, negated });
			return len;
		}

		const side = len === 1 ? SIDE_MAP.get(phrase) : undefined;
		if (side) {
			intents.push({ kind: 'side', value: side, negated });
			return 1;
		}
	}

	const word = words[i];
	if (word === 'or') {
		intents.push({ kind: 'or' });
		return 1;
	}
	// bare digits are leftovers from the numeric pre-pass
	if (/^\d+$/.test(word)) return 1;

	intents.push({ kind: 'freeform', word });
	return 1;
}
