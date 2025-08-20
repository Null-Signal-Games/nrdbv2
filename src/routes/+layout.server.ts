import { NRDB_API_URL } from '$lib/utils';
import type { LayoutServerLoad } from './$types';
import type { Card } from '$lib/types';

let cardCache: Card[] = [];

export const load: LayoutServerLoad = async ({ fetch }) => {
	if (cardCache.length > 0) return { cards: cardCache };

	const cardsResponse = await fetch(`${NRDB_API_URL}/cards?page[size]=50`);
	const cards: Card[] = (await cardsResponse.json()).data;

	cardCache = cards;

	return {
		cards
	};
};
