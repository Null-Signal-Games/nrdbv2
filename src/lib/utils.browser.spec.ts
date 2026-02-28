import { describe, it, expect, vi } from 'vitest';
import { print } from './utils';

describe('print', () => {
	it('should call window.print', () => {
		const spy = vi.spyOn(window, 'print').mockImplementation(() => {});
		print();
		expect(spy).toHaveBeenCalled();
		spy.mockRestore();
	});
});
