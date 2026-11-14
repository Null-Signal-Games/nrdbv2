import { NRDB_API_URL } from '$lib/constants';
import { fetch_card_sets } from '$lib/server/card_sets';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const decklist = await fetch(`${NRDB_API_URL}/decklists?filter[id]=${params.id}`);
	const decklist_data = await decklist.json();

	if (!decklist_data.data[0]) {
		throw error(404, 'Decklist not found');
	}

	const identity = await fetch(
		`${NRDB_API_URL}/cards/${decklist_data.data[0].attributes.identity_card_id}`
	);
	const identity_data = await identity.json();

	const cards = await fetch(
		`${NRDB_API_URL}/cards?filter[decklist_id]=${decklist_data.data[0].id}`
	);
	const cards_data = await cards.json();

	return {
		decklist: decklist_data.data[0],
		identity: identity_data.data,
		cards: cards_data.data,
		sets: await fetch_card_sets(fetch, cards_data.data ?? [])
	};
};
