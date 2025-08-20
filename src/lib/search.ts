import type { Card } from './types';

export const normalize = (str: string) => {
	return str
		.trim()
		.toLowerCase()
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '');
};

export const normalizedIncludes = (str: string, search: string) => {
	return normalize(str).includes(normalize(search));
};

export const filterCards = (cards: Card[], search: string) => {
	return cards.filter((card) => normalizedIncludes(card.attributes.title, search));
};

export const rankCards = (cards: Card[], search: string) => {
	const cardsCopy = [...cards];
	cardsCopy.sort((a, b) => {
		const aStartsWith = normalize(a.attributes.title).startsWith(normalize(search));
		const bStartsWith = normalize(b.attributes.title).startsWith(normalize(search));

		if (aStartsWith && !bStartsWith) return -1;
		if (!aStartsWith && bStartsWith) return 1;

		return 0;
	});

	return cardsCopy;
};

export const filterAndRankCards = (cards: Card[], search: string) => {
	return rankCards(filterCards(cards, search), search);
};
