import { describe, expect, it, vi } from 'vitest';
import type { Session } from '@auth/sveltekit';
import { fetch_private } from './private_api';

const event = (
	fetcher: typeof fetch,
	session: Partial<Session> | null = { accessToken: 'test-token' }
) =>
	({
		fetch: fetcher,
		locals: { auth: async () => session }
	}) as unknown as Parameters<typeof fetch_private>[0];

describe('fetch_private', () => {
	it('sends the access token to the private API', async () => {
		const fetcher = vi.fn().mockResolvedValueOnce(new Response());
		await fetch_private(event(fetcher), '/decks');
		const [url, options] = fetcher.mock.calls[0];
		expect(new URL(url).pathname).toBe('/api/v3/private/decks');
		expect(options.headers.get('Authorization')).toBe('Bearer test-token');
	});

	it('keeps the request options and headers it is given', async () => {
		const fetcher = vi.fn().mockResolvedValueOnce(new Response());
		await fetch_private(event(fetcher), '/decks', {
			method: 'POST',
			body: '{}',
			headers: { 'Content-Type': 'application/json' }
		});
		const [, options] = fetcher.mock.calls[0];
		expect(options.method).toBe('POST');
		expect(options.body).toBe('{}');
		expect(options.headers.get('Content-Type')).toBe('application/json');
		expect(options.headers.get('Authorization')).toBe('Bearer test-token');
	});

	it('returns error responses for the caller to handle', async () => {
		const response = new Response('', { status: 422 });
		const fetcher = vi.fn().mockResolvedValueOnce(response);
		expect(await fetch_private(event(fetcher), '/decks')).toBe(response);
	});

	it.each([
		['no session', null],
		['a rejected refresh token', { error: 'RefreshTokenError' as const }]
	])('requires reauthentication with %s', async (_label, session) => {
		const fetcher = vi.fn();
		await expect(fetch_private(event(fetcher, session), '/decks')).rejects.toMatchObject({
			status: 401
		});
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('asks to retry when a transient refresh failure left no access token', async () => {
		const fetcher = vi.fn();
		await expect(fetch_private(event(fetcher, {}), '/decks')).rejects.toMatchObject({
			status: 503
		});
		expect(fetcher).not.toHaveBeenCalled();
	});
});
