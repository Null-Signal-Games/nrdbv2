import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { Card, Printing, SQLite } from '$lib/types';
import { cache_guard } from '$lib/server/guard';

export const load: PageServerLoad = async ({ params, cookies, fetch }) => {
	const cold_data = await cache_guard(cookies, async () => {
		const [card, printings] = await Promise.all([
			fetch(`${NRDB_API_URL}/cards/${params.slug}`)
				.then((response) => response.json())
				.then((response) => response.data as SQLite<Card, 'attributes'>),
			fetch(`${NRDB_API_URL}/printings?filter[card_id]=${params.slug}&page[size]=100`)
				.then((response) => response.json())
				.then((response) => response.data as SQLite<Printing, 'attributes'>)
		]);

		return { card, printings };
	});

	const reviews = (async () => {
		const response = await fetch(
			`${NRDB_API_URL}/reviews?filter[card_id]=${params.slug}&page[size]=10`
		);
		const json = await response.json();
		return json.data.reverse();
	})();

	const rulings = (async () => {
		const response = await fetch(
			`${NRDB_API_URL}/rulings?filter[card_id]=${params.slug}&page[size]=10`
		);
		const json = await response.json();
		return json.data;
	})();

	return {
		...(cold_data ?? {}),
		reviews,
		rulings
	};
};
