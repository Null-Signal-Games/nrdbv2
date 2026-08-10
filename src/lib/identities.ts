import { FACTIONS } from './constants';
import { cardInFormatPool, type DeckFormat, type FormatCycles } from './deck_formats';
import { faction_name } from './i18n';
import { normalizedIncludes } from './search/filter';
import type { Card, Faction, FactionIds, SidesIds } from './types';

export interface DecklistCatalog {
	cards: Card[];
	factions: Faction[];
	// TODO: too cycle-focused, should be an explicit CardPool instead
	format_cycles: FormatCycles;
}

export interface FactionGroup {
	faction_id: FactionIds;
	name: string;
	cards: Card[];
}

export const identitiesByFaction = (
	catalog: DecklistCatalog,
	side: SidesIds,
	format: DeckFormat
): Map<FactionIds, Card[]> => {
	const identityType = `${side}_identity`;
	const byFaction = new Map<FactionIds, Card[]>();

	for (const card of catalog.cards) {
		if (card.attributes.card_type_id !== identityType) continue;
		if (!cardInFormatPool(card, format, catalog.format_cycles)) continue;

		const group = byFaction.get(card.attributes.faction_id) ?? [];
		byFaction.set(card.attributes.faction_id, [...group, card]);
	}

	return byFaction;
};

const factionOrder = new Map(FACTIONS.map((factionId, index) => [factionId, index]));

const rank = (factionId: FactionIds): number =>
	factionOrder.get(factionId) ?? Number.MAX_SAFE_INTEGER;

export const groupIdentitiesByFaction = (
	catalog: DecklistCatalog,
	side: SidesIds,
	format: DeckFormat
): FactionGroup[] =>
	[...identitiesByFaction(catalog, side, format)]
		.map(([faction_id, cards]) => ({
			faction_id,
			name: faction_name(faction_id),
			cards: [...cards].sort((a, b) => a.attributes.title.localeCompare(b.attributes.title))
		}))
		.sort((a, b) => rank(a.faction_id) - rank(b.faction_id));

export const filterFactionGroups = (
	groups: FactionGroup[],
	factionFilter: FactionIds[],
	nameFilter: string
): FactionGroup[] => {
	const needle = nameFilter.trim();

	return groups
		.filter((group) => factionFilter.length === 0 || factionFilter.includes(group.faction_id))
		.map((group) => ({
			...group,
			cards: needle
				? group.cards.filter((card) => normalizedIncludes(card.attributes.title, needle))
				: group.cards
		}))
		.filter((group) => group.cards.length > 0);
};
