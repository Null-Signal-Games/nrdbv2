import { error } from '@sveltejs/kit';
import { NRDB_API_URL } from '$lib/constants';
import { fetch_card_sets } from '$lib/server/card_sets';
import { fetch_private } from '$lib/server/private_api';
import type { PageServerLoad } from './$types';
import type { Card, CollectionResponse, Decklist, SingleResponse } from '$lib/types';

export const load: PageServerLoad = async (event) => {
	const response = await fetch_private(event, `/decks/${encodeURIComponent(event.params.id)}`);
	if (!response.ok) error(response.status, 'Your deck could not be loaded.');

	const { data: deck }: SingleResponse<Decklist> = await response.json();

	const cards_url = new URL(`${NRDB_API_URL}/cards`);
	cards_url.searchParams.set('filter[id]', Object.keys(deck.attributes.card_slots).join(','));
	cards_url.searchParams.set('page[size]', '1000');

	const cards_response = await event.fetch(cards_url);
	if (!cards_response.ok) {
		console.error(`Cards request for saved deck failed with status ${cards_response.status}`);
		error(502, 'The cards in your deck could not be loaded. Try again.');
	}

	const { data: cards }: CollectionResponse<Card> = await cards_response.json();

	return { deck, cards, sets: await fetch_card_sets(event.fetch, cards) };
};
