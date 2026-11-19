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
			{ kind: 'numeric', field: 'strength', operator: '>', value: 5 },
			{ kind: 'or' },
			{ kind: 'numeric', field: 'strength', operator: '<', value: 2 }
		];
		expect(assembleExpression(intents)).toBe('(p>5 or p<2)');
	});

	it('emits two separate tokens when same-field numerics have no or between them', () => {
		const intents: IntentOrConnective[] = [
			{ kind: 'numeric', field: 'strength', operator: '>', value: 5 },
			{ kind: 'numeric', field: 'strength', operator: '<', value: 2 }
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

	it('emits a text phrase as a quoted card-text term', () => {
		const intents: IntentOrConnective[] = [{ kind: 'text', phrases: ['tag'] }];
		expect(assembleExpression(intents)).toBe('x:"tag"');
	});

	it('emits one card-text term per text phrase', () => {
		const intents: IntentOrConnective[] = [{ kind: 'text', phrases: ['lose', 'credit'] }];
		expect(assembleExpression(intents)).toBe('x:"lose" x:"credit"');
	});

	it('emits verbatim expressions untouched', () => {
		const intents: IntentOrConnective[] = [{ kind: 'verbatim', expression: 's!"code gate"' }];
		expect(assembleExpression(intents)).toBe('s!"code gate"');
	});

	it('quotes subtype names containing a space or hyphen', () => {
		expect(assembleExpression([{ kind: 'subtype', value: 'code gate', negated: false }])).toBe(
			's:"code gate"'
		);
		expect(
			assembleExpression([{ kind: 'subtype', value: 'consumer-grade', negated: true }])
		).toBe('s!"consumer-grade"');
	});

	it('emits boolean fields as 1, or 0 when negated', () => {
		expect(assembleExpression([{ kind: 'boolean', field: 'is_unique', negated: false }])).toBe(
			'u:1'
		);
		expect(
			assembleExpression([{ kind: 'boolean', field: 'trash_ability', negated: true }])
		).toBe('trash_ability:0');
	});

	it('emits numeric equality with a colon', () => {
		expect(
			assembleExpression([{ kind: 'numeric', field: 'cost', operator: '=', value: 0 }])
		).toBe('o:0');
	});

	it('writes a numeric field without a short keyword by name', () => {
		expect(
			assembleExpression([
				{ kind: 'numeric', field: 'num_printed_subroutines', operator: '>', value: 2 }
			])
		).toBe('num_printed_subroutines>2');
	});

	it('emits negated set', () => {
		expect(assembleExpression([{ kind: 'set', value: 'core', negated: true }])).toBe('e!core');
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
