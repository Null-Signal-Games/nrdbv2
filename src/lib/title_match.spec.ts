import { describe, it, expect } from 'vitest';
import { normalize, normalizedIncludes, filterCards, rankCards } from './title_match';
import { createMockCard } from './test-helpers';
import type { Card } from './types';

const mockCards: Card[] = [
	createMockCard('15_minutes', '15 Minutes', ['data_and_destiny']),
	createMockCard('24_7_news_cycle', '24/7 News Cycle', ['data_and_destiny']),
	createMockCard('light_the_fire', 'Light the Fire', ['borealis']),
	createMockCard('lightning_laboratory', 'Lightning Laboratory', ['liberation'])
];

describe('normalize', () => {
	it('converts to lowercase', () => {
		expect(normalize('HELLO')).toBe('hello');
	});

	it('trims whitespace', () => {
		expect(normalize('  hello  ')).toBe('hello');
	});

	it('removes diacritics', () => {
		expect(normalize('café')).toBe('cafe');
		expect(normalize('naïve')).toBe('naive');
		expect(normalize('señor')).toBe('senor');
	});

	it('handles an empty string', () => {
		expect(normalize('')).toBe('');
	});

	it('handles unicode normalization', () => {
		expect(normalize('é')).toBe('e');
		expect(normalize('ñ')).toBe('n');
	});
});

describe('normalizedIncludes', () => {
	it('finds matches ignoring case', () => {
		expect(normalizedIncludes('Hello World', 'hello')).toBe(true);
		expect(normalizedIncludes('Hello World', 'WORLD')).toBe(true);
	});

	it('finds matches ignoring diacritics', () => {
		expect(normalizedIncludes('café', 'cafe')).toBe(true);
		expect(normalizedIncludes('señor', 'senor')).toBe(true);
	});

	it('returns false for non-matches', () => {
		expect(normalizedIncludes('hello', 'world')).toBe(false);
	});

	it('handles an empty search string', () => {
		expect(normalizedIncludes('hello', '')).toBe(true);
	});

	it('handles whitespace in both strings', () => {
		expect(normalizedIncludes('  hello world  ', ' world ')).toBe(true);
	});
});

describe('filterCards', () => {
	it('filters cards by title match', () => {
		const result = filterCards(mockCards, 'lightning');
		expect(result).toHaveLength(1);
		expect(result[0].attributes.title).toBe('Lightning Laboratory');
	});

	it('is case insensitive', () => {
		const result = filterCards(mockCards, 'LIGHTNING');
		expect(result).toHaveLength(1);
		expect(result[0].attributes.title).toBe('Lightning Laboratory');
	});

	it('handles special characters and numbers', () => {
		const result = filterCards(mockCards, '24/7');
		expect(result).toHaveLength(1);
		expect(result[0].attributes.title).toBe('24/7 News Cycle');
	});

	it('finds partial matches', () => {
		const result = filterCards(mockCards, 'light');
		expect(result).toHaveLength(2); // "Light the Fire" and "Lightning Laboratory"
	});

	it('returns an empty array for no matches', () => {
		const result = filterCards(mockCards, 'nonexistent');
		expect(result).toHaveLength(0);
	});

	it('returns all cards for an empty search', () => {
		const result = filterCards(mockCards, '');
		expect(result).toHaveLength(4);
	});

	it('handles a multiple-word search', () => {
		const result = filterCards(mockCards, 'news cycle');
		expect(result).toHaveLength(1);
		expect(result[0].attributes.title).toBe('24/7 News Cycle');
	});
});

describe('rankCards', () => {
	it('puts cards that start with the search term first', () => {
		const cards = [
			{
				...mockCards[0],
				attributes: { ...mockCards[0].attributes, title: 'Light Something' }
			},
			{ ...mockCards[1], attributes: { ...mockCards[1].attributes, title: 'Another Light' } }
		];

		const result = rankCards([...cards], 'light');
		expect(result[0].attributes.title).toBe('Light Something');
		expect(result[1].attributes.title).toBe('Another Light');
	});

	it('ranks case-insensitively', () => {
		const cards = [
			{
				...mockCards[0],
				attributes: { ...mockCards[0].attributes, title: 'Some Lightning' }
			},
			{ ...mockCards[1], attributes: { ...mockCards[1].attributes, title: 'Lightning Fast' } }
		];

		const result = rankCards([...cards], 'LIGHTNING');
		expect(result[0].attributes.title).toBe('Lightning Fast');
		expect(result[1].attributes.title).toBe('Some Lightning');
	});

	it('keeps the order when no card starts with the search term', () => {
		const result = rankCards([...mockCards], 'xyz');
		expect(result).toEqual(mockCards);
	});

	it('handles numbers and special characters when ranking', () => {
		const cards = [
			{ ...mockCards[0], attributes: { ...mockCards[0].attributes, title: 'Some 24/7' } },
			{ ...mockCards[1], attributes: { ...mockCards[1].attributes, title: '24/7 First' } }
		];

		const result = rankCards([...cards], '24/7');
		expect(result[0].attributes.title).toBe('24/7 First');
		expect(result[1].attributes.title).toBe('Some 24/7');
	});

	it('does not modify the original array', () => {
		const originalCards = [...mockCards];
		rankCards(mockCards, 'lightning');
		expect(mockCards).toEqual(originalCards);
	});
});
