import { NRDB_API_URL } from '$lib/constants';
import type { Card, CollectionResponse, Set } from '$lib/types';

export const fetch_card_sets = async (fetcher: typeof fetch, cards: Card[]): Promise<Set[]> => {
	const set_ids = [...new Set(cards.flatMap((card) => card.attributes.card_set_ids ?? []))];
	if (set_ids.length === 0) return [];

	const sets_url = new URL(`${NRDB_API_URL}/card_sets`);
	sets_url.searchParams.set('filter[id]', set_ids.join(','));
	sets_url.searchParams.set('page[size]', '1000');

	const response = await fetcher(sets_url);
	if (!response.ok) {
		console.error(`Card sets request failed with status ${response.status}`);
		return [];
	}

	const { data: sets }: CollectionResponse<Set> = await response.json();
	return sets;
};
