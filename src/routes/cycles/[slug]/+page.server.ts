import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { ApiResponse, Cycle, Card } from '$lib/types';

export const load: PageServerLoad = async ({ cookies, fetch, params }) => {
    if (cookies.get('nrdb_cache') === '1') return { cycle: null, cards: null };

    const [cycle_res, cards_res] = await Promise.all([
        fetch(`${NRDB_API_URL}/card_cycles/${params.slug}`),
        fetch(`${NRDB_API_URL}/cards?filter[card_cycle_id]=${params.slug}&page[size]=1000`)
    ]);

    const cycle_json = await cycle_res.json();
    const cards_json: ApiResponse<Card> = await cards_res.json();

    return { cycle: cycle_json.data as Cycle, cards: cards_json.data };
};
