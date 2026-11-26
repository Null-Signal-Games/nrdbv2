import type { SvelteKitAuthConfig } from '@auth/sveltekit';

type Callbacks = NonNullable<SvelteKitAuthConfig['callbacks']>;
type JwtCallback = NonNullable<Callbacks['jwt']>;
type Token = Parameters<JwtCallback>[0]['token'] & {
	accessToken?: string;
	idToken?: string;
	refreshToken?: string;
	expiresAt?: number;
};

interface Options {
	issuer: string;
	clientId: string;
	clientSecret: string;
	fetcher?: typeof fetch;
}

export const EXPIRY_BUFFER_SECONDS = 30;

async function refreshAccessToken(
	{ issuer, clientId, clientSecret, fetcher = fetch }: Options,
	token: Token
): Promise<Token | null> {
	const unavailable: Token = { ...token, accessToken: undefined };

	let response: Response;
	let result;
	try {
		response = await fetcher(`${issuer.replace(/\/$/, '')}/protocol/openid-connect/token`, {
			method: 'POST',
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				client_id: clientId,
				client_secret: clientSecret,
				refresh_token: token.refreshToken!
			}),
			signal: AbortSignal.timeout(10_000)
		});
		if (response.status === 400 || response.status === 401) return null;
		if (!response.ok) return unavailable;
		result = await response.json();
	} catch {
		return unavailable;
	}
	if (!result.access_token || !result.expires_in) return null;

	return {
		...token,
		accessToken: result.access_token,
		refreshToken: result.refresh_token ?? token.refreshToken,
		idToken: result.id_token ?? token.idToken,
		expiresAt: Math.floor(Date.now() / 1000) + result.expires_in
	};
}

export function createAuthCallbacks(options: Options): Callbacks {
	return {
		async jwt({ token, account }) {
			const saved = token as Token;
			if (account) {
				return {
					...saved,
					idToken: account.id_token,
					accessToken: account.access_token,
					refreshToken: account.refresh_token,
					expiresAt: account.expires_at
				};
			}
			if (
				saved.accessToken &&
				saved.expiresAt &&
				Date.now() / 1000 < saved.expiresAt - EXPIRY_BUFFER_SECONDS
			) {
				return saved;
			}
			if (!saved.refreshToken) {
				return null;
			}
			return refreshAccessToken(options, saved);
		},
		async session({ session, token }) {
			const saved = token as Token;
			session.accessToken = saved.accessToken;
			session.idToken = saved.idToken;
			return session;
		}
	};
}
