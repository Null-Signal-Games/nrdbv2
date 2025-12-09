import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { SidesIds, FactionIds, ApiResponse, Card, Decklist } from '$lib/types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	let card_type_id: `${SidesIds}_identity` = 'corp_identity';

	// NRDB API uses "corp_identity" and "runner_identity" for card_type_id, not just "identity", so we need to determine which one to use based on the faction
	const factions: { [key in SidesIds]: FactionIds[] } = {
		corp: ['haas_bioroid', 'jinteki', 'nbn', 'weyland_consortium', 'neutral_corp'],
		runner: ['anarch', 'criminal', 'shaper', 'adam', 'apex', 'sunny_lebeau', 'neutral_runner']
	};

	card_type_id = factions.corp.includes(params.slug as FactionIds)
		? 'corp_identity'
		: 'runner_identity';

	return {
		// https://svelte.dev/docs/kit/load#Streaming-with-promises

		// identities: new Promise(async (resolve, reject) => {
		//     try {
		//         const identities_response = await fetch(
		//             `${NRDB_API_URL}/cards?filter[faction_id]=${params.slug}&filter[card_type_id]=${card_type_id}&page[size]=50`
		//         );
		//         const identities_json: ApiResponse<Card[]> = await identities_response.json();
		//         const identities = identities_json.data;
		//         resolve(identities);
		//     } catch (error) {
		//         reject(error);
		//     }
		// }),

		// eslint-disable-next-line no-async-promise-executor
		decklists: new Promise(async (resolve, reject) => {
			try {
				const identities_response = await fetch(
					`${NRDB_API_URL}/cards?filter[faction_id]=${params.slug}&filter[card_type_id]=${card_type_id}&page[size]=50`
				);
				const identities_json: ApiResponse<Card[]> = await identities_response.json();
				const identities = identities_json.data;
				const decklist_array: { id: string; decklists: Decklist[] }[] = [];

				await Promise.all(
					identities.map(async (identity: Card) => {
						const decklists_response = await fetch(
							`${NRDB_API_URL}/decklists?filter[identity_card_id]=${identity.id}&page[size]=5`
						);
						const decklists_json: ApiResponse<Decklist[]> = await decklists_response.json();
						decklist_array.push({
							identity: identity,
							decklists: decklists_json.data.length > 0 ? decklists_json.data : []
						});
					})
				);
				resolve(decklist_array);
			} catch (error) {
				reject(error);
			}
		})

		// Returns any/all decklists for this faction, limited to 5 for now

		// decklists: new Promise(async (resolve, reject) => {
		//     try {
		//         console.log(`${NRDB_API_URL}/decklists?filter[faction_id]=${params.slug}&page[size]=5`);
		//         const response = await fetch(`${NRDB_API_URL}/decklists?filter[faction_id]=${params.slug}&page[size]=5`);
		//         const json: ApiResponse<Decklist> = await response.json();
		//         resolve(json.data);
		//     } catch (error) {
		//         reject(error);
		//     }
		// }),
	};
};
