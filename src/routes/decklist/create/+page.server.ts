import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { Card, CollectionResponse, Faction } from '$lib/types';
import { cache_guard } from '$lib/server/guard';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	// The +page.ts (universal load) supplies `factions` and `cards` from the
	// local SQLite cache when the browser has one. The server-side load is a
	// fallback for users without the cache, gated by `cache_guard` so that we
	// skip the API round-trips entirely when the cookie is set.
	const cold_data = await cache_guard(cookies, async () => {
		const [factions, cards] = await Promise.all([
			fetch(`${NRDB_API_URL}/factions?page[size]=50`)
				.then((response) => response.json() as Promise<CollectionResponse<Faction>>)
				.then((response) => response.data),
			// `page[size]` on the public API is capped at 200; the decklist builder
			// only needs a representative slice of cards for filtering/searching,
			// so this is sufficient for the no-cache fallback.
			fetch(`${NRDB_API_URL}/cards?page[size]=200`)
				.then((response) => response.json() as Promise<CollectionResponse<Card>>)
				.then((response) => response.data)
		]);

		return { factions, cards };
	});

	return {
		...(cold_data ?? {})
	};
};
