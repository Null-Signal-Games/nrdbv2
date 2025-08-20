import { describe, it, expect } from 'vitest';
import {
	normalize,
	normalizedIncludes,
	filterCards,
	rankCards,
	filterAndRankCards
} from './search';
import type { Card } from './types';

// Realistic mock card data based on NetrunnerDB API
const mockCards: Card[] = [
	{
		id: '15_minutes',
		attributes: {
			title: '15 Minutes',
			card_cycle_ids: ['data_and_destiny'],
			latest_printing_id: '09004',
			latest_printing_images: {
				nrdb_classic: {
					tiny: 'https://card-images.netrunnerdb.com/v2/tiny/09004.jpg',
					small: 'https://card-images.netrunnerdb.com/v2/small/09004.jpg',
					medium: 'https://card-images.netrunnerdb.com/v2/medium/09004.jpg',
					large: 'https://card-images.netrunnerdb.com/v2/large/09004.jpg'
				}
			}
		}
	},
	{
		id: '24_7_news_cycle',
		attributes: {
			title: '24/7 News Cycle',
			card_cycle_ids: ['data_and_destiny'],
			latest_printing_id: '09019',
			latest_printing_images: {
				nrdb_classic: {
					tiny: 'https://card-images.netrunnerdb.com/v2/tiny/09019.jpg',
					small: 'https://card-images.netrunnerdb.com/v2/small/09019.jpg',
					medium: 'https://card-images.netrunnerdb.com/v2/medium/09019.jpg',
					large: 'https://card-images.netrunnerdb.com/v2/large/09019.jpg'
				}
			}
		}
	},
	{
		id: 'light_the_fire',
		attributes: {
			title: 'Light the Fire',
			card_cycle_ids: ['borealis'],
			latest_printing_id: '33009',
			latest_printing_images: {
				nrdb_classic: {
					tiny: 'https://card-images.netrunnerdb.com/v2/tiny/33009.jpg',
					small: 'https://card-images.netrunnerdb.com/v2/small/33009.jpg',
					medium: 'https://card-images.netrunnerdb.com/v2/medium/33009.jpg',
					large: 'https://card-images.netrunnerdb.com/v2/large/33009.jpg'
				}
			}
		}
	},
	{
		id: 'lightning_laboratory',
		attributes: {
			title: 'Lightning Laboratory',
			card_cycle_ids: ['liberation'],
			latest_printing_id: '34097',
			latest_printing_images: {
				nrdb_classic: {
					tiny: 'https://card-images.netrunnerdb.com/v2/tiny/34097.jpg',
					small: 'https://card-images.netrunnerdb.com/v2/small/34097.jpg',
					medium: 'https://card-images.netrunnerdb.com/v2/medium/34097.jpg',
					large: 'https://card-images.netrunnerdb.com/v2/large/34097.jpg'
				}
			}
		}
	}
];

describe('normalize', () => {
	it('should convert to lowercase', () => {
		expect(normalize('HELLO')).toBe('hello');
	});

	it('should trim whitespace', () => {
		expect(normalize('  hello  ')).toBe('hello');
	});

	it('should remove diacritics', () => {
		expect(normalize('café')).toBe('cafe');
		expect(normalize('naïve')).toBe('naive');
		expect(normalize('señor')).toBe('senor');
	});

	it('should handle empty string', () => {
		expect(normalize('')).toBe('');
	});

	it('should handle unicode normalization', () => {
		expect(normalize('é')).toBe('e');
		expect(normalize('ñ')).toBe('n');
	});
});

describe('normalizedIncludes', () => {
	it('should find matches ignoring case', () => {
		expect(normalizedIncludes('Hello World', 'hello')).toBe(true);
		expect(normalizedIncludes('Hello World', 'WORLD')).toBe(true);
	});

	it('should find matches ignoring diacritics', () => {
		expect(normalizedIncludes('café', 'cafe')).toBe(true);
		expect(normalizedIncludes('señor', 'senor')).toBe(true);
	});

	it('should return false for non-matches', () => {
		expect(normalizedIncludes('hello', 'world')).toBe(false);
	});

	it('should handle empty search string', () => {
		expect(normalizedIncludes('hello', '')).toBe(true);
	});

	it('should handle whitespace in both strings', () => {
		expect(normalizedIncludes('  hello world  ', ' world ')).toBe(true);
	});
});

describe('filterCards', () => {
	it('should filter cards by title match', () => {
		const result = filterCards(mockCards, 'lightning');
		expect(result).toHaveLength(1);
		expect(result[0].attributes.title).toBe('Lightning Laboratory');
	});

	it('should be case insensitive', () => {
		const result = filterCards(mockCards, 'LIGHTNING');
		expect(result).toHaveLength(1);
		expect(result[0].attributes.title).toBe('Lightning Laboratory');
	});

	it('should handle special characters and numbers', () => {
		const result = filterCards(mockCards, '24/7');
		expect(result).toHaveLength(1);
		expect(result[0].attributes.title).toBe('24/7 News Cycle');
	});

	it('should find partial matches', () => {
		const result = filterCards(mockCards, 'light');
		expect(result).toHaveLength(2); // "Light the Fire" and "Lightning Laboratory"
	});

	it('should return empty array for no matches', () => {
		const result = filterCards(mockCards, 'nonexistent');
		expect(result).toHaveLength(0);
	});

	it('should return all cards for empty search', () => {
		const result = filterCards(mockCards, '');
		expect(result).toHaveLength(4);
	});

	it('should handle multiple word search', () => {
		const result = filterCards(mockCards, 'news cycle');
		expect(result).toHaveLength(1);
		expect(result[0].attributes.title).toBe('24/7 News Cycle');
	});
});

describe('rankCards', () => {
	it('should prioritize cards that start with search term', () => {
		const cards = [
			{ ...mockCards[0], attributes: { ...mockCards[0].attributes, title: 'Light Something' } },
			{ ...mockCards[1], attributes: { ...mockCards[1].attributes, title: 'Another Light' } }
		];

		const result = rankCards([...cards], 'light');
		expect(result[0].attributes.title).toBe('Light Something');
		expect(result[1].attributes.title).toBe('Another Light');
	});

	it('should handle case insensitive ranking', () => {
		const cards = [
			{ ...mockCards[0], attributes: { ...mockCards[0].attributes, title: 'Some Lightning' } },
			{ ...mockCards[1], attributes: { ...mockCards[1].attributes, title: 'Lightning Fast' } }
		];

		const result = rankCards([...cards], 'LIGHTNING');
		expect(result[0].attributes.title).toBe('Lightning Fast');
		expect(result[1].attributes.title).toBe('Some Lightning');
	});

	it('should maintain order when no cards start with search term', () => {
		const result = rankCards([...mockCards], 'xyz');
		expect(result).toEqual(mockCards);
	});

	it('should handle numbers and special chars in ranking', () => {
		const cards = [
			{ ...mockCards[0], attributes: { ...mockCards[0].attributes, title: 'Some 24/7' } },
			{ ...mockCards[1], attributes: { ...mockCards[1].attributes, title: '24/7 First' } }
		];

		const result = rankCards([...cards], '24/7');
		expect(result[0].attributes.title).toBe('24/7 First');
		expect(result[1].attributes.title).toBe('Some 24/7');
	});

	it('should not modify original array', () => {
		const originalCards = [...mockCards];
		rankCards(mockCards, 'lightning');
		expect(mockCards).toEqual(originalCards);
	});
});

describe('filterAndRankCards', () => {
	it('should filter and rank cards together', () => {
		const result = filterAndRankCards(mockCards, 'light');
		expect(result).toHaveLength(2); // "Light the Fire" and "Lightning Laboratory"
		// Should prioritize cards starting with "light"
		expect(result[0].attributes.title).toBe('Light the Fire');
		expect(result[1].attributes.title).toBe('Lightning Laboratory');
	});

	it('should return empty array when no matches', () => {
		const result = filterAndRankCards(mockCards, 'nonexistent');
		expect(result).toHaveLength(0);
	});

	it('should handle complex search with filtering and ranking', () => {
		const result = filterAndRankCards(mockCards, 'lightning');
		expect(result).toHaveLength(1);
		expect(result[0].attributes.title).toBe('Lightning Laboratory');
	});

	it('should work with empty search', () => {
		const result = filterAndRankCards(mockCards, '');
		expect(result).toHaveLength(4);
	});

	it('should prioritize exact start matches after filtering', () => {
		const cards = [
			...mockCards,
			{
				id: 'fire_something',
				attributes: {
					title: 'Fire Card',
					card_cycle_ids: ['test'],
					latest_printing_id: 'p5',
					latest_printing_images: {
						nrdb_classic: {
							tiny: 'https://example.com/tiny.jpg',
							small: 'https://example.com/small.jpg',
							medium: 'https://example.com/medium.jpg',
							large: 'https://example.com/large.jpg'
						}
					}
				}
			}
		];

		const result = filterAndRankCards(cards, 'fire');
		expect(result).toHaveLength(2); // "Light the Fire" and "Fire Card"
		expect(result[0].attributes.title).toBe('Fire Card'); // Starts with "fire"
		expect(result[1].attributes.title).toBe('Light the Fire'); // Contains "fire"
	});
});
