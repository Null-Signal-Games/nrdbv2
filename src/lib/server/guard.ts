import { NRDB_CACHE_COOKIE } from '$lib/constants';
import type { Cookies } from '@sveltejs/kit';

export const cache_guard = async <T>(cookies: Cookies, callback: () => Promise<T> | T) => {
	const cache = cookies.get(NRDB_CACHE_COOKIE) === '1';

	// if cache is set, skip callback
	if (cache) return undefined;

	return await callback();
};
