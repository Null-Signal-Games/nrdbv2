import { describe, expect, it, vi } from 'vitest';
import { privateDeck as deck } from '../../../stories/decklist.fixture';
import { actions } from './+page.server';
import type { RequestEvent } from './$types';

const draft = {
	identity_card_id: 'haas_bioroid_precision_design',
	side_id: 'corp',
	card_slots: { hedge_fund: 3, seamless_launch: 3 }
};

const response = (data: unknown, status = 200) =>
	new Response(JSON.stringify({ data }), { status });

const event = (
	fetcher: typeof fetch,
	value: string | null = JSON.stringify(draft),
	session: unknown = { accessToken: 'token' }
) => {
	const body = new FormData();
	if (value !== null) body.set('draft', value);
	return {
		fetch: fetcher,
		locals: { auth: async () => session },
		request: new Request('http://localhost/', { method: 'POST', body })
	} as unknown as RequestEvent;
};

describe('save deck', () => {
	it('creates the deck and opens it', async () => {
		const fetcher = vi.fn().mockResolvedValueOnce(response({ ...deck, id: 'new-deck' }, 201));

		await expect(actions.save(event(fetcher))).rejects.toMatchObject({
			status: 303,
			location: '/decks/new-deck'
		});

		const [url, init] = fetcher.mock.calls[0];
		expect(new URL(url).pathname).toBe('/api/v3/private/decks');
		expect(init.method).toBe('POST');
		expect(new Headers(init.headers).get('Content-Type')).toBe('application/vnd.api+json');
		expect(JSON.parse(init.body)).toEqual({
			data: {
				type: 'decks',
				attributes: {
					...draft,
					name: 'Untitled deck',
					follows_basic_deckbuilding_rules: true,
					notes: '',
					tags: []
				}
			}
		});
	});

	it.each([
		['no draft', null],
		['invalid JSON', '{']
	])('refuses %s', async (_, value) => {
		const fetcher = vi.fn();

		expect(await actions.save(event(fetcher, value))).toMatchObject({ status: 400 });
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('reports the status when the API refuses the deck', async () => {
		const fetcher = vi.fn().mockResolvedValueOnce(response(null, 422));
		expect(await actions.save(event(fetcher))).toMatchObject({ status: 422 });
	});

	it('returns a failure instead of throwing when the API is unreachable', async () => {
		const fetcher = vi.fn().mockRejectedValueOnce(new TypeError('fetch failed'));
		expect(await actions.save(event(fetcher))).toMatchObject({
			status: 500,
			data: { message: 'Your deck could not be saved.' }
		});
	});

	it('returns 401 without a session', async () => {
		const fetcher = vi.fn();
		expect(await actions.save(event(fetcher, undefined, null))).toMatchObject({
			status: 401,
			data: { message: 'Sign in to continue.' }
		});
		expect(fetcher).not.toHaveBeenCalled();
	});
});
