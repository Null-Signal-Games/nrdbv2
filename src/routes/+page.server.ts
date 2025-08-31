import { NRDB_API_URL } from '$lib/utils';
import type { PageServerLoad } from './$types';
import type { ApiResponse, Card } from '$lib/types';

export const load: PageServerLoad = async ({ fetch }) => {
	return {
		// https://svelte.dev/docs/kit/load#Streaming-with-promises

		// If all card, cycle and set data is not loaded in the root +layout.svelte file, fetch the first 50 cards to use as placeholder, streamed into the client to reduce load times
		// eslint-disable-next-line no-async-promise-executor
		cards: new Promise(async (resolve, reject) => {
			try {
				const response = await fetch(`${NRDB_API_URL}/cards?page[size]=50`);
				const json: ApiResponse<Card> = await response.json();
				resolve(json.data);
			} catch (error) {
				reject(error);
			}
		})
	};
};
