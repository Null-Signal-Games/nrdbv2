import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { ApiResponse, Format } from '$lib/types';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
    if (cookies.get('nrdb_cache') === '1') return { formats: null };

    const res = await fetch(`${NRDB_API_URL}/formats?page[size]=20`);
    const json: ApiResponse<Format> = await res.json();

    return { formats: json.data };
};
