import type { LayoutServerLoad } from './$types';
import { extractLocaleFromRequest, serverAsyncLocalStorage } from '$lib/paraglide/runtime';

export const load: LayoutServerLoad = async (event) => {
	const locale =
		serverAsyncLocalStorage?.getStore()?.locale ?? extractLocaleFromRequest(event.request);

	return {
		locale,
		session: await event.locals.auth()
	};
};
