import { NRDB_API_URL } from '$lib/constants';
import { fail, isHttpError, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { isDeckFormat, type ActiveCardPoolIds } from '$lib/deck_formats';
import type {
	Card,
	CollectionResponse,
	Decklist,
	Faction,
	Format,
	SingleResponse
} from '$lib/types';
import { cache_guard } from '$lib/server/guard';
import { fetch_private } from '$lib/server/private_api';
import { localizeHref } from '$lib/paraglide/runtime';

const IDENTITY_TYPES = ['corp_identity', 'runner_identity'] as const;

const SIDE_PAGE_SIZE = 1500;

export const load: PageServerLoad = async ({ cookies, fetch, url }) => {
	const identityId = url.searchParams.get('identity');

	const coldData = await cache_guard(cookies, async () => {
		const [factions, formats, ...identityPages] = await Promise.all([
			fetch(`${NRDB_API_URL}/factions?page[size]=50`)
				.then((response) => response.json() as Promise<CollectionResponse<Faction>>)
				.then((response) => response.data),
			fetch(`${NRDB_API_URL}/formats?page[size]=50`)
				.then((response) => response.json() as Promise<CollectionResponse<Format>>)
				.then((response) => response.data),
			...IDENTITY_TYPES.map((card_type_id) =>
				fetch(`${NRDB_API_URL}/cards?filter[card_type_id]=${card_type_id}&page[size]=250`)
					.then((response) => response.json() as Promise<CollectionResponse<Card>>)
					.then((response) => response.data)
			)
		]);

		const active_card_pool_ids: ActiveCardPoolIds = {};
		for (const format of formats) {
			if (!isDeckFormat(format.id)) continue;

			active_card_pool_ids[format.id] = format.attributes.active_card_pool_id;
		}

		const cards = identityPages.flat();
		const identity = identityId ? cards.find((card) => card.id === identityId) : undefined;

		const sideCards = identity
			? await fetch(
					`${NRDB_API_URL}/cards?filter[side_id]=${identity.attributes.side_id}&page[size]=${SIDE_PAGE_SIZE}`
				)
					.then((response) => response.json() as Promise<CollectionResponse<Card>>)
					.then((response) => response.data)
			: [];

		return { factions, cards, side_cards: sideCards, active_card_pool_ids };
	});

	return {
		...(coldData ?? {})
	};
};

export const actions: Actions = {
	save: async (event) => {
		let draft;
		try {
			const { identity_card_id, side_id, card_slots } = JSON.parse(
				String((await event.request.formData()).get('draft'))
			);
			draft = { identity_card_id, side_id, card_slots };
		} catch {
			return fail(400, { message: 'The deck could not be read.' });
		}

		let id: string;
		try {
			const response = await fetch_private(event, '/decks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/vnd.api+json' },
				body: JSON.stringify({
					data: {
						type: 'decks',
						attributes: {
							...draft,
							name: 'Untitled deck',
							follows_basic_deckbuilding_rules: true,
							notes: '',
							tags: []
						}
					}
				})
			});
			if (!response.ok)
				return fail(response.status, { message: 'Your deck could not be saved.' });
			({ id } = ((await response.json()) as SingleResponse<Decklist>).data);
		} catch (cause) {
			if (isHttpError(cause)) return fail(cause.status, { message: cause.body.message });
			return fail(500, { message: 'Your deck could not be saved.' });
		}

		redirect(303, localizeHref(`/decks/${encodeURIComponent(id)}`));
	}
};
