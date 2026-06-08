// id/name pairs for dynamic vocab, decoupled from any store/filter type.
export interface VocabOption {
	id: string;
	name: string;
}

export const FACTION_MAP: Record<string, string | string[]> = {
	shaper: 'shaper',
	anarch: 'anarch',
	criminal: 'criminal',
	crim: 'criminal',
	jinteki: 'jinteki',
	nbn: 'nbn',
	adam: 'adam',
	apex: 'apex',
	weyland: 'weyland_consortium',
	'weyland-consortium': 'weyland_consortium',
	'weyland consortium': 'weyland_consortium',
	haas: 'haas_bioroid',
	'haas-bioroid': 'haas_bioroid',
	'haas bioroid': 'haas_bioroid',
	hb: 'haas_bioroid',
	sunny: 'sunny_lebeau',
	'sunny lebeau': 'sunny_lebeau',
	'neutral corp': 'neutral_corp',
	'neutral runner': 'neutral_runner',
	neutral: ['neutral_corp', 'neutral_runner']
};

// Checked before SUBTYPE_MAP to resolve corp/runner ambiguity
export const SIDE_MAP: Record<string, string> = {
	runner: 'runner',
	corp: 'corp',
	corporation: 'corp'
};

export const CARD_TYPE_MAP: Record<string, string | string[]> = {
	'runner identity': 'runner_identity',
	'runner identities': 'runner_identity',
	'corp identity': 'corp_identity',
	'corp identities': 'corp_identity',
	event: 'event',
	events: 'event',
	hardware: 'hardware',
	program: 'program',
	programs: 'program',
	resource: 'resource',
	resources: 'resource',
	ice: 'ice',
	asset: 'asset',
	assets: 'asset',
	upgrade: 'upgrade',
	upgrades: 'upgrade',
	operation: 'operation',
	operations: 'operation',
	agenda: 'agenda',
	agendas: 'agenda',
	identity: ['corp_identity', 'runner_identity'],
	identities: ['corp_identity', 'runner_identity'],
	ids: ['corp_identity', 'runner_identity'],
	id: ['corp_identity', 'runner_identity']
};

// Populated at runtime by populateSubtypeMap; maps a typed phrase to its `s:` filter token.
export const SUBTYPE_MAP: Record<string, string> = {};

// Spelling variants not derivable from a canonical subtype name (typed phrase -> `s:` token).
const SUBTYPE_ALIASES: Record<string, string> = {
	'grey ops': '"gray ops"',
	caissa: 'caïssa'
};

// Negation flips onValue to (1 - onValue) in matchAt
export const BOOLEAN_MAP: Record<string, { field: string; onValue: 1 | 0 }> = {
	trash: { field: 'trash_ability', onValue: 1 },
	'trash abilities': { field: 'trash_ability', onValue: 1 },
	'performs trace': { field: 'performs_trace', onValue: 1 },
	'on encounter': { field: 'on_encounter_effect', onValue: 1 },
	'gains subroutines': { field: 'gains_subroutines', onValue: 1 },
	'gains subroutine': { field: 'gains_subroutines', onValue: 1 },
	'gain subroutines': { field: 'gains_subroutines', onValue: 1 },
	'additional cost': { field: 'additional_cost', onValue: 1 },
	unique: { field: 'u', onValue: 1 },
	trashable: { field: 'trash_ability', onValue: 1 },
	trace: { field: 'performs_trace', onValue: 1 },
	traces: { field: 'performs_trace', onValue: 1 },
	interrupt: { field: 'interrupt', onValue: 1 },
	interrupts: { field: 'interrupt', onValue: 1 },
	advanceable: { field: 'advanceable', onValue: 1 }
};

// Order is cosmetic; matchAt's length-descending scan determines priority.
export const SEMANTIC_ENTRIES: Array<{ phrase: string; tokens: string[] }> = [
	{ phrase: 'once per turn', tokens: ['x:"once per turn"'] },
	{ phrase: 'once-per-turn', tokens: ['x:"once per turn"'] },
	{ phrase: 'place advancement counters', tokens: ['x:"advancement counter"'] },
	{ phrase: 'place advancement counter', tokens: ['x:"advancement counter"'] },
	{ phrase: 'advancement counters', tokens: ['x:"advancement counter"'] },
	{ phrase: 'advancement counter', tokens: ['x:"advancement counter"'] },
	{ phrase: 'place advancement', tokens: ['x:"advancement counter"'] },
	{ phrase: 'end the run', tokens: ['x:"end the run"'] },
	{ phrase: 'bad publicity', tokens: ['x:"bad publicity"'] },
	{ phrase: 'bad pub', tokens: ['x:"bad publicity"'] },
	{ phrase: 'virus counters', tokens: ['x:"virus counter"'] },
	{ phrase: 'virus counter', tokens: ['x:"virus counter"'] },
	{ phrase: 'power counters', tokens: ['x:"power counter"'] },
	{ phrase: 'power counter', tokens: ['x:"power counter"'] },
	{ phrase: 'recurring credits', tokens: ['x:"recurring"'] },
	{ phrase: 'recurring credit', tokens: ['x:"recurring"'] },
	{ phrase: 'loses credits', tokens: ['x:"lose"', 'x:"credit"'] },
	{ phrase: 'lose credits', tokens: ['x:"lose"', 'x:"credit"'] },
	{ phrase: 'loses credit', tokens: ['x:"lose"', 'x:"credit"'] },
	{ phrase: 'lose credit', tokens: ['x:"lose"', 'x:"credit"'] },
	{ phrase: 'draw cards', tokens: ['x:"draw"'] },
	{ phrase: 'draw card', tokens: ['x:"draw"'] },
	{ phrase: 'gains credits', tokens: ['x:"gain"', 'x:"credit"'] },
	{ phrase: 'gain credits', tokens: ['x:"gain"', 'x:"credit"'] },
	{ phrase: 'gains credit', tokens: ['x:"gain"', 'x:"credit"'] },
	{ phrase: 'gain credit', tokens: ['x:"gain"', 'x:"credit"'] },
	{ phrase: 'gives tags', tokens: ['x:"tag"'] },
	{ phrase: 'gives tag', tokens: ['x:"tag"'] },
	{ phrase: 'give tags', tokens: ['x:"tag"'] },
	{ phrase: 'give tag', tokens: ['x:"tag"'] },
	{ phrase: 'tags', tokens: ['x:"tag"'] },
	{ phrase: 'tag', tokens: ['x:"tag"'] },
	{ phrase: 'draw', tokens: ['x:"draw"'] },
	{ phrase: 'draws', tokens: ['x:"draw"'] },
	{ phrase: 'net damage', tokens: ['x:"net damage"'] },
	{ phrase: 'meat damage', tokens: ['x:"meat damage"'] },
	{ phrase: 'core damage', tokens: ['x:"core damage"'] },
	{ phrase: 'damage', tokens: ['x:"damage"'] }
];

export const SEMANTIC_MAP = new Map<string, string[]>(
	SEMANTIC_ENTRIES.map((e) => [e.phrase, e.tokens])
);

// Populated at runtime by populateDynamicVocab.
export const SET_MAP: Record<string, string> = {};
export const CYCLE_MAP: Record<string, string> = {};

function computeMaxPhraseWords(): number {
	return Math.max(
		...[
			...Object.keys(FACTION_MAP),
			...Object.keys(CARD_TYPE_MAP),
			...Object.keys(SUBTYPE_MAP),
			...Object.keys(BOOLEAN_MAP),
			...Object.keys(SET_MAP),
			...Object.keys(CYCLE_MAP),
			...SEMANTIC_MAP.keys()
		].map((p) => p.split(/\s+/).length)
	);
}

// Recomputed by populateDynamicVocab once set/cycle/subtype names are loaded.
export let MAX_PHRASE_WORDS = computeMaxPhraseWords();

export function populateDynamicVocab(
	sets: VocabOption[],
	cycles: VocabOption[],
	subtypes: VocabOption[]
) {
	populateMap(SET_MAP, sets);
	populateMap(CYCLE_MAP, cycles);
	populateSubtypeMap(subtypes);
	MAX_PHRASE_WORDS = computeMaxPhraseWords();
}

function populateMap(target: Record<string, string>, options: VocabOption[]) {
	for (const key of Object.keys(target)) delete target[key];
	for (const { id, name } of options) {
		const lowerName = name.toLowerCase();
		target[lowerName] = id;
		const lowerIdSpaces = id.toLowerCase().replace(/_/g, ' ');
		if (lowerIdSpaces !== lowerName) target[lowerIdSpaces] = id;
	}
}

// Excluded so matchAt (which checks subtypes before sides) doesn't shadow the side intent.
const SUBTYPE_EXCLUSIONS = new Set(Object.keys(SIDE_MAP));

function subtypeToken(lowerName: string): string {
	return /[\s-]/.test(lowerName) ? `"${lowerName}"` : lowerName;
}

// Plural of the last word, or null when it is already plural.
function pluralizeLast(phrase: string): string | null {
	const words = phrase.split(' ');
	const last = words[words.length - 1];
	if (last.endsWith('s')) return null;
	let plural: string;
	if (/[^aeiou]y$/.test(last)) {
		plural = `${last.slice(0, -1)}ies`;
	} else if (/(x|z|ch|sh)$/.test(last)) {
		plural = `${last}es`;
	} else {
		plural = `${last}s`;
	}
	words[words.length - 1] = plural;
	return words.join(' ');
}

// Registers each subtype name plus its plural and (for hyphenated names) a space variant; aliases last.
export function populateSubtypeMap(subtypes: VocabOption[]) {
	for (const key of Object.keys(SUBTYPE_MAP)) delete SUBTYPE_MAP[key];

	for (const { name } of subtypes) {
		const base = name.toLowerCase();
		if (SUBTYPE_EXCLUSIONS.has(base)) continue;

		const token = subtypeToken(base);
		const keys = new Set<string>([base]);
		if (base.includes('-')) keys.add(base.replace(/-/g, ' '));
		for (const key of [...keys]) {
			const plural = pluralizeLast(key);
			if (plural) keys.add(plural);
		}
		for (const key of keys) SUBTYPE_MAP[key] = token;
	}

	for (const [phrase, token] of Object.entries(SUBTYPE_ALIASES)) {
		SUBTYPE_MAP[phrase] = token;
	}
}

// Order is cosmetic; buildNumericFieldPattern sorts by word count descending.
export const NUMERIC_FIELDS: Array<{ words: string; field: string }> = [
	{ words: 'advancement requirement', field: 'g' },
	{ words: 'advancement cost', field: 'g' },
	{ words: 'agenda points', field: 'v' },
	{ words: 'agenda point', field: 'v' },
	{ words: 'points', field: 'v' },
	{ words: 'point', field: 'v' },
	{ words: 'influence cost', field: 'n' },
	{ words: 'memory cost', field: 'm' },
	{ words: 'base link', field: 'l' },
	{ words: 'trash cost', field: 'h' },
	{ words: 'rez cost', field: 'o' },
	{ words: 'play cost', field: 'o' },
	{ words: 'install cost', field: 'o' },
	{ words: 'cost', field: 'o' },
	{ words: 'strength', field: 'p' },
	{ words: 'str', field: 'p' },
	{ words: 'mu', field: 'm' },
	{ words: 'memory', field: 'm' },
	{ words: 'influence', field: 'n' },
	{ words: 'inf', field: 'n' },
	{ words: 'advancement', field: 'g' },
	{ words: 'adv', field: 'g' },
	{ words: 'link', field: 'l' },
	{ words: 'trash', field: 'h' },
	{ words: 'printed subroutines', field: 'num_printed_subroutines' },
	{ words: 'printed subroutine', field: 'num_printed_subroutines' },
	{ words: 'subroutines', field: 'num_printed_subroutines' },
	{ words: 'subroutine', field: 'num_printed_subroutines' },
	{ words: 'subs', field: 'num_printed_subroutines' },
	{ words: 'sub', field: 'num_printed_subroutines' }
];

const WORD_TO_FIELD = new Map(NUMERIC_FIELDS.map((f) => [f.words, f.field]));

export function wordToField(word: string): string | undefined {
	return WORD_TO_FIELD.get(word.trim().toLowerCase().replace(/\s+/g, ' '));
}

export function buildNumericFieldPattern(): string {
	return [...NUMERIC_FIELDS]
		.sort((a, b) => b.words.split(/\s+/).length - a.words.split(/\s+/).length)
		.map((f) => f.words.replace(/[-]/g, '\\-').replace(/\s+/g, '\\s+'))
		.join('|');
}
