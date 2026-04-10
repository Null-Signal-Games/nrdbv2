import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { Format } from '$lib/types';
import { cache_guard } from '$lib/server/guard';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const cold_data = await cache_guard(cookies, async () => {
		const [formats] = await Promise.all([
			fetch(`${NRDB_API_URL}/formats?page[size]=20`)
				.then((response) => response.json())
				.then((response) => response.data as Format[])
		]);

		return { formats };
	});

	return {
		...(cold_data ?? {})
	};
};
