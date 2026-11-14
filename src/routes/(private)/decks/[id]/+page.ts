import { error } from '@sveltejs/kit';
import { loadDeckCards } from '$lib/deck_cards';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ data }) => {
	if (data.cards && data.sets) return { ...data, cards: data.cards, sets: data.sets };

	const local = await loadDeckCards(Object.keys(data.deck.attributes.card_slots));
	if (!local) error(503, 'The card database is still loading. Try again.');

	return { ...data, ...local };
};
