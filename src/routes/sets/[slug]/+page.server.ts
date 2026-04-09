import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { Set, Card } from '$lib/types';
import { cache_guard } from '$lib/server/guard';

export const load: PageServerLoad = async ({ cookies, fetch, params }) => {
	const cold_data = await cache_guard(cookies, async () => {
		const [set, cards] = await Promise.all([
			fetch(`${NRDB_API_URL}/card_sets/${params.slug}`)
				.then((response) => response.json())
				.then((response) => response.data as Set),
			fetch(`${NRDB_API_URL}/cards?filter[card_set_id]=${params.slug}&page[size]=1000`)
				.then((response) => response.json())
				.then((response) => response.data as Card[])
		]);

		return { set, cards };
	});

	return {
		...(cold_data ?? {})
	};
};
