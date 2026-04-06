import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { ApiResponse, Card, Decklist } from '$lib/types';

export const load: PageServerLoad = async ({ fetch }) => {
    return {
        // https://svelte.dev/docs/kit/load#Streaming-with-promises
        // eslint-disable-next-line no-async-promise-executor
        decklist_of_the_week: new Promise(async (resolve, reject) => {
            try {
                const decklists_response = await fetch(`${NRDB_API_URL}/decklists?page[size]=1`).then(
                    (response) => response.json() as Promise<ApiResponse<Decklist>>
                );

                if (!decklists_response.data || decklists_response.data.length === 0) {
                    throw new Error('No decklists found');
                }

                const first_decklist = decklists_response.data[0];

                const [identity_json, cards_json] = await Promise.all([
                    fetch(`${NRDB_API_URL}/cards/${first_decklist.attributes.identity_card_id}`).then(
                        (response) => response.json() as Promise<ApiResponse<Card>>
                    ),
                    fetch(`${NRDB_API_URL}/cards?filter[decklist_id]=${first_decklist.id}`).then(
                        (response) => response.json() as Promise<ApiResponse<Card>>
                    )
                ]);

                if (!identity_json.data || !cards_json.data) {
                    throw new Error('Incomplete decklist of the week data');
                }

                // await new Promise((resolve) => setTimeout(resolve, 5000));

                resolve({
                    identity: identity_json.data,
                    decklist: first_decklist,
                    cards: cards_json.data
                });
            }
            catch (error) {
                reject(error);
            }
        }),
        // https://svelte.dev/docs/kit/load#Streaming-with-promises
        // eslint-disable-next-line no-async-promise-executor
        decklists: new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`${NRDB_API_URL}/decklists?page[size]=10`);
                const json: ApiResponse<Decklist> = await response.json();
                resolve(json.data);
            }
            catch (error) {
                reject(error);
            }
        })
    };
};
