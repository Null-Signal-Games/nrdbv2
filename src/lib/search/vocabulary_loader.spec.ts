import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { sqlMock } = vi.hoisted(() => ({ sqlMock: vi.fn() }));
vi.mock('$lib/sqlite', () => ({ sql: sqlMock }));

import { prepareSearch } from './vocabulary_loader';

afterEach(() => {
	vi.restoreAllMocks();
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
