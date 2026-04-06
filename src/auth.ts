import { SvelteKitAuth } from '@auth/sveltekit';
import {
	AUTH_KEYCLOAK_ISSUER,
	AUTH_CLIENT_NAME,
	AUTH_CLIENT_ID,
	AUTH_SECRET
} from '$env/static/private';

export const { handle, signIn, signOut } = SvelteKitAuth({
	trustHost: true,
	providers: [
		{
			id: AUTH_CLIENT_NAME,
			name: 'Null Signal Games',
			type: 'oidc',
			issuer: AUTH_KEYCLOAK_ISSUER,
			clientId: AUTH_CLIENT_ID,
			clientSecret: AUTH_SECRET
		}
	],
	callbacks: {
		async jwt({ token, account }) {
			if (account) {
				token.idToken = account.id_token;
				token.accessToken = account.access_token;
			}
			return token;
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken as string;
			session.idToken = token.idToken as string;
			return session;
		}
	}
});
