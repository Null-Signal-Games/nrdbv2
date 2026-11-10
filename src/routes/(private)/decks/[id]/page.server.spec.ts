import { describe, expect, it, vi } from 'vitest';
import { load } from './+page.server';
import { NRDB_CACHE_COOKIE } from '$lib/constants';
import type { PageServerLoad } from './$types';
import { privateDeck as deck, cards as fixture_cards } from '../../../../stories/decklist.fixture';

const cards = fixture_cards.map((card) => ({
	...card,
	attributes: { ...card.attributes, card_set_ids: ['system_gateway'] }
}));

const sets = [{ id: 'system_gateway' }];
const response = (data: unknown) => new Response(JSON.stringify({ data }));
const event = (fetcher: typeof fetch) =>
	({
		fetch: fetcher,
		cookies: {
			get: (name: string) => (name === NRDB_CACHE_COOKIE ? '1' : undefined)
		},
		locals: { auth: async () => ({ accessToken: 'test-token' }) },
		params: { id: deck.id }
	}) as unknown as Parameters<PageServerLoad>[0];

describe('saved deck detail', () => {
	it('loads the deck and its cards with the cache cookie set', async () => {
		const fetcher = vi
			.fn()
			.mockResolvedValueOnce(response(deck))
			.mockResolvedValueOnce(response(cards))
			.mockResolvedValueOnce(response(sets));
		expect(await load(event(fetcher))).toEqual({ deck, cards, sets });
		expect(new URL(fetcher.mock.calls[0][0]).pathname).toBe(`/api/v3/private/decks/${deck.id}`);
		const cards_url = new URL(fetcher.mock.calls[1][0]);
		expect(cards_url.pathname).toBe('/api/v3/public/cards');
		expect(new Set(cards_url.searchParams.get('filter[id]')?.split(','))).toEqual(
			new Set(cards.map((card) => card.id))
		);
		const sets_url = new URL(fetcher.mock.calls[2][0]);
		expect(sets_url.pathname).toBe('/api/v3/public/card_sets');
		expect(sets_url.searchParams.get('filter[id]')).toBe('system_gateway');
	});

	it('leaves the sets empty when the public set API fails', async () => {
		const console_error = vi.spyOn(console, 'error').mockImplementation(() => {});
		const fetcher = vi
			.fn()
			.mockResolvedValueOnce(response(deck))
			.mockResolvedValueOnce(response(cards))
			.mockResolvedValueOnce(new Response('', { status: 500 }));
		try {
			expect(await load(event(fetcher))).toEqual({ deck, cards, sets: [] });
		} finally {
			console_error.mockRestore();
		}
	});

	it('returns 502 when the public card API fails', async () => {
		const console_error = vi.spyOn(console, 'error').mockImplementation(() => {});
		const fetcher = vi
			.fn()
			.mockResolvedValueOnce(response(deck))
			.mockResolvedValueOnce(new Response('', { status: 500 }));
		try {
			await expect(load(event(fetcher))).rejects.toMatchObject({ status: 502 });
		} finally {
			console_error.mockRestore();
		}
	});

	it('passes through a 404 from the API', async () => {
		const fetcher = vi.fn().mockResolvedValue(new Response('', { status: 404 }));
		await expect(load(event(fetcher))).rejects.toMatchObject({ status: 404 });
	});
});
