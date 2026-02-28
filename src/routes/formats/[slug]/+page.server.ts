import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { Format } from '$lib/types';

export const load: PageServerLoad = async ({ cookies, fetch, params }) => {
	if (cookies.get('nrdb_cache') === '1') return { format: null };

	const res = await fetch(`${NRDB_API_URL}/formats/${params.slug}`);
	const json = await res.json();

	return { format: json.data as Format };
};
