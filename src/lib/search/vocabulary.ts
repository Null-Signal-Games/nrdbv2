import type { CardTypeIds, FactionIds } from '$lib/types';

// id/name pairs for dynamic vocab, decoupled from any store/filter type.
export interface VocabOption {
	id: string;
	name: string;
}

function phraseMap<V>(entries: Record<string, V>): Map<string, V> {
	return new Map(Object.entries(entries));
}

export const FACTION_MAP = phraseMap<FactionIds | FactionIds[]>({
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
});

// Checked after every other map, and only for single words. Subtypes named like a side
// are left out of SUBTYPE_MAP (see SUBTYPE_EXCLUSIONS) so these words always mean the side.
export const SIDE_MAP = phraseMap<string>({
	runner: 'runner',
	corp: 'corp',
	corporation: 'corp'
});

export const CARD_TYPE_MAP = phraseMap<CardTypeIds | CardTypeIds[]>({
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
});

// Populated at runtime by populateSubtypeMap; maps a typed phrase to its `s:` filter token.
export const SUBTYPE_MAP = new Map<string, string>();

// Spelling variants not derivable from a canonical subtype name (typed phrase -> `s:` token).
const SUBTYPE_ALIASES = phraseMap<string>({
	'grey ops': '"gray ops"',
	caissa: 'caïssa'
});

// Negation flips onValue to (1 - onValue) in matchAt
export const BOOLEAN_MAP = phraseMap<{ field: string; onValue: 1 | 0 }>({
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
});

// Maps a phrase to the card text search tokens it stands for.
export const SEMANTIC_MAP = phraseMap<string[]>({
	'once per turn': ['x:"once per turn"'],
	'once-per-turn': ['x:"once per turn"'],
	'place advancement counters': ['x:"advancement counter"'],
	'place advancement counter': ['x:"advancement counter"'],
	'advancement counters': ['x:"advancement counter"'],
	'advancement counter': ['x:"advancement counter"'],
	'place advancement': ['x:"advancement counter"'],
	'end the run': ['x:"end the run"'],
	'bad publicity': ['x:"bad publicity"'],
	'bad pub': ['x:"bad publicity"'],
	'virus counters': ['x:"virus counter"'],
	'virus counter': ['x:"virus counter"'],
	'power counters': ['x:"power counter"'],
	'power counter': ['x:"power counter"'],
	'recurring credits': ['x:"recurring"'],
	'recurring credit': ['x:"recurring"'],
	'loses credits': ['x:"lose"', 'x:"credit"'],
	'lose credits': ['x:"lose"', 'x:"credit"'],
	'loses credit': ['x:"lose"', 'x:"credit"'],
	'lose credit': ['x:"lose"', 'x:"credit"'],
	'draw cards': ['x:"draw"'],
	'draw card': ['x:"draw"'],
	'gains credits': ['x:"gain"', 'x:"credit"'],
	'gain credits': ['x:"gain"', 'x:"credit"'],
	'gains credit': ['x:"gain"', 'x:"credit"'],
	'gain credit': ['x:"gain"', 'x:"credit"'],
	'gives tags': ['x:"tag"'],
	'gives tag': ['x:"tag"'],
	'give tags': ['x:"tag"'],
	'give tag': ['x:"tag"'],
	tags: ['x:"tag"'],
	tag: ['x:"tag"'],
	draw: ['x:"draw"'],
	draws: ['x:"draw"'],
	'net damage': ['x:"net damage"'],
	'meat damage': ['x:"meat damage"'],
	'core damage': ['x:"core damage"'],
	damage: ['x:"damage"']
});

// Populated at runtime by populateDynamicVocab.
export const SET_MAP = new Map<string, string>();
export const CYCLE_MAP = new Map<string, string>();

// The maps recognizeIntents looks phrases up in. Numeric field phrases are matched
// separately, and side phrases are single words.
const PHRASE_MAPS: Map<string, unknown>[] = [
	FACTION_MAP,
	CARD_TYPE_MAP,
	SUBTYPE_MAP,
	BOOLEAN_MAP,
	SET_MAP,
	CYCLE_MAP,
	SEMANTIC_MAP
];

// Cleared whenever a dynamic map is repopulated.
let maxPhraseWords: number | null = null;

export function getMaxPhraseWords(): number {
	if (maxPhraseWords === null) {
		const phrases = PHRASE_MAPS.flatMap((map) => [...map.keys()]);
		maxPhraseWords = Math.max(...phrases.map((phrase) => phrase.split(/\s+/).length));
	}
	return maxPhraseWords;
}

export function populateDynamicVocab(
	sets: VocabOption[],
	cycles: VocabOption[],
	subtypes: VocabOption[]
) {
	populateMap(SET_MAP, sets);
	populateMap(CYCLE_MAP, cycles);
	populateSubtypeMap(subtypes);
}

function populateMap(target: Map<string, string>, options: VocabOption[]) {
	target.clear();
	for (const { id, name } of options) {
		target.set(name.toLowerCase(), id);
		target.set(id.toLowerCase().replace(/_/g, ' '), id);
	}
	maxPhraseWords = null;
}

// Excluded so matchAt (which checks subtypes before sides) doesn't shadow the side intent.
const SUBTYPE_EXCLUSIONS = new Set(SIDE_MAP.keys());

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
	SUBTYPE_MAP.clear();

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
		for (const key of keys) SUBTYPE_MAP.set(key, token);
	}

	for (const [phrase, token] of SUBTYPE_ALIASES) SUBTYPE_MAP.set(phrase, token);
	maxPhraseWords = null;
}

export const NUMERIC_FIELD_MAP = phraseMap<string>({
	'advancement requirement': 'g',
	'advancement cost': 'g',
	'agenda points': 'v',
	'agenda point': 'v',
	points: 'v',
	point: 'v',
	'influence cost': 'n',
	'memory cost': 'm',
	'base link': 'l',
	'trash cost': 'h',
	'rez cost': 'o',
	'play cost': 'o',
	'install cost': 'o',
	cost: 'o',
	strength: 'p',
	str: 'p',
	mu: 'm',
	memory: 'm',
	influence: 'n',
	inf: 'n',
	advancement: 'g',
	adv: 'g',
	link: 'l',
	trash: 'h',
	'printed subroutines': 'num_printed_subroutines',
	'printed subroutine': 'num_printed_subroutines',
	subroutines: 'num_printed_subroutines',
	subroutine: 'num_printed_subroutines',
	subs: 'num_printed_subroutines',
	sub: 'num_printed_subroutines'
});

export function findNumericField(phrase: string): string | undefined {
	return NUMERIC_FIELD_MAP.get(phrase.trim().toLowerCase().replace(/\s+/g, ' '));
}

// Every numeric field phrase joined with `|` for the numeric regexes. Longer phrases go
// first so "advancement cost" isn't matched as just "advancement".
export function buildNumericFieldPattern(): string {
	return [...NUMERIC_FIELD_MAP.keys()]
		.sort((a, b) => b.split(/\s+/).length - a.split(/\s+/).length)
		.map((phrase) => phrase.replace(/[-]/g, '\\-').replace(/\s+/g, '\\s+'))
		.join('|');
}
