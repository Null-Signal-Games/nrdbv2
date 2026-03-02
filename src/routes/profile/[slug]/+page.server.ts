import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import type { ApiResponse, Decklist } from '$lib/types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	if (!session || !session.accessToken) {
		throw redirect(302, '/');
	}

	const [/* user, */ decks] = await Promise.all([
		// fetch(`${NRDB_API_URL}/users/${event.params.slug}`)
		//     .then((r) => r.json())
		//     .then((r) => r.data),
		fetch(`${NRDB_API_URL}/decklists?filter[user_id]=${event.params.slug}`)
			.then((r) => r.json())
			.then((r) => r.data as ApiResponse<Decklist[]>)
	]);

	// if (response.status === 401) {
	//     throw redirect(302, "/");
	// }
	//
	// if (!response.ok) {
	//     throw new Error(`HTTP error! status: ${response.status}`);
	// }

	return {
		// user,
		decks
	};
};
