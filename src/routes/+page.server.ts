import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { ApiResponse, Card, Decklist } from '$lib/types';

export const load: PageServerLoad = async ({ fetch }) => {
	let dotw: object = {};

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
		const identity_response = await fetch(
			`${NRDB_API_URL}/cards/${first_decklist.attributes.identity_card_id}`
		);
		const identity_json: ApiResponse<Card> = await identity_response.json();
		const cards_response = await fetch(
			`${NRDB_API_URL}/cards?filter[decklist_id]=${first_decklist.id}`
		);
		const cards_json: ApiResponse<Card[]> = await cards_response.json();

		dotw = {
			identity: identity_json.data,
			decklist: first_decklist,
			cards: cards_json.data
		};
	} catch (error) {
		console.error('Error fetching decklist of the week:', error);
	}

	return {
		decklist_of_the_week: dotw,
		// https://svelte.dev/docs/kit/load#Streaming-with-promises
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
	};
};
