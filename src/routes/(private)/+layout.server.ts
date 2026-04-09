import type { LayoutServerLoad } from './$types';
import { NRDB_PRIVATE_API_URL } from '$lib/constants';
import type { ApiResponse, Decklist } from '$lib/types';

export const load: LayoutServerLoad = async (event) => {
    const session = await event.locals.auth();

    if (!session?.accessToken) {
        return {
            decks: []
        };
    }

    const res = await event.fetch(`${NRDB_PRIVATE_API_URL}/decklists`, {
        headers: {
            Authorization: `Bearer ${session.accessToken}`
        }
    });

    if (res.status === 401) {
        return {
            decks: []
        };
    }

    if (!res.ok) {
        console.error(`HTTP error! status: ${res.status}`);
        return {
            decks: []
        };
    }

    const decks = (await res.json()) as ApiResponse<Decklist[]>;

    return { decks: decks.data };
};
