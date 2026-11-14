import { describe, it, expect, beforeAll } from 'vitest';
import {
	SUBTYPE_MAP,
	NUMERIC_FIELD_MAP,
	findNumericField,
	buildNumericFieldPattern,
	populateSubtypeMap
} from './vocabulary';
import { SUBTYPE_FIXTURE } from './subtypes.fixture';

beforeAll(() => populateSubtypeMap(SUBTYPE_FIXTURE));

describe('findNumericField', () => {
	it('normalizes whitespace and case', () => {
		expect(findNumericField('  STRENGTH  ')).toBe('strength');
		expect(findNumericField('Rez Cost')).toBe('cost');
	});

	it('returns undefined for unknown phrases', () => {
		expect(findNumericField('foobar')).toBeUndefined();
		expect(findNumericField('')).toBeUndefined();
		expect(findNumericField('damage')).toBeUndefined();
	});
});

describe('buildNumericFieldPattern', () => {
	it('places multi-word entries before single-word entries in the alternation', () => {
		const pattern = buildNumericFieldPattern();
		const advancementReqIdx = pattern.indexOf('advancement\\s+requirement');
		const advancementIdx = pattern.lastIndexOf('advancement');
		expect(advancementReqIdx).toBeLessThan(advancementIdx);
	});

	it('covers all NUMERIC_FIELD_MAP phrases', () => {
		const pattern = buildNumericFieldPattern();
		const re = new RegExp(`^(${pattern})$`, 'i');
		for (const phrase of NUMERIC_FIELD_MAP.keys()) {
			expect(re.test(phrase)).toBe(true);
		}
	});
});

describe('SUBTYPE_MAP', () => {
	it('maps multi-word subtypes to their name', () => {
		expect(SUBTYPE_MAP.get('code gate')).toBe('code gate');
		expect(SUBTYPE_MAP.get('code gates')).toBe('code gate');
		expect(SUBTYPE_MAP.get('security protocol')).toBe('security protocol');
	});

	it('maps hyphenated variants', () => {
		expect(SUBTYPE_MAP.get('consumer-grade')).toBe('consumer-grade');
		expect(SUBTYPE_MAP.get('consumer grade')).toBe('consumer-grade');
	});

	it('maps grey/gray ops variants to the same value', () => {
		expect(SUBTYPE_MAP.get('grey ops')).toBe('gray ops');
		expect(SUBTYPE_MAP.get('gray ops')).toBe('gray ops');
	});

	it('maps plural forms to the singular name', () => {
		expect(SUBTYPE_MAP.get('barriers')).toBe('barrier');
		expect(SUBTYPE_MAP.get('consoles')).toBe('console');
		expect(SUBTYPE_MAP.get('icebreakers')).toBe('icebreaker');
	});

	it('excludes subtype names that collide with side keywords', () => {
		expect(SUBTYPE_MAP.get('corp')).toBeUndefined();
		expect(SUBTYPE_MAP.get('corporation')).toBeUndefined();
	});
});
