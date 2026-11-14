import { describe, it, expect } from 'vitest';
import { assembleOutput } from './assemble';
import type { Intent } from './intents';

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
