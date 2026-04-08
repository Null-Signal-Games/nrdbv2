import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { ApiResponse, Illustrator } from '$lib/types';
import { cache_guard } from '$lib/server/guard';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const cold_data = await cache_guard(cookies, async () => {
		const [illustrators] = await Promise.all([
			fetch(`${NRDB_API_URL}/illustrators?page[size]=500`)
				.then((response) => response.json())
				.then((response) => response.data as ApiResponse<Illustrator>[])
		]);

		return { illustrators };
	});

	return {
		...(cold_data ?? {})
	};
};
