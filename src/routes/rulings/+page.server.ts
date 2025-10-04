import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const response = await fetch(`${NRDB_API_URL}/rulings?page[size]=50`);
	const data = await response.json();

	return {
		rulings: data.data
	};
};
