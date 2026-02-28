import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { ApiResponse, Set, Cycle } from '$lib/types';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
    if (cookies.get('nrdb_cache') === '1') return { sets: null, cycles: null };

    const [sets_res, cycles_res] = await Promise.all([
        fetch(`${NRDB_API_URL}/card_sets?page[size]=100`),
        fetch(`${NRDB_API_URL}/card_cycles?page[size]=100`)
    ]);

    const sets_json: ApiResponse<Set> = await sets_res.json();
    const cycles_json: ApiResponse<Cycle> = await cycles_res.json();

    return { sets: sets_json.data, cycles: cycles_json.data };
};
