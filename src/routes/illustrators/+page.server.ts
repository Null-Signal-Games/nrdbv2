import { NRDB_API_URL } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const response = await fetch(`${NRDB_API_URL}/illustrators?page[size]=500`);
	const data = await response.json();

	return {
		illustrators: data.data
	};
};
