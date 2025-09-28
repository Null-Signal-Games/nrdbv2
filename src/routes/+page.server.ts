import { NRDB_API_URL } from '$lib/utils';
import type { PageServerLoad } from './$types';
import type { ApiResponse, Card, Decklist } from '$lib/types';

export const load: PageServerLoad = async ({ fetch }) => {
	return {
		// https://svelte.dev/docs/kit/load#Streaming-with-promises

		// eslint-disable-next-line no-async-promise-executor
		decklist_of_the_week: new Promise(async (resolve, reject) => {
			try {
				// First request: Get the decklists
				const decklists_response = await fetch(`${NRDB_API_URL}/decklists?page[size]=10`);
				const decklists_json: ApiResponse<Decklist> = await decklists_response.json();

				if (!decklists_json.data || decklists_json.data.length === 0) {
					throw new Error('No decklists found');
				}

				// Get the first decklist for "decklist of the day"
				const first_decklist = decklists_json.data[0];

				// Second request: Get identity card and cards for this decklist
				const [identity_response, cards_response] = await Promise.all([
					fetch(`${NRDB_API_URL}/cards/${first_decklist.attributes.identity_card_id}`),
					fetch(`${NRDB_API_URL}/cards?filter[decklist_id]=${first_decklist.id}`)
				]);

				const [identity_json, cards_json]: [ApiResponse<Card>, ApiResponse<Card>] =
					await Promise.all([identity_response.json(), cards_response.json()]);

				// Combine the data
				resolve({
					identity: identity_json.data,
					decklist: first_decklist,
					cards: cards_json.data
				});
			} catch (error) {
				reject(error);
			}
		}),

		// eslint-disable-next-line no-async-promise-executor
		decklists: new Promise(async (resolve, reject) => {
			try {
				const response = await fetch(`${NRDB_API_URL}/decklists?page[size]=10`);
				const json: ApiResponse<Decklist> = await response.json();
				resolve(json.data);
			} catch (error) {
				reject(error);
			}
		})

		// If all card, cycle and set data is not loaded in the root +layout.svelte file, fetch the first 50 cards to use as placeholder, streamed into the client to reduce load times
		 
		// cards: new Promise(async (resolve, reject) => {
		// 	try {
		// 		const response = await fetch(`${NRDB_API_URL}/cards?page[size]=50`);
		// 		const json: ApiResponse<Card> = await response.json();
		// 		resolve(json.data);
		// 	} catch (error) {
		// 		reject(error);
		// 	}
		// })
	};
};
