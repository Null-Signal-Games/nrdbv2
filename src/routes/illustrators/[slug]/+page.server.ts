import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const illustrator = await fetch(`${NRDB_API_URL}/illustrators/${params.slug}`);
	const printings = await fetch(
		`${NRDB_API_URL}/printings?filter[illustrator_id]=${params.slug}&page[size]=999`
	);

	const illustrator_data = await illustrator.json();
	const printings_data = await printings.json();

	return {
		illustrator: illustrator_data.data,
		printings: printings_data.data
	};
};
