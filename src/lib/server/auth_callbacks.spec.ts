import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAuthCallbacks, EXPIRY_BUFFER_SECONDS } from './auth_callbacks';

const nowSeconds = 1_800_000_000;
const tokenLifetimeSeconds = 300;
const oldToken = {
	sub: 'test-user',
	accessToken: 'old-access',
	refreshToken: 'old-refresh',
	idToken: 'old-id',
	expiresAt: nowSeconds - 1
};
const refreshed = {
	access_token: 'new-access',
	refresh_token: 'new-refresh',
	id_token: 'new-id',
	expires_in: tokenLifetimeSeconds
};
const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });

function setup(fetcher = vi.fn().mockResolvedValue(response(refreshed))) {
	const callbacks = createAuthCallbacks({
		issuer: 'https://identity.test/realms/test/',
		clientId: 'test-client',
		clientSecret: 'test-secret',
		fetcher
	});
	const jwt = callbacks.jwt!;
	const run = (
		token: Parameters<typeof jwt>[0]['token'] = oldToken,
		account?: Record<string, unknown>
	) =>
		jwt({
			token,
			user: { id: 'test-user' },
			account: account
				? { provider: 'test', providerAccountId: 'test-user', type: 'oidc', ...account }
				: null
		});
	return { callbacks, fetcher, run };
}

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(nowSeconds * 1000);
});
afterEach(() => {
	vi.clearAllTimers();
	vi.useRealTimers();
});

describe('Keycloak token refresh', () => {
	it('persists the refresh token and expiry on login', async () => {
		const { run, fetcher } = setup();
		expect(
			await run(oldToken, {
				access_token: 'login-access',
				refresh_token: 'login-refresh',
				id_token: 'login-id',
				expires_at: nowSeconds + tokenLifetimeSeconds
			})
		).toMatchObject({
			accessToken: 'login-access',
			refreshToken: 'login-refresh',
			idToken: 'login-id',
			expiresAt: nowSeconds + tokenLifetimeSeconds
		});
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('reuses an access token that expires more than thirty seconds from now', async () => {
		const { run, fetcher } = setup();
		const token = { ...oldToken, expiresAt: nowSeconds + EXPIRY_BUFFER_SECONDS + 1 };
		expect(await run(token)).toEqual(token);
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('exchanges an expired token server-side and stores the rotated tokens', async () => {
		const { run, fetcher } = setup();
		const token = await run();
		expect(token).toMatchObject({
			sub: 'test-user',
			accessToken: 'new-access',
			refreshToken: 'new-refresh',
			idToken: 'new-id',
			expiresAt: nowSeconds + tokenLifetimeSeconds
		});
		const [url, options] = fetcher.mock.calls[0];
		expect(url).toBe('https://identity.test/realms/test/protocol/openid-connect/token');
		expect(options.method).toBe('POST');
		expect(Object.fromEntries(options.body)).toEqual({
			grant_type: 'refresh_token',
			client_id: 'test-client',
			client_secret: 'test-secret',
			refresh_token: 'old-refresh'
		});
	});

	it('refreshes within thirty seconds of expiry', async () => {
		const { run, fetcher } = setup();
		const token = { ...oldToken, expiresAt: nowSeconds + EXPIRY_BUFFER_SECONDS };
		expect(await run(token)).toMatchObject({ accessToken: 'new-access' });
		expect(fetcher).toHaveBeenCalledTimes(1);
	});

	it('preserves refresh and ID tokens when Keycloak does not replace them', async () => {
		const { run } = setup(
			vi
				.fn()
				.mockResolvedValue(
					response({ access_token: 'new-access', expires_in: tokenLifetimeSeconds })
				)
		);
		expect(await run()).toMatchObject({
			accessToken: 'new-access',
			refreshToken: 'old-refresh',
			idToken: 'old-id'
		});
	});

	it.each([
		['revoked refresh token', () => response({ error: 'invalid_grant' }, 400)],
		['rejected client credentials', () => response({ error: 'invalid_client' }, 401)],
		['malformed response', () => response({ access_token: 'new-access' })]
	])('signs out after %s', async (_label, result) => {
		const { run, fetcher } = setup(vi.fn().mockImplementation(result));
		expect(await run()).toBeNull();
		expect(fetcher).toHaveBeenCalledTimes(1);
	});

	it.each([
		['network failure', () => Promise.reject(new Error('Network unavailable'))],
		['timeout', () => Promise.reject(new DOMException('Timed out', 'TimeoutError'))],
		['server error', () => response({ error: 'unknown_error' }, 503)],
		['unparseable response', () => new Response('<html>Bad gateway</html>', { status: 200 })]
	])('retries on the next request after a %s', async (_label, result) => {
		const fetcher = vi
			.fn()
			.mockImplementationOnce(result)
			.mockResolvedValue(response(refreshed));
		const { run } = setup(fetcher);
		const token = await run();
		expect(token).toMatchObject({ accessToken: undefined, refreshToken: 'old-refresh' });
		const retried = await run(token!);
		expect(retried).toMatchObject({ accessToken: 'new-access' });
		expect(fetcher).toHaveBeenCalledTimes(2);
	});

	it('signs out legacy sessions without a refresh token', async () => {
		const { run, fetcher } = setup();
		expect(await run({ ...oldToken, refreshToken: undefined })).toBeNull();
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('exposes the access token but keeps the refresh token out of the client session', async () => {
		const { callbacks } = setup();
		const sessionCallback = callbacks.session!;
		const session = await sessionCallback({
			session: { user: { name: 'Test' }, expires: 'future' },
			token: oldToken
		} as unknown as Parameters<typeof sessionCallback>[0]);
		expect(session).toMatchObject({ accessToken: 'old-access', idToken: 'old-id' });
		expect(session).not.toHaveProperty('refreshToken');
	});
});
