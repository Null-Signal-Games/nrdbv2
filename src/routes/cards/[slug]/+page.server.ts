import { NRDB_API_URL } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const cardResponse = await fetch(`${NRDB_API_URL}/cards/${params.slug}`);
	const cardData = await cardResponse.json();
	return {
		card: cardData.data,
		searchParams: url.searchParams.toString()
	};
};
