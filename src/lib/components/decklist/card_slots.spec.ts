import { describe, expect, it } from 'vitest';
import { createMockCard } from '$lib/test-helpers';
import { setCardSlot } from './card_slots';

const limited_card = createMockCard('limited_card', 'Limited Card', ['core'], { deck_limit: 2 });

describe('setCardSlot', () => {
	it('adds a slot when the card is not in the deck', () => {
		expect(setCardSlot({}, limited_card, 1)).toEqual({ [limited_card.id]: 1 });
	});

	it('clamps the quantity to the card deck limit', () => {
		expect(setCardSlot({}, limited_card, 5)).toEqual({ [limited_card.id]: 2 });
	});

	it('drops the slot when the quantity is not positive', () => {
		expect(setCardSlot({ [limited_card.id]: 2 }, limited_card, 0)).toEqual({});
		expect(setCardSlot({ [limited_card.id]: 2 }, limited_card, -1)).toEqual({});
	});

	it('keeps other slots and leaves the source unchanged', () => {
		const other_card = createMockCard('other_card', 'Other Card');
		const slots = { [limited_card.id]: 1, [other_card.id]: 3 };

		const next = setCardSlot(slots, limited_card, 2);

		expect(next).toEqual({ [limited_card.id]: 2, [other_card.id]: 3 });
		expect(slots).toEqual({ [limited_card.id]: 1, [other_card.id]: 3 });
	});
});
