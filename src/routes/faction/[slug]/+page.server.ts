import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { SidesIds, Faction, FactionIds, ApiResponse, Card, Decklist } from '$lib/types';
import { NRDB_CACHE_COOKIE } from '$lib/constants';

export const load: PageServerLoad = async ({ fetch, params, cookies }) => {
	const cache = cookies.get(NRDB_CACHE_COOKIE) === '1';

	const [faction, faction_cards] = cache
		? []
		: await Promise.all([
				fetch(`${NRDB_API_URL}/factions/${params.slug}`)
					.then((r) => r.json())
					.then((r) => r.data as Faction),
				fetch(`${NRDB_API_URL}/cards?filter[faction_id]=${params.slug}&page[size]=1000`)
					.then((r) => r.json())
					.then((r) => r.data as Card[])
			]);

	// Below to constants (factions, card_type_id) should be a util func
	const factions: { [key in SidesIds]: FactionIds[] } = {
		corp: ['haas_bioroid', 'jinteki', 'nbn', 'weyland_consortium', 'neutral_corp'],
		runner: ['anarch', 'criminal', 'shaper', 'adam', 'apex', 'sunny_lebeau', 'neutral_runner']
	};

	const card_type_id = factions.corp.includes(params.slug as FactionIds)
		? 'corp_identity'
		: 'runner_identity';

	return {
		...(!cache ? { faction, faction_cards } : {}),
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
						const decklists_json: ApiResponse<Decklist[]> =
							await decklists_response.json();
						decklist_array.push({
							identity: identity.id,
							decklists: decklists_json.data.length > 0 ? decklists_json.data : []
						});
					})
				);
				resolve(decklist_array);
			} catch (error) {
				reject(error);
			}
		})
	};
};
