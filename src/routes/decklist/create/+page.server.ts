import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { Card, CollectionResponse, Faction } from '$lib/types';

export const load: PageServerLoad = async ({ fetch }) => {
    const [factions, cards] = await Promise.all([
        fetch(`${NRDB_API_URL}/factions?page[size]=50`)
            .then((response) => response.json() as Promise<CollectionResponse<Faction>>)
            .then((response) => response.data),
        fetch(
            `${NRDB_API_URL}/cards?filter[card_type_id]=corp_identity,runner_identity&page[size]=200`
        )
            .then((response) => response.json() as Promise<CollectionResponse<Card>>)
            .then((response) => response.data)
    ]);

    return { factions, cards };
};
