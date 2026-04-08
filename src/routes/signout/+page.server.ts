import { AUTH_KEYCLOAK_ISSUER } from '$env/static/private';
import { APP_URL } from '$lib/constants';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { dev } from '$app/environment';

export const actions: Actions = {
	default: async ({ url, locals, cookies }) => {
		const session = await locals.auth();
		const id_token = session?.idToken;

		// Manually clear all Auth.js session cookies
		for (const cookie of cookies.getAll()) {
			if (cookie.name.startsWith('authjs.')) {
				cookies.delete(cookie.name, { path: '/' });
			}
		}

		const params = new URLSearchParams({
			post_logout_redirect_uri: dev ? url.origin : APP_URL,
			...(id_token ? { id_token_hint: id_token } : {})
		});

		redirect(302, `${AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/logout?${params}`);
	}
};
