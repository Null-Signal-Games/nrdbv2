import { describe, it, expect } from 'vitest';
import {
	filterFactionGroups,
	groupIdentitiesByFaction,
	identitiesByFaction,
	type DecklistCatalog,
	type FactionGroup
} from './identities';
import { APEX, ESA, PRECISION_DESIGN, SHRED, TAO, TOPAN, ZAHYA } from './identities.fixture';
import type { Faction } from './types';

const catalog: DecklistCatalog = {
	// SHRED is a runner card that is not an identity.
	cards: [PRECISION_DESIGN, ESA, TOPAN, TAO, APEX, SHRED],
	factions: [] as unknown as Faction[],
	active_card_pool_ids: {
		startup: 'startup_vantage_point',
		standard: 'standard_2026_vantage_point',
		eternal: 'eternal'
	}
};

describe('identitiesByFaction', () => {
	it('groups identities of the requested side by faction', () => {
		const groups = identitiesByFaction(catalog, 'runner', 'standard');

		expect([...groups.keys()]).toEqual(['anarch', 'shaper']);
		expect(groups.get('anarch')?.map((c) => c.id)).toEqual([
			'esa_afontov_eco_insurrectionist',
			'topan_ormas_leader'
		]);
	});

	it('excludes the other side', () => {
		expect(identitiesByFaction(catalog, 'corp', 'eternal').has('anarch')).toBe(false);
		expect(identitiesByFaction(catalog, 'corp', 'eternal').has('haas_bioroid')).toBe(true);
	});

	it('excludes non-identity cards of a matching faction', () => {
		const anarch = identitiesByFaction(catalog, 'runner', 'standard').get('anarch');

		expect(anarch?.map((c) => c.id)).not.toContain('shred');
	});

	it('excludes historical format members outside the active pool', () => {
		expect(ESA.attributes.format_ids).toContain('startup');
		expect(
			identitiesByFaction(catalog, 'runner', 'startup')
				.get('anarch')
				?.map((card) => card.id)
		).not.toContain(ESA.id);
	});

	it('excludes factions the format has no pool for', () => {
		expect(identitiesByFaction(catalog, 'runner', 'standard').has('apex')).toBe(false);
		expect(identitiesByFaction(catalog, 'runner', 'eternal').has('apex')).toBe(true);
	});

	it('returns nothing when the pool data is missing', () => {
		const empty = { ...catalog, active_card_pool_ids: {} };

		expect(identitiesByFaction(empty, 'runner', 'standard').size).toBe(0);
	});

	it('returns every identity regardless of pool for the all format', () => {
		const groups = identitiesByFaction(catalog, 'runner', 'all');

		expect(groups.get('anarch')?.map((card) => card.id)).toContain(ESA.id);
		expect(groups.has('apex')).toBe(true);
	});
});

// Deliberately not in canonical faction order, and Topan before Esâ.
const orderingCatalog: DecklistCatalog = {
	...catalog,
	cards: [TAO, ZAHYA, TOPAN, ESA],
	active_card_pool_ids: {
		standard: 'standard_2026_vantage_point'
	}
};

describe('groupIdentitiesByFaction', () => {
	it('orders groups by the canonical faction order, not insertion order', () => {
		const groups = groupIdentitiesByFaction(orderingCatalog, 'runner', 'standard');

		expect(groups.map((group) => group.faction_id)).toEqual(['anarch', 'criminal', 'shaper']);
	});

	it('sorts cards within a group by title', () => {
		const groups = groupIdentitiesByFaction(orderingCatalog, 'runner', 'standard');
		const anarch = groups.find((group) => group.faction_id === 'anarch');

		expect(anarch?.cards.map((c) => c.attributes.title)).toEqual([
			'Esâ Afontov: Eco-Insurrectionist',
			'Topan: Ormas Leader'
		]);
	});
});

describe('filterFactionGroups', () => {
	const groups = (): FactionGroup[] =>
		groupIdentitiesByFaction(orderingCatalog, 'runner', 'standard');

	it('keeps every group when no faction filter is set', () => {
		expect(filterFactionGroups(groups(), [], '').map((g) => g.faction_id)).toEqual([
			'anarch',
			'criminal',
			'shaper'
		]);
	});

	it('keeps only the selected factions', () => {
		const filtered = filterFactionGroups(groups(), ['criminal'], '');

		expect(filtered.map((g) => g.faction_id)).toEqual(['criminal']);
	});

	it('filters cards by name, ignoring case and diacritics', () => {
		expect(filterFactionGroups(groups(), [], 'esa afontov')[0].cards.map((c) => c.id)).toEqual([
			'esa_afontov_eco_insurrectionist'
		]);
		expect(filterFactionGroups(groups(), [], 'tao salonga')[0].cards.map((c) => c.id)).toEqual([
			'tao_salonga_telepresence_magician'
		]);
	});

	it('ignores surrounding whitespace in the name filter', () => {
		expect(filterFactionGroups(groups(), [], '   ')).toHaveLength(3);
		expect(filterFactionGroups(groups(), [], '  zahya  ').map((g) => g.faction_id)).toEqual([
			'criminal'
		]);
	});

	it('drops groups left with no matching cards', () => {
		expect(filterFactionGroups(groups(), [], 'nothing matches this')).toEqual([]);
	});

	it('does not mutate the groups it is given', () => {
		const original = groups();

		filterFactionGroups(original, ['criminal'], 'zahya');

		expect(original.map((g) => g.faction_id)).toEqual(['anarch', 'criminal', 'shaper']);
		expect(original.find((g) => g.faction_id === 'anarch')?.cards).toHaveLength(2);
	});
});
