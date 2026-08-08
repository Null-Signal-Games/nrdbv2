import { goto } from '$app/navigation';
import { page } from '$app/state';
import { isDeckFormat, type DeckFormat } from './deck_formats';
import { identitiesByFaction, type DecklistCatalog } from './identities';
import type { Card, FactionIds, SidesIds } from './types';

export type { DecklistCatalog };

export const DEFAULT_SIDE: SidesIds = 'corp';
export const DEFAULT_FORMAT: DeckFormat = 'standard';

const PARAM = {
	side: 'side',
	format: 'format',
	faction: 'faction',
	identity: 'identity'
} as const;

export interface DecklistParams {
	side: SidesIds;
	format: DeckFormat;
	factions: FactionIds[];
	identity: Card['id'] | null;
}

export type DecklistPatch = Partial<DecklistParams>;

const isSideId = (value: string): value is SidesIds => value === 'corp' || value === 'runner';

export const readParams = (params: URLSearchParams, catalog: DecklistCatalog): DecklistParams => {
	const rawSide = params.get(PARAM.side);
	const side = rawSide && isSideId(rawSide) ? rawSide : DEFAULT_SIDE;

	const rawFormat = params.get(PARAM.format);
	const format = rawFormat && isDeckFormat(rawFormat) ? rawFormat : DEFAULT_FORMAT;

	const isKnownFaction = (id: string): id is FactionIds =>
		catalog.factions.some((faction) => faction.id === id);

	const available = identitiesByFaction(catalog, side, format);
	const rawFactions = params.get(PARAM.faction);

	return {
		side,
		format,
		factions: rawFactions
			? rawFactions
					.split(',')
					.filter(isKnownFaction)
					.filter((id) => available.has(id))
			: [],
		identity: params.get(PARAM.identity) || null
	};
};

export const CREATE_PATH = '/decklist/create';

export const createHref = (patch: DecklistPatch, base?: URLSearchParams): string => {
	const params = new URLSearchParams(base);
	writeParams(params, patch);

	const query = params.toString();

	return query ? `${CREATE_PATH}?${query}` : CREATE_PATH;
};

export const writeParams = (params: URLSearchParams, patch: DecklistPatch): void => {
	if (patch.side !== undefined) params.set(PARAM.side, patch.side);

	if (patch.format !== undefined) params.set(PARAM.format, patch.format);

	if (patch.factions !== undefined) {
		if (patch.factions.length === 0) params.delete(PARAM.faction);
		else params.set(PARAM.faction, patch.factions.join(','));
	}

	if (patch.identity !== undefined) {
		if (patch.identity === null) params.delete(PARAM.identity);
		else params.set(PARAM.identity, patch.identity);
	}
};

const navigate = (patch: DecklistPatch, replaceState: boolean): void => {
	const url = new URL(page.url);
	writeParams(url.searchParams, patch);

	void goto(url, { replaceState, keepFocus: true, noScroll: true });
};

const replace = (patch: DecklistPatch) => navigate(patch, true);

export const decklistNav = {
	selectSide: (side: SidesIds) => replace({ side, identity: null, factions: [] }),
	selectFormat: (format: DeckFormat) => replace({ format }),
	setFactions: (factions: FactionIds[]) => replace({ factions }),
	selectIdentity: (identity: Card['id']) => replace({ identity }),
	clearIdentity: () => replace({ identity: null })
};
