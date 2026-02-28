import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { ApiResponse, Faction } from '$lib/types';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
    if (cookies.get('nrdb_cache') === '1') return { factions: null };

    const res = await fetch(`${NRDB_API_URL}/factions?page[size]=100`);
    const json: ApiResponse<Faction> = await res.json();

    return { factions: json.data };
};
