import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { Cycle, SQLite } from '$lib/types';
import { cache_guard } from '$lib/server/guard';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const cold_data = await cache_guard(cookies, async () => {
		const [cycles] = await Promise.all([
			fetch(`${NRDB_API_URL}/card_cycles?page[size]=100`)
				.then((response) => response.json())
				.then((response) => response.data as SQLite<Cycle, 'attributes'>)
		]);

		return { cycles };
	});

	return {
		...(cold_data ?? {})
	};
};
