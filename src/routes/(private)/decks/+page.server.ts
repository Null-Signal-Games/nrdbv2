import { error } from '@sveltejs/kit';
import { fetch_private } from '$lib/server/private_api';
import type { PageServerLoad } from './$types';
import type { CollectionResponse, Decklist } from '$lib/types';

export const load: PageServerLoad = async (event) => {
	const response = await fetch_private(event, '/decks?sort=-updated_at');
	if (!response.ok) error(response.status, 'Your decks could not be loaded.');

	const { data: decks }: CollectionResponse<Decklist> = await response.json();

	return { tiles: decks.map((decklist) => ({ decklist })) };
};
