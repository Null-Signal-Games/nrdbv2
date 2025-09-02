import { NRDB_API_URL } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const response = await fetch(`${NRDB_API_URL}/rulings/${params.slug}`);
	const data = await response.json();

	return {
		ruling: data.data
	};
};
