import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import { NRDB_CACHE_COOKIE } from '$lib/constants';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	// Client already has the sqlite DB in OPFS, let the page/component query it locally
	if (cookies.get(NRDB_CACHE_COOKIE) === '1') {
		return { factions: null };
	}

	// Cold load = no sqlite DB yet, fall back to the API for SSR
	const res = await fetch(`${NRDB_API_URL}/factions?page[size]=100`);
	if (!res.ok) return { factions: null };

	const json: { data: Array<{ id: string; attributes: { name: string } }> } = await res.json();

	return {
		factions: json.data.map((item) => ({
			id: item.id,
			name: item.attributes.name
		}))
	};
};
