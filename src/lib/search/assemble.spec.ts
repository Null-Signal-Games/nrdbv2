import { describe, it, expect } from 'vitest';
import { assembleExpression } from './assemble';
import type { IntentOrConnective } from './intents';

describe('assembleExpression', () => {
	it('returns empty string for empty input', () => {
		expect(assembleExpression([])).toBe('');
	});

	it('groups OR-connected intents', () => {
		const intents: IntentOrConnective[] = [
			{ kind: 'faction', value: 'shaper', negated: false },
			{ kind: 'or' },
			{ kind: 'faction', value: 'criminal', negated: false }
		];
		expect(assembleExpression(intents)).toBe('(f:shaper or f:criminal)');
	});

	it('sorts freeform after structured intents', () => {
		const intents: IntentOrConnective[] = [
			{ kind: 'freeform', word: 'cards' },
			{ kind: 'card_type', value: 'hardware', negated: false }
		];
		expect(assembleExpression(intents)).toBe('t:hardware cards');
	});

	it('emits OR group when numeric intents are separated by or', () => {
		const intents: IntentOrConnective[] = [
			{ kind: 'numeric', field: 'p', operator: '>', value: 5 },
			{ kind: 'or' },
			{ kind: 'numeric', field: 'p', operator: '<', value: 2 }
		];
		expect(assembleExpression(intents)).toBe('(p>5 or p<2)');
	});

	it('emits two separate tokens when same-field numerics have no or between them', () => {
		const intents: IntentOrConnective[] = [
			{ kind: 'numeric', field: 'p', operator: '>', value: 5 },
			{ kind: 'numeric', field: 'p', operator: '<', value: 2 }
		];
		expect(assembleExpression(intents)).toBe('p>5 p<2');
	});

	it('emits negated array faction as AND-negation', () => {
		const intents: IntentOrConnective[] = [
			{
				kind: 'faction',
				value: ['neutral_corp', 'neutral_runner'],
				negated: true
			}
		];
		expect(assembleExpression(intents)).toBe('f!neutral_corp f!neutral_runner');
	});

	it('emits agenda_ratio as g:N v:N', () => {
		const intents: IntentOrConnective[] = [{ kind: 'agenda_ratio', advancement: 5, points: 3 }];
		expect(assembleExpression(intents)).toBe('g:5 v:3');
	});

	it('emits semantic tokens joined by spaces', () => {
		const intents: IntentOrConnective[] = [{ kind: 'semantic', tokens: ['x:"tag"'] }];
		expect(assembleExpression(intents)).toBe('x:"tag"');
	});

	it('emits multi-token semantic as space-separated', () => {
		const intents: IntentOrConnective[] = [
			{ kind: 'semantic', tokens: ['x:"lose"', 'x:"credit"'] }
		];
		expect(assembleExpression(intents)).toBe('x:"lose" x:"credit"');
	});

	it('orders side before faction before type', () => {
		const intents: IntentOrConnective[] = [
			{ kind: 'card_type', value: 'hardware', negated: false },
			{ kind: 'faction', value: 'shaper', negated: false },
			{ kind: 'side', value: 'runner', negated: false }
		];
		expect(assembleExpression(intents)).toBe('d:runner f:shaper t:hardware');
	});

	it('emits three-way OR group', () => {
		const intents: IntentOrConnective[] = [
			{ kind: 'faction', value: 'shaper', negated: false },
			{ kind: 'or' },
			{ kind: 'faction', value: 'anarch', negated: false },
			{ kind: 'or' },
			{ kind: 'faction', value: 'criminal', negated: false }
		];
		expect(assembleExpression(intents)).toBe('(f:shaper or f:anarch or f:criminal)');
	});

	it('emits array-valued type as OR group', () => {
		const intents: IntentOrConnective[] = [
			{
				kind: 'card_type',
				value: ['corp_identity', 'runner_identity'],
				negated: false
			}
		];
		expect(assembleExpression(intents)).toBe('(t:corp_identity or t:runner_identity)');
	});

	it('emits negated subtype', () => {
		const intents: IntentOrConnective[] = [
			{ kind: 'subtype', value: 'barrier', negated: true }
		];
		expect(assembleExpression(intents)).toBe('s!barrier');
	});
});
