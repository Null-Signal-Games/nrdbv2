import type { Card } from '$lib/types';

export const store = $state<{ allCards: Card[]; cardIdToCard: Record<string, Card> }>({
	allCards: [],
	cardIdToCard: {}
});

export const setupStore = (cards: Card[]) => {
	store.allCards = cards;
	store.cardIdToCard = cards.reduce(
		(acc, card) => {
			acc[card.id] = card;
			return acc;
		},
		{} as Record<string, Card>
	);
};
