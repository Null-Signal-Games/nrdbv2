import { describe, it, expect } from 'vitest';
import { isDeckFormat } from './deck_formats';

describe('isDeckFormat', () => {
	it('rejects formats that exist in the data but not in the picker', () => {
		expect(isDeckFormat('snapshot')).toBe(false);
		expect(isDeckFormat('ram')).toBe(false);
	});

	it('accepts the all-cards picker option', () => {
		expect(isDeckFormat('all')).toBe(true);
	});
});
