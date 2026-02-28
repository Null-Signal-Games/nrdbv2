import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { ApiResponse, Set, Card } from '$lib/types';

export const load: PageServerLoad = async ({ cookies, fetch, params }) => {
	if (cookies.get('nrdb_cache') === '1') return { set: null, cards: null };

	const [set_res, cards_res] = await Promise.all([
		fetch(`${NRDB_API_URL}/card_sets/${params.slug}`),
		fetch(`${NRDB_API_URL}/cards?filter[card_set_id]=${params.slug}&page[size]=1000`)
	]);

	const set_json = await set_res.json();
	const cards_json: ApiResponse<Card> = await cards_res.json();

	return { set: set_json.data as Set, cards: cards_json.data };
};
