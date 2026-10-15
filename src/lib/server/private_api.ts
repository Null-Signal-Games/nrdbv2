import { error, type RequestEvent } from '@sveltejs/kit';
import { NRDB_PRIVATE_API_URL } from '$lib/constants';

// fetch with the user's access token
export const fetch_private = async (
	event: Pick<RequestEvent, 'locals' | 'fetch'>,
	path: string,
	init: RequestInit = {}
): Promise<Response> => {
	const session = await event.locals.auth();
	if (!session || session.error === 'RefreshTokenError') error(401, 'Sign in to continue.');
	if (!session.accessToken) error(503, 'Your session could not be refreshed. Try again.');

	const headers = new Headers(init.headers);
	headers.set('Authorization', `Bearer ${session.accessToken}`);
	return event.fetch(`${NRDB_PRIVATE_API_URL}${path}`, { ...init, headers });
};
