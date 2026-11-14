import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Card } from '$lib/api.types';
import type { UnifiedCardRow } from '$lib/sqlite.types';

// Mock the DB layer so the vocabulary-loading queries in initSearchVocab are controllable.
const { sqlMock, interpretMock, compileExpressionMock, adaptCardMock } = vi.hoisted(() => ({
	sqlMock: vi.fn(),
	interpretMock: vi.fn(),
	compileExpressionMock: vi.fn(),
	adaptCardMock: vi.fn()
}));
vi.mock('$lib/sqlite', () => ({ sql: sqlMock }));
vi.mock('$lib/search/interpret', () => ({ interpret: interpretMock }));
vi.mock('$lib/search/compile', () => ({ compileExpression: compileExpressionMock }));
vi.mock('$lib/adapter', () => ({ adaptCard: adaptCardMock }));

import { prepareSearch, searchCards } from './index';

function mockSuccessfulSearch() {
	const row = { id: 'row-1' } as UnifiedCardRow;
	const card = { id: 'card-1' } as Card;

	compileExpressionMock.mockReturnValue({
		sql: 'SELECT * FROM unified_cards LIMIT ?',
		params: ['compiled-param', 5],
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
		interpretMock.mockReset();
		compileExpressionMock.mockReset();
		adaptCardMock.mockReset();
	});

	it('defaults to literal mode and bypasses interpret', async () => {
		const { row, card } = mockSuccessfulSearch();

		const result = await searchCards('f:shaper s:console');

		expect(interpretMock).not.toHaveBeenCalled();
		expect(compileExpressionMock).toHaveBeenCalledWith('f:shaper s:console', {});
		expect(sqlMock).toHaveBeenCalledWith(
			'SELECT * FROM unified_cards LIMIT ?',
			'compiled-param',
			5
		);
		expect(adaptCardMock.mock.calls[0][0]).toBe(row);
		expect(result).toEqual({ cards: [card], error: null });
	});

	it('interpreted mode calls interpret before compiling', async () => {
		mockSuccessfulSearch();
		interpretMock.mockReturnValue({ expression: 'f:shaper s:console' });

		await searchCards('shaper consoles', { mode: 'interpreted' });

		expect(interpretMock).toHaveBeenCalledWith('shaper consoles');
		expect(compileExpressionMock).toHaveBeenCalledWith('f:shaper s:console', {});
	});

	it('returns empty cards and the internal error for invalid literal syntax', async () => {
		const error = new Error('Unknown keyword: zzz');
		compileExpressionMock.mockReturnValue({ sql: null, params: [], error });

		const result = await searchCards('zzz:foo');

		expect(result).toEqual({ cards: [], error });
		expect(sqlMock).not.toHaveBeenCalled();
		expect(adaptCardMock).not.toHaveBeenCalled();
	});

	it('preserves custom limit behavior through the options object', async () => {
		mockSuccessfulSearch();

		await searchCards('corroder', { limit: 25 });

		expect(compileExpressionMock).toHaveBeenCalledWith('corroder', { limit: 25 });
	});

	it('passes the format to the compiler', async () => {
		mockSuccessfulSearch();

		await searchCards('corp', { format: 'startup' });

		expect(compileExpressionMock).toHaveBeenCalledWith('corp', { format: 'startup' });
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
