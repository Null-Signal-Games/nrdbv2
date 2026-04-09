import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { SidesIds, Faction, FactionIds, Card, Decklist } from '$lib/types';
import { cache_guard } from '$lib/server/guard';

export const load: PageServerLoad = async ({ fetch, params, cookies }) => {
	const cold_data = await cache_guard(cookies, async () => {
		const [faction, cards] = await Promise.all([
			fetch(`${NRDB_API_URL}/factions/${params.slug}`)
				.then((response) => response.json())
				.then((response) => response.data as Faction[]),
			fetch(`${NRDB_API_URL}/cards?filter[faction_id]=${params.slug}&page[size]=1000`)
				.then((response) => response.json())
				.then((response) => response.data as Card[])
		]);

		return { faction, cards };
	});

	// Below to constants (factions, card_type_id) should be a util func
	const factions: { [key in SidesIds]: FactionIds[] } = {
		corp: ['haas_bioroid', 'jinteki', 'nbn', 'weyland_consortium', 'neutral_corp'],
		runner: ['anarch', 'criminal', 'shaper', 'adam', 'apex', 'sunny_lebeau', 'neutral_runner']
	};

	const card_type_id = factions.corp.includes(params.slug as FactionIds)
		? 'corp_identity'
		: 'runner_identity';

	return {
		...(cold_data ?? {}),
		// https://svelte.dev/docs/kit/load#Streaming-with-promises
		// eslint-disable-next-line no-async-promise-executor
		decklists: new Promise(async (resolve, reject) => {
			try {
				const identities = await fetch(
					`${NRDB_API_URL}/cards?filter[faction_id]=${params.slug}&filter[card_type_id]=${card_type_id}&page[size]=50`
				)
					.then((response) => response.json())
					.then((response) => response.data as Card[]);

				const decklist_array: {
					identity: Card['id'];
					decklists: Decklist[];
				}[] = [];

				await Promise.all(
					identities.map(async (identity: Card) => {
						const decklists = await fetch(
							`${NRDB_API_URL}/decklists?filter[identity_card_id]=${identity.id}&page[size]=5`
						)
							.then((response) => response.json())
							.then((response) => response.data as Decklist[]);

						decklist_array.push({
							identity: identity.id,
							decklists: decklists
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
