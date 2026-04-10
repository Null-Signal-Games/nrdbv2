import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// TODO: implement proper query (default = popular)
	const response = await fetch(`${NRDB_API_URL}/decklists?page[size]=30&sort=-created_at`);
	const data = await response.json();

	return {
		decklists: data.data
	};
};
