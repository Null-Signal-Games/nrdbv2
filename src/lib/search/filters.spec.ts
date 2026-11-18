import { describe, it, expect, beforeAll } from 'vitest';
import { collectActiveFilters, toggleFilterInInput } from './filters';
import { interpret } from './interpret';
import { populateSubtypeMap } from './vocabulary';
import { SUBTYPE_FIXTURE } from './subtypes.fixture';

beforeAll(() => populateSubtypeMap(SUBTYPE_FIXTURE));

describe('natural-language filter synchronization', () => {
	it('derives positive filters from natural language', () => {
		const interpretation = interpret('hb ice');
		expect(interpretation.expression).toBe('f:haas_bioroid t:ice');
		expect(collectActiveFilters(interpretation)).toEqual([
			{ kind: 'faction', id: 'haas_bioroid' },
			{ kind: 'cardType', id: 'ice' }
		]);
	});

	it('does not treat explicit syntax as a natural filter occurrence', () => {
		expect(collectActiveFilters(interpret('f:anarch t:ice'))).toEqual([]);
	});

	it('adds and removes filters without canonicalizing the visible input', () => {
		const withoutFaction = toggleFilterInInput(interpret('hb ice'), {
			kind: 'faction',
			id: 'haas_bioroid'
		});
		expect(withoutFaction).toBe('ice');

		expect(
			toggleFilterInInput(interpret(withoutFaction), {
				kind: 'faction',
				id: 'anarch'
			})
		).toBe('ice anarch');
	});

	it('removes a shared neutral occurrence as one unit', () => {
		expect(
			toggleFilterInInput(interpret('neutral'), {
				kind: 'faction',
				id: 'neutral_runner'
			})
		).toBe('');

		const added = toggleFilterInInput(interpret(''), {
			kind: 'faction',
			id: 'neutral_runner'
		});
		expect(added).toBe('neutral');
		expect(interpret(added).expression).toBe('(f:neutral_corp or f:neutral_runner)');
	});

	it('preserves numeric wording', () => {
		expect(
			toggleFilterInInput(interpret('cost greater than 3 criminal events'), {
				kind: 'faction',
				id: 'criminal'
			})
		).toBe('cost greater than 3 events');
	});
});
