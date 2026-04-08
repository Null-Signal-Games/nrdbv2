import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { Illustrator, ApiResponse } from '$lib/types';

// https://api.netrunnerdb.com/api/v3/public/printings?filter[illustrator_id]=adam_s_doyle

export const load: PageServerLoad = async () => {
	const response = await fetch(`${NRDB_API_URL}/illustrators?page[size]=500`);
	const data: ApiResponse<Illustrator> = await response.json();

	return {
		illustrators: data.data
	};
};
