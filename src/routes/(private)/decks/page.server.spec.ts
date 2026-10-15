import { describe, expect, it, vi } from 'vitest';
import { load } from './+page.server';
import type { PageServerLoad } from './$types';
import { privateDeck } from '../../../stories/decklist.fixture';

const response = (data: unknown) => new Response(JSON.stringify({ data }));
const event = (fetcher: typeof fetch) =>
	({
		fetch: fetcher,
		locals: { auth: async () => ({ accessToken: 'test-token' }) }
	}) as unknown as Parameters<PageServerLoad>[0];

describe('saved deck list', () => {
	it('loads private decks sorted by most recently updated', async () => {
		const fetcher = vi.fn().mockResolvedValueOnce(response([privateDeck]));
		expect(await load(event(fetcher))).toEqual({
			tiles: [{ decklist: privateDeck }]
		});
		const url = new URL(fetcher.mock.calls[0][0]);
		expect(url.pathname).toBe('/api/v3/private/decks');
		expect(url.searchParams.get('sort')).toBe('-updated_at');
	});

	it.each([401, 500])('passes through a %i response from the API', async (status) => {
		const fetcher = vi.fn().mockResolvedValue(new Response('', { status }));
		await expect(load(event(fetcher))).rejects.toMatchObject({ status });
	});
});
