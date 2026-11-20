import { NRDB_API_URL } from '$lib/constants';
import { fetch_card_sets } from '$lib/server/card_sets';
import sanitize from 'sanitize-html';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const decklist_response = await fetch(`${NRDB_API_URL}/decklists?filter[id]=${params.id}`);
	const decklist = (await decklist_response.json()).data[0];

	if (!decklist) {
		throw error(404, 'Decklist not found');
	}

	const [identity, cards] = await Promise.all([
		fetch(`${NRDB_API_URL}/cards/${decklist.attributes.identity_card_id}`)
			.then((response) => response.json())
			.then((body) => body.data),
		fetch(`${NRDB_API_URL}/cards?filter[decklist_id]=${decklist.id}`)
			.then((response) => response.json())
			.then((body) => body.data)
	]);

	return {
		decklist,
		identity,
		cards,
		sets: await fetch_card_sets(fetch, cards ?? []),
		writeup: decklist.attributes.notes?.trim() ? sanitize(decklist.attributes.notes) : null
	};
};
