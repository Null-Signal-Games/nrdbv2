import { describe, it, expect } from 'vitest';
import { cardInFormatPool, isDeckFormat } from './deck_formats';
import type { Card } from './types';

const cardInCycles = (cycleIds: string[]): Card =>
	({
		id: 'test_card',
		type: 'cards',
		attributes: {
			card_cycle_ids: cycleIds,
			format_ids: ['startup', 'standard', 'eternal']
		}
	}) as unknown as Card;

const formatCycles = {
	startup: ['system_gateway', 'elevation', 'vantage_point'],
	standard: ['ashes', 'borealis', 'elevation', 'liberation', 'system_gateway', 'vantage_point'],
	eternal: ['core_set', 'system_update_2021', 'system_gateway', 'elevation', 'vantage_point']
};

describe('cardInFormatPool', () => {
	it('excludes a rotated-out card that still claims the format', () => {
		const rotated = cardInCycles(['system_update_2021', 'lunar']);

		expect(rotated.attributes.format_ids).toContain('startup');
		expect(cardInFormatPool(rotated, 'startup', formatCycles)).toBe(false);
	});

	it('includes a card from the newest cycle in the pool', () => {
		const vantagePoint = cardInCycles(['vantage_point']);

		expect(cardInFormatPool(vantagePoint, 'startup', formatCycles)).toBe(true);
	});

	it('excludes a Vantage Point card from core, which is pinned behind it', () => {
		const vantagePoint = cardInCycles(['vantage_point']);

		expect(cardInFormatPool(vantagePoint, 'core', formatCycles)).toBe(false);
	});

	it('includes a System Gateway card in core', () => {
		expect(cardInFormatPool(cardInCycles(['system_gateway']), 'core', formatCycles)).toBe(true);
	});

	it("matches when any one of a card's cycles is in the pool", () => {
		const reprint = cardInCycles(['core_set', 'elevation']);

		expect(cardInFormatPool(reprint, 'startup', formatCycles)).toBe(true);
	});

	it('matches nothing when the pool data is empty rather than falling back to format_ids', () => {
		const card = cardInCycles(['vantage_point']);

		expect(cardInFormatPool(card, 'standard', {})).toBe(false);
	});
});

describe('isDeckFormat', () => {
	it('rejects formats that exist in the data but not in the picker', () => {
		expect(isDeckFormat('snapshot')).toBe(false);
		expect(isDeckFormat('ram')).toBe(false);
	});
});
