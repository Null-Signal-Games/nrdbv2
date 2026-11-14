import { describe, expect, it, vi } from 'vitest';
import type { Card } from '$lib/types';
import { fetch_card_sets } from './card_sets';

const card = (card_set_ids: string[]) => ({ attributes: { card_set_ids } }) as unknown as Card;

const sets_response = (ids: string[]) =>
	Response.json({ data: ids.map((id) => ({ id, type: 'card_sets', attributes: {} })) });

describe('fetch_card_sets', () => {
	it('requests each set once', async () => {
		const fetcher = vi.fn().mockResolvedValueOnce(sets_response(['core', 'midnight_sun']));

		const sets = await fetch_card_sets(fetcher, [
			card(['core', 'midnight_sun']),
			card(['core'])
		]);

		const url: URL = fetcher.mock.calls[0][0];
		expect(url.pathname).toBe('/api/v3/public/card_sets');
		expect(url.searchParams.get('filter[id]')).toBe('core,midnight_sun');
		expect(sets.map((set) => set.id)).toEqual(['core', 'midnight_sun']);
	});

	it('makes no request when the cards have no sets', async () => {
		const fetcher = vi.fn();
		expect(await fetch_card_sets(fetcher, [])).toEqual([]);
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('returns no sets when the request fails', async () => {
		const console_error = vi.spyOn(console, 'error').mockImplementation(() => {});
		try {
			const fetcher = vi.fn().mockResolvedValueOnce(new Response(null, { status: 500 }));
			expect(await fetch_card_sets(fetcher, [card(['core'])])).toEqual([]);
		} finally {
			console_error.mockRestore();
		}
	});
});
