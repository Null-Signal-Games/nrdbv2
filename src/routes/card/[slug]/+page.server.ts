import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { Card, Printing } from '$lib/types';

export const load: PageServerLoad = async ({ params, url, cookies, fetch }) => {
	const has_cache = cookies.get('nrdb_cache') === '1';

	const [card, printings] = has_cache
		? [null, null]
		: await Promise.all([
				fetch(`${NRDB_API_URL}/cards/${params.slug}`)
					.then((r) => r.json())
					.then((r) => r.data as Card),
				fetch(`${NRDB_API_URL}/printings?filter[card_id]=${params.slug}&page[size]=100`)
					.then((r) => r.json())
					.then((r) => r.data as Printing[])
			]);

	return {
		searchParams: url.searchParams.toString(),
		card,
		printings,
		// https://svelte.dev/docs/kit/load#Streaming-with-promises

		// eslint-disable-next-line no-async-promise-executor
		reviews: new Promise(async (resolve, reject) => {
			try {
				// Prefix fetch URL with `https://app.requestly.io/delay/5000/` to simulate artifical latency
				const response = await fetch(
					`${NRDB_API_URL}/reviews?filter[card_id]=${params.slug}&page[size]=10`
				);
				const json = await response.json();
				resolve(json.data);
			} catch (error) {
				reject(error);
			}
		}),
		// TODO: review this implimentation, rulings does not likely need to be a promise (streaming), as rulings do not often change
		// eslint-disable-next-line no-async-promise-executor
		rulings: new Promise(async (resolve, reject) => {
			try {
				const response = await fetch(
					`${NRDB_API_URL}/rulings?filter[card_id]=${params.slug}&page[size]=10`
				);
				console.log(`${NRDB_API_URL}/rulings?filter[card_id]=${params.slug}&page[size]=10`);
				const json = await response.json();
				resolve(json.data);
			} catch (error) {
				reject(error);
			}
		})
	};
};
