import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { Printing, Illustrator } from '$lib/types';
import { cache_guard } from '$lib/server/guard';

export const load: PageServerLoad = async ({ cookies, params, fetch }) => {
	const cold_data = await cache_guard(cookies, async () => {
		const [printings] = await Promise.all([
			fetch(`${NRDB_API_URL}/printings?filter[illustrator_id]=${params.slug}&page[size]=999`)
				.then((response) => response.json())
				.then((response) => response.data as Printing[])
		]);

		return { printings };
	});

	const illustrator = await fetch(`${NRDB_API_URL}/illustrators/${params.slug}`)
		.then((response) => response.json())
		.then((response) => response.data as Illustrator);

	return {
		illustrator,
		...(cold_data ?? {})
	};
};
