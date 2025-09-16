import { SvelteKitAuth } from '@auth/sveltekit';
import { AUTH_CLIENT_ID, AUTH_CLIENT_SECRET } from '$env/static/private';

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [
		{
			id: 'nsg-keycloak',
			name: 'Null Signal Games',
			type: 'oidc',
			issuer: 'https://draft-id.nullsignal.games/realms/nullsignal',
			clientId: AUTH_CLIENT_ID,
			clientSecret: AUTH_CLIENT_SECRET
		}
	],
	callbacks: {
		async jwt({ token, account }) {
			if (account) {
				token.accessToken = account.access_token;
			}
			return token;
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken as string;
			return session;
		}
	}
});
