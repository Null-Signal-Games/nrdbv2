import { NRDB_API_URL } from '$lib/constants';
import type { CollectionResponse, Ruling } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		// https://svelte.dev/docs/kit/load#Streaming-with-promises
		// eslint-disable-next-line no-async-promise-executor
		rulings: new Promise(async (resolve, reject) => {
			try {
				const rulings = await fetch(`${NRDB_API_URL}/rulings?page[size]=50`)
					.then((response) => response.json() as Promise<CollectionResponse<Ruling>>)
					.then((response) => response.data);

				resolve(rulings);
			} catch (error) {
				reject(error);
			}
		})
	};
};
