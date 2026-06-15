import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { CollectionResponse, Decklist, FactionIds, Review } from '$lib/types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const username = params.slug;

	const userResponse = await fetch(`${NRDB_API_URL}/users/${encodeURIComponent(username)}`).then(
		(response) =>
			response.json() as Promise<
				CollectionResponse<{
					id: string;
					attributes: {
						username: string;
						side_id: string | null;
						faction_id: string | null;
						reputation: number;
						created_at: string;
						donation: number | boolean;
						always_be_running_url: string | null;
					};
				}>
			>
	);

	const apiUser = userResponse.data[0];
	if (!apiUser) {
		throw error(404, 'User not found');
	}

	const user = {
		name: apiUser.attributes.username,
		faction: (apiUser.attributes.faction_id ?? 'neutral_corp') as FactionIds,
		reputation: apiUser.attributes.reputation,
		creation: apiUser.attributes.created_at,
		donation: Boolean(apiUser.attributes.donation),
		always_be_running_url: apiUser.attributes.always_be_running_url
	};

	// TODO: Get current user session data and check if the current user is following the profile user
	const meta = {
		is_following: false
	};

	return {
		user,
		meta,
		decks: fetch(`${NRDB_API_URL}/decklists?filter[user_id]=${username}&page[size]=500`)
			.then((response) => response.json() as Promise<CollectionResponse<Decklist>>)
			.then((r) => r.data),
		// TODO: implement proper reviews fetching (the public API does not support
		// filtering reviews by user, so this is intentionally left as an empty list
		// until either the API grows a filter or we hit an authenticated endpoint).
		reviews: Promise.resolve([] as Review[])
	};
};

export const actions = {
	follow: async () => {
		// TODO: implement follow func (requires user session/auth)
		console.log('follow user');
	},
	unfollow: async () => {
		// TODO: implement unfollow func (requires user session/auth)
		console.log('unfollow user');
	}
} satisfies Actions;
