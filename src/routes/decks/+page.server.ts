import { NRDB_PRIVATE_API_URL } from '$lib/utils';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	if (!session || !session.accessToken) {
		throw redirect(302, '/');
	}

	const url = `${NRDB_PRIVATE_API_URL}/decks`;

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${session.accessToken}`
		}
	});

	console.log(response);

	if (response.status === 401) {
		throw redirect(302, '/');
	}

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();

	return {
		decks: data.data
	};
};
