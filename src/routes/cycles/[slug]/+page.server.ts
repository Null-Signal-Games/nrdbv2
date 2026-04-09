import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { Cycle, Card } from '$lib/types';
import { cache_guard } from '$lib/server/guard';

export const load: PageServerLoad = async ({ cookies, fetch, params }) => {
    const cold_data = await cache_guard(cookies, async () => {
        const [cycles, cards] = await Promise.all([
            fetch(`${NRDB_API_URL}/card_cycles/${params.slug}`)
                .then((response) => response.json())
                .then((response) => response.data as Cycle[]),
            fetch(`${NRDB_API_URL}/cards?filter[card_cycle_id]=${params.slug}&page[size]=1000`)
                .then((response) => response.json())
                .then((response) => response.data as Card[])
        ]);

        return { cycles, cards };
    });

    return {
        ...(cold_data ?? {})
    };
};
