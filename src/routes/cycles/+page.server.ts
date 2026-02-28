import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { ApiResponse, Cycle } from '$lib/types';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
    if (cookies.get('nrdb_cache') === '1') return { cycles: null };

    const res = await fetch(`${NRDB_API_URL}/card_cycles?page[size]=100`);
    const json: ApiResponse<Cycle> = await res.json();

    return { cycles: json.data };
};
