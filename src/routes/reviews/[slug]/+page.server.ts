import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import { cache_guard } from '$lib/server/guard';
import type { Card, Review } from '$lib/types';

export const load: PageServerLoad = async ({ cookies, params }) => {
	const cold_data = await cache_guard(cookies, async () => {
		const [card] = await Promise.all([
			fetch(`${NRDB_API_URL}/cards/${params.slug}`)
				.then((response) => response.json())
				.then((response) => response.data as Card)
		]);

		return { card };
	});

	const reviews = await fetch(`${NRDB_API_URL}/reviews?filter[card_id]=${params.slug}`)
		.then((response) => response.json())
		.then((response) => response.data as Review[]);

	return {
		...(cold_data ?? {}),
		reviews
	};
};
