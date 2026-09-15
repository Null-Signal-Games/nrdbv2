import type { Card, Decklist } from '$lib/types';

export type CardSlots = Readonly<Decklist['attributes']['card_slots']>;

export const setCardSlot = (card_slots: CardSlots, card: Card, quantity: number): CardSlots => {
	const next = { ...card_slots };

	if (quantity <= 0) {
		delete next[card.id];
	} else {
		next[card.id] = Math.min(card.attributes.deck_limit, quantity);
	}

	return next;
};
