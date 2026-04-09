import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { Format } from '$lib/types';
import { cache_guard } from '$lib/server/guard';

export const load: PageServerLoad = async ({ cookies, fetch, params }) => {
	const cold_data = await cache_guard(cookies, async () => {
		const [format] = await Promise.all([
			fetch(`${NRDB_API_URL}/formats/${params.slug}`)
				.then((response) => response.json())
				.then((response) => response.data as Format)
		]);

		return { format };
	});

	return {
		...(cold_data ?? {})
	};
};
