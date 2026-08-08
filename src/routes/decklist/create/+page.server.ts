import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { FormatCycles } from '$lib/deck_formats';
import type { Card, CardPool, CollectionResponse, Faction, Format } from '$lib/types';
import { cache_guard } from '$lib/server/guard';

const IDENTITY_TYPES = ['corp_identity', 'runner_identity'] as const;

const SIDE_PAGE_SIZE = 1500;

export const load: PageServerLoad = async ({ cookies, fetch, url }) => {
	const identityId = url.searchParams.get('identity');

	const coldData = await cache_guard(cookies, async () => {
		const [factions, formats, cardPools, ...identityPages] = await Promise.all([
			fetch(`${NRDB_API_URL}/factions?page[size]=50`)
				.then((response) => response.json() as Promise<CollectionResponse<Faction>>)
				.then((response) => response.data),
			fetch(`${NRDB_API_URL}/formats?page[size]=50`)
				.then((response) => response.json() as Promise<CollectionResponse<Format>>)
				.then((response) => response.data),
			fetch(`${NRDB_API_URL}/card_pools?page[size]=100`)
				.then((response) => response.json() as Promise<CollectionResponse<CardPool>>)
				.then((response) => response.data),
			...IDENTITY_TYPES.map((card_type_id) =>
				fetch(`${NRDB_API_URL}/cards?filter[card_type_id]=${card_type_id}&page[size]=250`)
					.then((response) => response.json() as Promise<CollectionResponse<Card>>)
					.then((response) => response.data)
			)
		]);

		const cyclesByPool = new Map(
			cardPools.map((pool) => [pool.id, pool.attributes.card_cycle_ids ?? []])
		);

		const format_cycles: FormatCycles = {};
		for (const format of formats) {
			const cycles = cyclesByPool.get(format.attributes.active_card_pool_id);
			if (cycles) format_cycles[format.id] = cycles;
		}

		const cards = identityPages.flat();
		const identity = identityId ? cards.find((card) => card.id === identityId) : undefined;

		const sideCards = identity
			? await fetch(
					`${NRDB_API_URL}/cards?filter[side_id]=${identity.attributes.side_id}&page[size]=${SIDE_PAGE_SIZE}`
				)
					.then((response) => response.json() as Promise<CollectionResponse<Card>>)
					.then((response) => response.data)
			: [];

		return { factions, cards, side_cards: sideCards, format_cycles };
	});

	return {
		...(coldData ?? {})
	};
};
