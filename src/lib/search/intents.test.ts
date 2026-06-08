import { describe, it, expect, beforeAll } from 'vitest';
import {
	normalizeInput,
	extractNumericIntents,
	recognizeIntents,
	assembleOutput,
	type NumericIntent,
	type AgendaRatioIntent,
	type FactionIntent,
	type TypeIntent,
	type Intent
} from './intents';
import { populateSubtypeMap } from './vocabulary';
import { SUBTYPE_FIXTURE } from './subtypes.fixture';

beforeAll(() => populateSubtypeMap(SUBTYPE_FIXTURE));

// ===== Phase 1: normalizeInput =====

describe('normalizeInput', () => {
	it('lowercases and trims input', () => {
		expect(normalizeInput('  SHAPER  ')).toBe('shaper');
	});

	it('replaces "greater than or equal to" with >=', () => {
		expect(normalizeInput('strength greater than or equal to 3')).toBe('strength >= 3');
	});

	it('replaces "less than or equal to" with <=', () => {
		expect(normalizeInput('cost less than or equal to 2')).toBe('cost <= 2');
	});

	it('replaces "at least" with >=', () => {
		expect(normalizeInput('at least 4 strength')).toBe('>= 4 strength');
	});

	it('replaces "at most" with <=', () => {
		expect(normalizeInput('at most 2 cost')).toBe('<= 2 cost');
	});

	it('replaces "greater than" with >', () => {
		expect(normalizeInput('strength greater than 5')).toBe('strength > 5');
	});

	it('replaces "more than" with >', () => {
		expect(normalizeInput('more than 3 influence')).toBe('> 3 influence');
	});

	it('replaces "less than" with <', () => {
		expect(normalizeInput('less than 2 cost')).toBe('< 2 cost');
	});

	it('replaces "fewer than" with <', () => {
		expect(normalizeInput('fewer than 3 strength')).toBe('< 3 strength');
	});

	it('converts "N or more" to >=N', () => {
		expect(normalizeInput('2 or more strength')).toBe('>=2 strength');
	});

	it('converts "N or fewer" to <=N', () => {
		expect(normalizeInput('3 or fewer cost')).toBe('<=3 cost');
	});

	it('converts "N or less" to <=N', () => {
		expect(normalizeInput('3 or less cost')).toBe('<=3 cost');
	});

	it('converts "non-X" to "non_X" sentinel', () => {
		expect(normalizeInput('non-shaper')).toBe('non_shaper');
		expect(normalizeInput('non-unique')).toBe('non_unique');
	});

	it('converts "not X" to "non_X" sentinel', () => {
		expect(normalizeInput('not shaper')).toBe('non_shaper');
	});

	it('is idempotent on already-normalized input', () => {
		const input = 'f:shaper t:hardware';
		expect(normalizeInput(input)).toBe(input);
	});

	it('is idempotent on >= output', () => {
		expect(normalizeInput('strength >= 3')).toBe('strength >= 3');
	});

	it('is idempotent on <= output', () => {
		expect(normalizeInput('cost <= 2')).toBe('cost <= 2');
	});

	it('is idempotent on > output', () => {
		expect(normalizeInput('strength > 5')).toBe('strength > 5');
	});

	it('is idempotent on < output', () => {
		expect(normalizeInput('cost < 2')).toBe('cost < 2');
	});

	it('is idempotent on >=N output', () => {
		expect(normalizeInput('>=2 strength')).toBe('>=2 strength');
	});

	it('is idempotent on <=N output', () => {
		expect(normalizeInput('<=3 cost')).toBe('<=3 cost');
	});

	it('is idempotent on non_X output', () => {
		expect(normalizeInput('non_shaper')).toBe('non_shaper');
	});
});

// ===== Phase 2: extractNumericIntents =====

describe('extractNumericIntents', () => {
	it('extracts field at end: OP num field', () => {
		const { intents, remainder } = extractNumericIntents('> 5 strength');
		expect(intents).toHaveLength(1);
		expect(intents[0]).toMatchObject<NumericIntent>({
			kind: 'numeric',
			field: 'p',
			op: '>',
			value: 5
		});
		expect(remainder.trim()).toBe('');
	});

	it('extracts field at start: field OP num', () => {
		const { intents } = extractNumericIntents('strength > 5');
		expect(intents).toHaveLength(1);
		expect(intents[0]).toMatchObject<NumericIntent>({
			kind: 'numeric',
			field: 'p',
			op: '>',
			value: 5
		});
	});

	it('extracts multi-word field at start', () => {
		const { intents } = extractNumericIntents('rez cost > 5');
		expect(intents[0]).toMatchObject<NumericIntent>({
			kind: 'numeric',
			field: 'o',
			op: '>',
			value: 5
		});
	});

	it('extracts compound OR at end: < 2 or > 5 field', () => {
		const { intents } = extractNumericIntents('< 2 or > 5 strength');
		expect(intents).toHaveLength(3);
		expect(intents[0]).toMatchObject<NumericIntent>({
			kind: 'numeric',
			field: 'p',
			op: '<',
			value: 2
		});
		expect(intents[1]).toMatchObject({ kind: 'or_marker' });
		expect(intents[2]).toMatchObject<NumericIntent>({
			kind: 'numeric',
			field: 'p',
			op: '>',
			value: 5
		});
	});

	it('extracts compound OR at start: field < 2 or > 5', () => {
		const { intents } = extractNumericIntents('strength < 2 or > 5');
		expect(intents).toHaveLength(3);
		expect(intents[0]).toMatchObject<NumericIntent>({
			kind: 'numeric',
			field: 'p',
			op: '<',
			value: 2
		});
		expect(intents[1]).toMatchObject({ kind: 'or_marker' });
		expect(intents[2]).toMatchObject<NumericIntent>({
			kind: 'numeric',
			field: 'p',
			op: '>',
			value: 5
		});
	});

	it('extracts equality OR with field at end: 1 or 2 trash', () => {
		const { intents } = extractNumericIntents('1 or 2 trash');
		expect(intents).toHaveLength(3);
		expect(intents[0]).toMatchObject<NumericIntent>({
			kind: 'numeric',
			field: 'h',
			op: ':',
			value: 1
		});
		expect(intents[1]).toMatchObject({ kind: 'or_marker' });
		expect(intents[2]).toMatchObject<NumericIntent>({
			kind: 'numeric',
			field: 'h',
			op: ':',
			value: 2
		});
	});

	it('extracts bare number + field as equality', () => {
		const { intents } = extractNumericIntents('0 cost');
		expect(intents[0]).toMatchObject<NumericIntent>({
			kind: 'numeric',
			field: 'o',
			op: ':',
			value: 0
		});
	});

	it('extracts agenda ratio with s suffix', () => {
		const { intents } = extractNumericIntents('5/3s');
		expect(intents[0]).toMatchObject<AgendaRatioIntent>({
			kind: 'agendaRatio',
			advancement: 5,
			points: 3
		});
	});

	it('extracts agenda ratio without s suffix', () => {
		const { intents } = extractNumericIntents('4/2');
		expect(intents[0]).toMatchObject<AgendaRatioIntent>({
			kind: 'agendaRatio',
			advancement: 4,
			points: 2
		});
	});

	it('leaves remainder for unrecognized field words', () => {
		const { intents, remainder } = extractNumericIntents('> 5 foobar');
		expect(intents).toHaveLength(0);
		expect(remainder).toContain('foobar');
	});

	it('strips numeric pattern and leaves other tokens in remainder', () => {
		const { intents, remainder } = extractNumericIntents('shaper > 5 strength');
		expect(intents).toHaveLength(1);
		expect(remainder).toContain('shaper');
		expect(remainder).not.toContain('strength');
	});

	it('extracts multiple numeric intents from one string', () => {
		const { intents } = extractNumericIntents('> 5 strength 0 cost');
		expect(intents).toHaveLength(2);
		expect(intents.some((i) => i.kind === 'numeric' && i.field === 'p')).toBe(true);
		expect(intents.some((i) => i.kind === 'numeric' && i.field === 'o')).toBe(true);
	});
});

// ===== Phase 3: recognizeIntents =====

describe('recognizeIntents', () => {
	it('recognizes a single faction', () => {
		const intents = recognizeIntents('shaper');
		expect(intents).toHaveLength(1);
		expect(intents[0]).toMatchObject<FactionIntent>({
			kind: 'faction',
			value: 'shaper',
			negated: false
		});
	});

	it('recognizes a negated faction from non_ sentinel', () => {
		const intents = recognizeIntents('non_shaper');
		expect(intents[0]).toMatchObject<FactionIntent>({
			kind: 'faction',
			value: 'shaper',
			negated: true
		});
	});

	it('matches multi-word subtype as a single intent', () => {
		const intents = recognizeIntents('code gate');
		expect(intents).toHaveLength(1);
		expect(intents[0]).toMatchObject({ kind: 'subtype', value: '"code gate"' });
	});

	it('disambiguates "corp" as side, not subtype', () => {
		const intents = recognizeIntents('corp');
		expect(intents[0]).toMatchObject({ kind: 'side', value: 'corp' });
	});

	it('"runner identity" produces a single type intent', () => {
		const intents = recognizeIntents('runner identity');
		expect(intents).toHaveLength(1);
		expect(intents[0]).toMatchObject<TypeIntent>({
			kind: 'type',
			value: 'runner_identity',
			negated: false
		});
	});

	it('"or" produces an or_marker intent', () => {
		const intents = recognizeIntents('shaper or criminal');
		expect(intents[1]).toMatchObject({ kind: 'or_marker' });
	});

	it('drops bare digits silently', () => {
		const intents = recognizeIntents('5');
		expect(intents).toHaveLength(0);
	});

	it('emits freeform intent for unknown words', () => {
		const intents = recognizeIntents('mestnichestvo');
		expect(intents[0]).toMatchObject({
			kind: 'freeform',
			word: 'mestnichestvo'
		});
	});

	it('negates boolean: non_unique produces value 0', () => {
		const intents = recognizeIntents('non_unique');
		expect(intents[0]).toMatchObject({ kind: 'boolean', field: 'u', value: 0 });
	});

	it('positive boolean: unique produces value 1', () => {
		const intents = recognizeIntents('unique');
		expect(intents[0]).toMatchObject({ kind: 'boolean', field: 'u', value: 1 });
	});

	it('recognizes ids as array-valued type', () => {
		const intents = recognizeIntents('ids');
		expect(intents[0]).toMatchObject<TypeIntent>({
			kind: 'type',
			value: ['corp_identity', 'runner_identity'],
			negated: false
		});
	});
});

// ===== Phase 4: assembleOutput =====

describe('assembleOutput', () => {
	it('returns empty string for empty input', () => {
		expect(assembleOutput([])).toBe('');
	});

	it('groups OR-connected intents', () => {
		const intents: Intent[] = [
			{ kind: 'faction', value: 'shaper', negated: false },
			{ kind: 'or_marker' },
			{ kind: 'faction', value: 'criminal', negated: false }
		];
		expect(assembleOutput(intents)).toBe('(f:shaper or f:criminal)');
	});

	it('sorts freeform after structured intents', () => {
		const intents: Intent[] = [
			{ kind: 'freeform', word: 'cards' },
			{ kind: 'type', value: 'hardware', negated: false }
		];
		expect(assembleOutput(intents)).toBe('t:hardware cards');
	});

	it('emits OR group when numeric intents are separated by or_marker', () => {
		const intents: Intent[] = [
			{ kind: 'numeric', field: 'p', op: '>', value: 5 },
			{ kind: 'or_marker' },
			{ kind: 'numeric', field: 'p', op: '<', value: 2 }
		];
		expect(assembleOutput(intents)).toBe('(p>5 or p<2)');
	});

	it('emits two separate tokens when same-field numerics have no or_marker', () => {
		const intents: Intent[] = [
			{ kind: 'numeric', field: 'p', op: '>', value: 5 },
			{ kind: 'numeric', field: 'p', op: '<', value: 2 }
		];
		expect(assembleOutput(intents)).toBe('p>5 p<2');
	});

	it('emits negated array faction as AND-negation', () => {
		const intents: Intent[] = [
			{
				kind: 'faction',
				value: ['neutral_corp', 'neutral_runner'],
				negated: true
			}
		];
		expect(assembleOutput(intents)).toBe('f!neutral_corp f!neutral_runner');
	});

	it('emits agendaRatio as g:N v:N', () => {
		const intents: Intent[] = [{ kind: 'agendaRatio', advancement: 5, points: 3 }];
		expect(assembleOutput(intents)).toBe('g:5 v:3');
	});

	it('emits semantic tokens joined by spaces', () => {
		const intents: Intent[] = [{ kind: 'semantic', tokens: ['x:"tag"'] }];
		expect(assembleOutput(intents)).toBe('x:"tag"');
	});

	it('emits multi-token semantic as space-separated', () => {
		const intents: Intent[] = [{ kind: 'semantic', tokens: ['x:"lose"', 'x:"credit"'] }];
		expect(assembleOutput(intents)).toBe('x:"lose" x:"credit"');
	});

	it('orders side before faction before type', () => {
		const intents: Intent[] = [
			{ kind: 'type', value: 'hardware', negated: false },
			{ kind: 'faction', value: 'shaper', negated: false },
			{ kind: 'side', value: 'runner', negated: false }
		];
		expect(assembleOutput(intents)).toBe('d:runner f:shaper t:hardware');
	});

	it('emits three-way OR group', () => {
		const intents: Intent[] = [
			{ kind: 'faction', value: 'shaper', negated: false },
			{ kind: 'or_marker' },
			{ kind: 'faction', value: 'anarch', negated: false },
			{ kind: 'or_marker' },
			{ kind: 'faction', value: 'criminal', negated: false }
		];
		expect(assembleOutput(intents)).toBe('(f:shaper or f:anarch or f:criminal)');
	});

	it('emits array-valued type as OR group', () => {
		const intents: Intent[] = [
			{
				kind: 'type',
				value: ['corp_identity', 'runner_identity'],
				negated: false
			}
		];
		expect(assembleOutput(intents)).toBe('(t:corp_identity or t:runner_identity)');
	});

	it('emits negated subtype', () => {
		const intents: Intent[] = [{ kind: 'subtype', value: 'barrier', negated: true }];
		expect(assembleOutput(intents)).toBe('s!barrier');
	});
});
