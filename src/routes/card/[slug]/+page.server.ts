import { NRDB_API_URL } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	return {
		searchParams: url.searchParams.toString(),
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
