import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
// import { error } from '@sveltejs/kit';
import type { Decklist, FactionIds, Review } from '$lib/types';
import type { Actions } from './$types';

export const load: PageServerLoad = async () => {
    const username = 'plural' // params.slug

    // TODO: implement proper user profile data and decklist (public user scoped) fetching
    // const user = fetch(`${NRDB_API_URL}/users/${params.slug}`)
    //     .then((r) => r.json())
    //     .then((r) => r.data),

    // TODO: handle user not found
    // if (!user) {
    //     throw error(302, 'User not found');
    // }

    return {
        // Mock data
        user: {
            name: "Plural",
            faction: "shaper" as FactionIds,
            reputation: 218,
            creation: "2016-03-20T10:10:00.000Z",
            donation: true,
            always_be_running_url: "https://alwaysberunning.net/profile/20581"
        },
        // TODO: Get current user session data and check if the current user is following the profile user
        meta: {
            is_following: true
        },
        decks: new Promise((resolve, reject) => {
            try {
                const decks = fetch(`${NRDB_API_URL}/decklists?filter[user_id]=${username}&page[size]=500`)
                    .then((r) => r.json())
                    .then((r) => r.data as Decklist[])
                resolve(decks);
            } catch (error) {
                reject(error);
            }
        }),
        reviews: new Promise((resolve, reject) => {
            // TODO: implement proper reviews fetching (as far as I can tell, you cannot query by username/user_id on the public API)

            // try {
            //     const reviews = fetch(`${NRDB_API_URL}/reviews?filter[user_id]=${username}`)
            //         .then((r) => r.json())
            //         .then((r) => r.data as Review[])
            //     resolve(reviews);
            // } catch (error) {
            //     reject(error);
            // }

            // Mock
            try {
                const reviews = fetch(`${NRDB_API_URL}/reviews/01`)
                    .then((r) => r.json())
                    .then((r) => r.data as Review[])
                resolve(reviews);
            } catch (error) {
                reject(error);
            }
        })
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