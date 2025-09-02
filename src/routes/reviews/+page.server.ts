import { NRDB_API_URL } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const response = await fetch(`${NRDB_API_URL}/reviews?page[size]=100`);
	const data = await response.json();

	return {
		reviews: data.data
	};
};
