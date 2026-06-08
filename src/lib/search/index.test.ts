import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Card } from '$lib/api.types';
import type { UnifiedCardRow } from '$lib/sqlite.types';

// Mock the DB layer so the vocabulary-loading queries in initSearchVocab are controllable.
const { sqlMock, interpretSearchMock, translateToQueryMock, adaptCardMock } = vi.hoisted(() => ({
	sqlMock: vi.fn(),
	interpretSearchMock: vi.fn(),
	translateToQueryMock: vi.fn(),
	adaptCardMock: vi.fn()
}));
vi.mock('$lib/sqlite', () => ({ sql: sqlMock }));
vi.mock('$lib/search/interpret', () => ({ interpretSearch: interpretSearchMock }));
vi.mock('$lib/search/translate', () => ({ translateToQuery: translateToQueryMock }));
vi.mock('$lib/adapter', () => ({ adaptCard: adaptCardMock }));

import { prepareSearch, searchCards } from './index';

function mockSuccessfulSearch() {
	const row = { id: 'row-1' } as UnifiedCardRow;
	const card = { id: 'card-1' } as Card;

	translateToQueryMock.mockReturnValue({
		sql: 'SELECT * FROM unified_cards LIMIT ?',
		params: ['translated-param', 5],
		error: null
	});
	sqlMock.mockResolvedValue([row]);
	adaptCardMock.mockReturnValue(card);

	return { row, card };
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe('searchCards', () => {
	beforeEach(() => {
		sqlMock.mockReset();
		interpretSearchMock.mockReset();
		translateToQueryMock.mockReset();
		adaptCardMock.mockReset();
	});

	it('defaults to literal mode and bypasses interpretSearch', async () => {
		const { row, card } = mockSuccessfulSearch();

		const result = await searchCards('f:shaper s:console');

		expect(interpretSearchMock).not.toHaveBeenCalled();
		expect(translateToQueryMock).toHaveBeenCalledWith('f:shaper s:console', 5);
		expect(sqlMock).toHaveBeenCalledWith(
			'SELECT * FROM unified_cards LIMIT ?',
			'translated-param',
			5
		);
		expect(adaptCardMock.mock.calls[0][0]).toBe(row);
		expect(result).toEqual({ cards: [card], error: null });
	});

	it('interpreted mode calls interpretSearch before translation', async () => {
		mockSuccessfulSearch();
		interpretSearchMock.mockReturnValue('f:shaper s:console');

		await searchCards('shaper consoles', { mode: 'interpreted' });

		expect(interpretSearchMock).toHaveBeenCalledWith('shaper consoles');
		expect(translateToQueryMock).toHaveBeenCalledWith('f:shaper s:console', 5);
	});

	it('returns empty cards and the internal error for invalid literal syntax', async () => {
		const error = new Error('Unknown keyword: zzz');
		translateToQueryMock.mockReturnValue({ sql: null, params: [], error });

		const result = await searchCards('zzz:foo');

		expect(result).toEqual({ cards: [], error });
		expect(sqlMock).not.toHaveBeenCalled();
		expect(adaptCardMock).not.toHaveBeenCalled();
	});

	it('preserves custom limit behavior through the options object', async () => {
		mockSuccessfulSearch();

		await searchCards('corroder', { limit: 25 });

		expect(translateToQueryMock).toHaveBeenCalledWith('corroder', 25);
	});
});

describe('prepareSearch', () => {
	beforeEach(() => {
		sqlMock.mockReset();
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	it('does not signal ready until vocab initialization resolves', async () => {
		let resolveSql!: (rows: unknown[]) => void;
		sqlMock.mockReturnValue(
			new Promise<unknown[]>((resolve) => {
				resolveSql = resolve;
			})
		);

		let ready = false;
		const done = prepareSearch(() => {
			ready = true;
		});

		// Vocab is still pending: readiness must not have been signaled yet.
		await Promise.resolve();
		expect(ready).toBe(false);

		resolveSql([]);
		await done;
		expect(ready).toBe(true);
	});

	it('still signals ready when vocab initialization fails', async () => {
		sqlMock.mockRejectedValue(new Error('db unavailable'));

		let ready = false;
		await prepareSearch(() => {
			ready = true;
		});

		expect(ready).toBe(true);
	});
});
