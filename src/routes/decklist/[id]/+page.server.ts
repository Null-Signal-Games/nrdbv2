import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { Card } from '$lib/types';

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

	const _sets = [
		...new Set(
			cards_data.data?.flatMap((card: Card) => card.attributes.card_set_ids).filter(Boolean) ?? []
		)
	];

	const sets = await fetch(`${NRDB_API_URL}/card_sets?filter[card_cycle_id]=${_sets.join(',')}`);
	const sets_data = await sets.json();

	return {
		decklist: decklist_data.data[0],
		identity: identity_data.data,
		cards: cards_data.data,
		sets: sets_data.data
	};
};
