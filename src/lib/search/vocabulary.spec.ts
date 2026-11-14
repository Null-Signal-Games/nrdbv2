import { describe, it, expect, beforeAll } from 'vitest';
import {
	FACTION_MAP,
	SIDE_MAP,
	CARD_TYPE_MAP,
	SUBTYPE_MAP,
	BOOLEAN_MAP,
	SEMANTIC_ENTRIES,
	SEMANTIC_MAP,
	MAX_PHRASE_WORDS,
	NUMERIC_FIELDS,
	wordToField,
	buildNumericFieldPattern,
	populateSubtypeMap
} from './vocabulary';
import { SUBTYPE_FIXTURE } from './subtypes.fixture';

beforeAll(() => populateSubtypeMap(SUBTYPE_FIXTURE));

describe('wordToField', () => {
	it('maps single-word aliases', () => {
		expect(wordToField('str')).toBe('p');
		expect(wordToField('mu')).toBe('m');
		expect(wordToField('inf')).toBe('n');
		expect(wordToField('link')).toBe('l');
		expect(wordToField('trash')).toBe('h');
		expect(wordToField('strength')).toBe('p');
		expect(wordToField('cost')).toBe('o');
	});

	it('maps multi-word fields', () => {
		expect(wordToField('advancement requirement')).toBe('g');
		expect(wordToField('advancement cost')).toBe('g');
		expect(wordToField('agenda points')).toBe('v');
		expect(wordToField('influence cost')).toBe('n');
		expect(wordToField('memory cost')).toBe('m');
		expect(wordToField('base link')).toBe('l');
		expect(wordToField('trash cost')).toBe('h');
		expect(wordToField('rez cost')).toBe('o');
		expect(wordToField('play cost')).toBe('o');
		expect(wordToField('install cost')).toBe('o');
	});

	it('normalizes whitespace and case', () => {
		expect(wordToField('  STRENGTH  ')).toBe('p');
		expect(wordToField('Rez Cost')).toBe('o');
	});

	it('returns undefined for unknown words', () => {
		expect(wordToField('foobar')).toBeUndefined();
		expect(wordToField('')).toBeUndefined();
		expect(wordToField('damage')).toBeUndefined();
	});
});

describe('buildNumericFieldPattern', () => {
	it('returns a non-empty string', () => {
		const pattern = buildNumericFieldPattern();
		expect(typeof pattern).toBe('string');
		expect(pattern.length).toBeGreaterThan(0);
	});

	it('places multi-word entries before single-word entries in the alternation', () => {
		const pattern = buildNumericFieldPattern();
		const advancementReqIdx = pattern.indexOf('advancement\\s+requirement');
		const advancementIdx = pattern.lastIndexOf('advancement');
		expect(advancementReqIdx).toBeLessThan(advancementIdx);
	});

	it('covers all NUMERIC_FIELDS entries', () => {
		const pattern = buildNumericFieldPattern();
		const re = new RegExp(`^(${pattern})$`, 'i');
		for (const { words } of NUMERIC_FIELDS) {
			expect(re.test(words)).toBe(true);
		}
	});
});

describe('MAX_PHRASE_WORDS', () => {
	it('is at least 3 (covers current longest phrases like "place advancement counters")', () => {
		expect(MAX_PHRASE_WORDS).toBeGreaterThanOrEqual(3);
	});

	it('equals the actual maximum phrase length across all maps', () => {
		const allPhrases = [
			...Object.keys(FACTION_MAP),
			...Object.keys(CARD_TYPE_MAP),
			...Object.keys(SUBTYPE_MAP),
			...Object.keys(BOOLEAN_MAP),
			...SEMANTIC_MAP.keys()
		];
		const expected = Math.max(...allPhrases.map((p) => p.split(/\s+/).length));
		expect(MAX_PHRASE_WORDS).toBe(expected);
	});
});

describe('FACTION_MAP', () => {
	it('maps common aliases', () => {
		expect(FACTION_MAP['hb']).toBe('haas_bioroid');
		expect(FACTION_MAP['crim']).toBe('criminal');
		expect(FACTION_MAP['weyland']).toBe('weyland_consortium');
		expect(FACTION_MAP['haas bioroid']).toBe('haas_bioroid');
	});

	it('maps neutral to an array of both neutral factions', () => {
		expect(FACTION_MAP['neutral']).toEqual(['neutral_corp', 'neutral_runner']);
	});

	it('maps neutral corp and neutral runner individually', () => {
		expect(FACTION_MAP['neutral corp']).toBe('neutral_corp');
		expect(FACTION_MAP['neutral runner']).toBe('neutral_runner');
	});
});

describe('SIDE_MAP', () => {
	it('maps corp and runner', () => {
		expect(SIDE_MAP['corp']).toBe('corp');
		expect(SIDE_MAP['runner']).toBe('runner');
		expect(SIDE_MAP['corporation']).toBe('corp');
	});
});

describe('CARD_TYPE_MAP', () => {
	it('maps multi-word runner identity entries', () => {
		expect(CARD_TYPE_MAP['runner identity']).toBe('runner_identity');
		expect(CARD_TYPE_MAP['runner identities']).toBe('runner_identity');
		expect(CARD_TYPE_MAP['corp identity']).toBe('corp_identity');
	});

	it('maps identity/ids to both corp and runner identity', () => {
		expect(CARD_TYPE_MAP['identity']).toEqual(['corp_identity', 'runner_identity']);
		expect(CARD_TYPE_MAP['ids']).toEqual(['corp_identity', 'runner_identity']);
		expect(CARD_TYPE_MAP['id']).toEqual(['corp_identity', 'runner_identity']);
	});
});

describe('SUBTYPE_MAP', () => {
	it('maps multi-word subtypes with embedded quotes', () => {
		expect(SUBTYPE_MAP['code gate']).toBe('"code gate"');
		expect(SUBTYPE_MAP['code gates']).toBe('"code gate"');
		expect(SUBTYPE_MAP['security protocol']).toBe('"security protocol"');
	});

	it('maps hyphenated variants', () => {
		expect(SUBTYPE_MAP['consumer-grade']).toBe('"consumer-grade"');
		expect(SUBTYPE_MAP['consumer grade']).toBe('"consumer-grade"');
	});

	it('maps grey/gray ops variants to the same value', () => {
		expect(SUBTYPE_MAP['grey ops']).toBe('"gray ops"');
		expect(SUBTYPE_MAP['gray ops']).toBe('"gray ops"');
	});

	it('maps plural forms to singular filter values', () => {
		expect(SUBTYPE_MAP['barriers']).toBe('barrier');
		expect(SUBTYPE_MAP['consoles']).toBe('console');
		expect(SUBTYPE_MAP['icebreakers']).toBe('icebreaker');
	});

	it('excludes subtype names that collide with side keywords', () => {
		expect(SUBTYPE_MAP['corp']).toBeUndefined();
		expect(SUBTYPE_MAP['corporation']).toBeUndefined();
	});
});

describe('BOOLEAN_MAP', () => {
	it('maps unique to u:1', () => {
		expect(BOOLEAN_MAP['unique']).toEqual({ field: 'u', onValue: 1 });
	});

	it('maps multi-word boolean phrases', () => {
		expect(BOOLEAN_MAP['additional cost']).toEqual({
			field: 'additional_cost',
			onValue: 1
		});
		expect(BOOLEAN_MAP['trash abilities']).toEqual({
			field: 'trash_ability',
			onValue: 1
		});
		expect(BOOLEAN_MAP['performs trace']).toEqual({
			field: 'performs_trace',
			onValue: 1
		});
		expect(BOOLEAN_MAP['gains subroutines']).toEqual({
			field: 'gains_subroutines',
			onValue: 1
		});
	});

	it('maps aliases for the same field', () => {
		expect(BOOLEAN_MAP['trash'].field).toBe(BOOLEAN_MAP['trashable'].field);
		expect(BOOLEAN_MAP['trace'].field).toBe(BOOLEAN_MAP['performs trace'].field);
	});
});

describe('SEMANTIC_MAP', () => {
	it('maps bad pub and bad publicity to the same tokens', () => {
		expect(SEMANTIC_MAP.get('bad pub')).toEqual(SEMANTIC_MAP.get('bad publicity'));
		expect(SEMANTIC_MAP.get('bad pub')).toEqual(['x:"bad publicity"']);
	});

	it('maps once per turn variants to the same tokens', () => {
		expect(SEMANTIC_MAP.get('once per turn')).toEqual(SEMANTIC_MAP.get('once-per-turn'));
		expect(SEMANTIC_MAP.get('once per turn')).toEqual(['x:"once per turn"']);
	});

	it('maps gain/lose credit variants consistently', () => {
		const expected = ['x:"gain"', 'x:"credit"'];
		expect(SEMANTIC_MAP.get('gain credits')).toEqual(expected);
		expect(SEMANTIC_MAP.get('gains credits')).toEqual(expected);
		expect(SEMANTIC_MAP.get('gain credit')).toEqual(expected);
	});

	it('maps tag-related phrases to x:"tag"', () => {
		expect(SEMANTIC_MAP.get('tag')).toEqual(['x:"tag"']);
		expect(SEMANTIC_MAP.get('tags')).toEqual(['x:"tag"']);
		expect(SEMANTIC_MAP.get('gives tags')).toEqual(['x:"tag"']);
	});
});

describe('SEMANTIC_ENTRIES ordering', () => {
	it('places longer phrases before shorter overlapping ones', () => {
		const phrases = SEMANTIC_ENTRIES.map((e) => e.phrase);
		const placeAdvCounters = phrases.indexOf('place advancement counters');
		const placeAdv = phrases.indexOf('place advancement');
		expect(placeAdvCounters).toBeLessThan(placeAdv);

		const virusCounters = phrases.indexOf('virus counters');
		const virusCounter = phrases.indexOf('virus counter');
		expect(virusCounters).toBeLessThan(virusCounter);
	});
});
