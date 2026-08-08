import { describe, it, expect } from 'vitest';
import {
	createHref,
	DEFAULT_FORMAT,
	DEFAULT_SIDE,
	readParams,
	writeParams,
	type DecklistCatalog
} from './decklist_params';
import { APEX, ESA, PRECISION_DESIGN, RESTORING_HUMANITY, ZAHYA } from './identities.fixture';
import { createMockCard } from './test-helpers';
import type { Faction, FactionIds } from './types';

const faction = (id: string): Faction => ({ id }) as unknown as Faction;

const catalog: DecklistCatalog = {
	cards: [
		PRECISION_DESIGN,
		RESTORING_HUMANITY,
		ESA,
		ZAHYA,
		APEX,
		createMockCard('unknown_faction_id', 'Unknown Faction', ['borealis'], {
			side_id: 'runner',
			faction_id: 'not_a_faction' as FactionIds,
			card_type_id: 'runner_identity'
		})
	],
	factions: [
		faction('haas_bioroid'),
		faction('jinteki'),
		faction('anarch'),
		faction('criminal'),
		faction('apex')
	],
	format_cycles: {
		standard: ['elevation', 'borealis', 'system_gateway'],
		eternal: ['elevation', 'borealis', 'system_gateway', 'data_and_destiny']
	}
};

const parse = (query: string) => readParams(new URLSearchParams(query), catalog);

describe('readParams', () => {
	it('falls back to defaults when params are absent', () => {
		expect(parse('')).toEqual({
			side: DEFAULT_SIDE,
			format: DEFAULT_FORMAT,
			factions: [],
			identity: null
		});
	});

	it('falls back to defaults when params are invalid', () => {
		const result = parse('side=bogus&format=nonsense&faction=notreal');

		expect(result.side).toBe(DEFAULT_SIDE);
		expect(result.format).toBe(DEFAULT_FORMAT);
		expect(result.factions).toEqual([]);
	});

	it('reads valid side and format', () => {
		const result = parse('side=runner&format=eternal');

		expect(result.side).toBe('runner');
		expect(result.format).toBe('eternal');
	});

	it('drops factions the current format has no identities for', () => {
		expect(parse('side=runner&format=eternal&faction=apex').factions).toEqual(['apex']);
		expect(parse('side=runner&format=standard&faction=apex').factions).toEqual([]);
	});

	it('drops factions belonging to the other side', () => {
		expect(parse('side=runner&faction=anarch,jinteki').factions).toEqual(['anarch']);
	});

	it('reports a missing or blank identity as null', () => {
		expect(parse('').identity).toBeNull();
		expect(parse('identity=').identity).toBeNull();
	});
});

describe('writeParams', () => {
	it('leaves params the patch does not mention alone', () => {
		const params = new URLSearchParams(
			'side=runner&format=eternal&faction=anarch&name=hoshiko'
		);
		writeParams(params, { format: 'standard' });

		expect(params.get('side')).toBe('runner');
		expect(params.get('faction')).toBe('anarch');
		expect(params.get('name')).toBe('hoshiko');
		expect(params.get('format')).toBe('standard');
	});

	it('leaves a faction the new format cannot satisfy in the url, but out of the result', () => {
		const params = new URLSearchParams('side=runner&format=eternal&faction=apex');
		writeParams(params, { format: 'standard' });

		expect(params.get('faction')).toBe('apex');
		expect(readParams(params, catalog).factions).toEqual([]);

		writeParams(params, { format: 'eternal' });
		expect(readParams(params, catalog).factions).toEqual(['apex']);
	});

	it('writes a faction list as one comma separated param that reads back unchanged', () => {
		const params = new URLSearchParams('side=runner');
		writeParams(params, { factions: ['anarch', 'criminal'] });

		expect(params.get('faction')).toBe('anarch,criminal');
		expect(readParams(params, catalog).factions).toEqual(['anarch', 'criminal']);
	});

	it('removes the faction param when the list is empty', () => {
		const params = new URLSearchParams('faction=anarch');
		writeParams(params, { factions: [] });

		expect(params.has('faction')).toBe(false);
	});

	it('removes the identity param when set to null', () => {
		const params = new URLSearchParams('identity=esa_afontov_eco_insurrectionist');
		writeParams(params, { identity: null });

		expect(params.has('identity')).toBe(false);
	});

	it('leaves the identity alone when the patch omits it', () => {
		const params = new URLSearchParams('identity=esa_afontov_eco_insurrectionist');
		writeParams(params, { format: 'eternal' });

		expect(params.get('identity')).toBe('esa_afontov_eco_insurrectionist');
	});
});

describe('createHref', () => {
	it('keeps the identity in the query, not the path', () => {
		expect(createHref({ identity: 'esa_afontov_eco_insurrectionist' })).toBe(
			'/decklist/create?identity=esa_afontov_eco_insurrectionist'
		);
	});

	it('returns a bare path when the patch is empty', () => {
		expect(createHref({})).toBe('/decklist/create');
	});

	it('preserves picker context alongside the identity', () => {
		const params = new URLSearchParams('side=runner&format=eternal&faction=anarch');

		expect(createHref({ identity: 'esa_afontov_eco_insurrectionist' }, params)).toBe(
			'/decklist/create?side=runner&format=eternal&faction=anarch&identity=esa_afontov_eco_insurrectionist'
		);
	});

	it('drops the identity when cleared, leaving the rest of the context', () => {
		const params = new URLSearchParams('side=runner&identity=esa_afontov_eco_insurrectionist');

		expect(createHref({ identity: null }, params)).toBe('/decklist/create?side=runner');
	});
});
