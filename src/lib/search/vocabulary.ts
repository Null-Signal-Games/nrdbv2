import type { CardTypeIds, FactionIds } from '$lib/types';
import type { BooleanField, ComparisonOperator, NumericField } from './intents';

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

// Populated at runtime by populateSubtypeMap; maps a phrase to the subtype's lowercased name.
export const SUBTYPE_MAP = new Map<string, string>();

// Spelling variants not derivable from a canonical subtype name.
const SUBTYPE_ALIASES = phraseMap<string>({
	'grey ops': 'gray ops',
	caissa: 'caïssa'
});

export const BOOLEAN_MAP = phraseMap<BooleanField>({
	trash: 'trash_ability',
	'trash abilities': 'trash_ability',
	'performs trace': 'performs_trace',
	'on encounter': 'on_encounter_effect',
	'gains subroutines': 'gains_subroutines',
	'gains subroutine': 'gains_subroutines',
	'gain subroutines': 'gains_subroutines',
	'additional cost': 'additional_cost',
	unique: 'is_unique',
	trashable: 'trash_ability',
	trace: 'performs_trace',
	traces: 'performs_trace',
	interrupt: 'interrupt',
	interrupts: 'interrupt',
	advanceable: 'advanceable'
});

// Maps a phrase to the phrases a card's text must contain.
export const TEXT_MAP = phraseMap<string[]>({
	'once per turn': ['once per turn'],
	'once-per-turn': ['once per turn'],
	'place advancement counters': ['advancement counter'],
	'place advancement counter': ['advancement counter'],
	'advancement counters': ['advancement counter'],
	'advancement counter': ['advancement counter'],
	'place advancement': ['advancement counter'],
	'end the run': ['end the run'],
	'bad publicity': ['bad publicity'],
	'bad pub': ['bad publicity'],
	'virus counters': ['virus counter'],
	'virus counter': ['virus counter'],
	'power counters': ['power counter'],
	'power counter': ['power counter'],
	'recurring credits': ['recurring'],
	'recurring credit': ['recurring'],
	'loses credits': ['lose', 'credit'],
	'lose credits': ['lose', 'credit'],
	'loses credit': ['lose', 'credit'],
	'lose credit': ['lose', 'credit'],
	'draw cards': ['draw'],
	'draw card': ['draw'],
	'gains credits': ['gain', 'credit'],
	'gain credits': ['gain', 'credit'],
	'gains credit': ['gain', 'credit'],
	'gain credit': ['gain', 'credit'],
	'gives tags': ['tag'],
	'gives tag': ['tag'],
	'give tags': ['tag'],
	'give tag': ['tag'],
	tags: ['tag'],
	tag: ['tag'],
	draw: ['draw'],
	draws: ['draw'],
	'net damage': ['net damage'],
	'meat damage': ['meat damage'],
	'core damage': ['core damage'],
	damage: ['damage']
});

// Populated at runtime by populateDynamicVocab.
export const SET_MAP = new Map<string, string>();
export const CYCLE_MAP = new Map<string, string>();

export function maxWordsIn(...maps: Map<string, unknown>[]): number {
	const phrases = maps.flatMap((map) => [...map.keys()]);
	return Math.max(...phrases.map((phrase) => phrase.split(/\s+/).length));
}

// The maps recognizeIntents looks phrases up in. Numeric field phrases are matched
// separately, and side phrases are single words.
const PHRASE_MAPS: Map<string, unknown>[] = [
	FACTION_MAP,
	CARD_TYPE_MAP,
	SUBTYPE_MAP,
	BOOLEAN_MAP,
	SET_MAP,
	CYCLE_MAP,
	TEXT_MAP
];

// Cleared whenever a dynamic map is repopulated.
let maxPhraseWords: number | null = null;

export function getMaxPhraseWords(): number {
	maxPhraseWords ??= maxWordsIn(...PHRASE_MAPS);
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

		const keys = new Set<string>([base]);
		if (base.includes('-')) keys.add(base.replace(/-/g, ' '));
		for (const key of [...keys]) {
			const plural = pluralizeLast(key);
			if (plural) keys.add(plural);
		}
		for (const key of keys) SUBTYPE_MAP.set(key, base);
	}

	for (const [phrase, subtype] of SUBTYPE_ALIASES) SUBTYPE_MAP.set(phrase, subtype);
	maxPhraseWords = null;
}

export const NUMERIC_FIELD_MAP = phraseMap<NumericField>({
	'advancement requirement': 'advancement_cost',
	'advancement cost': 'advancement_cost',
	'agenda points': 'agenda_points',
	'agenda point': 'agenda_points',
	points: 'agenda_points',
	point: 'agenda_points',
	'influence cost': 'influence_cost',
	'memory cost': 'memory_usage',
	'base link': 'base_link',
	'trash cost': 'trash_cost',
	'rez cost': 'cost',
	'play cost': 'cost',
	'install cost': 'cost',
	cost: 'cost',
	strength: 'strength',
	str: 'strength',
	mu: 'memory_usage',
	memory: 'memory_usage',
	influence: 'influence_cost',
	inf: 'influence_cost',
	advancement: 'advancement_cost',
	adv: 'advancement_cost',
	link: 'base_link',
	trash: 'trash_cost',
	'printed subroutines': 'num_printed_subroutines',
	'printed subroutine': 'num_printed_subroutines',
	subroutines: 'num_printed_subroutines',
	subroutine: 'num_printed_subroutines',
	subs: 'num_printed_subroutines',
	sub: 'num_printed_subroutines'
});

export function findNumericField(phrase: string): NumericField | undefined {
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

export const COMPARISON_PREFIX_MAP = phraseMap<ComparisonOperator>({
	'greater than or equal to': '>=',
	'less than or equal to': '<=',
	'at least': '>=',
	'at most': '<=',
	'greater than': '>',
	'more than': '>',
	'less than': '<',
	'fewer than': '<'
});

export const COMPARISON_SUFFIX_MAP = phraseMap<ComparisonOperator>({
	'or more': '>=',
	'or fewer': '<=',
	'or less': '<='
});
