import { describe, it, expect } from 'vitest';
import {
	normalize,
	normalizedIncludes,
	filterCards,
	rankCards,
	filterAndRankCards
} from './search';
import type { Card } from './types';

// Helper function to create mock Card objects with all required properties
const createMockCard = (id: string, title: string, card_cycle_ids: string[] = ['core']): Card => ({
	id,
	attributes: {
		stripped_title: title.toLowerCase().replace(/[^a-z0-9]/g, ''),
		title,
		card_type_id: 'agenda',
		side_id: 'corp',
		faction_id: 'neutral-corp',
		cost: '0',
		advancement_requirement: null,
		agenda_points: null,
		base_link: null,
		deck_limit: 3,
		in_restriction: true,
		influence_cost: 0,
		influence_limit: null,
		memory_cost: null,
		minimum_deck_size: null,
		num_printings: 1,
		printing_ids: [id],
		date_release: '2023-01-01',
		restriction_ids: [],
		strength: null,
		stripped_text: '',
		text: '',
		trash_cost: null,
		is_unique: false,
		card_subtype_ids: [],
		display_subtypes: null,
		attribution: null,
		updated_at: '2023-01-01T00:00:00Z',
		format_ids: [],
		card_pool_ids: [],
		snapshot_ids: [],
		card_cycle_ids,
		card_cycle_names: [],
		card_set_ids: [],
		card_set_names: [],
		designed_by: 'Test',
		printings_released_by: [],
		pronouns: null,
		pronunciation_approximation: null,
		pronunciation_ipa: null,
		layout_id: 'normal',
		num_extra_faces: 0,
		faces: [],
		card_abilities: {
			additional_cost: false,
			advanceable: false,
			gains_subroutines: false,
			interrupt: false,
			link_provided: null,
			mu_provided: null,
			num_printed_subroutines: null,
			on_encounter_effect: false,
			performs_trace: false,
			recurring_credits_provided: null,
			rez_effect: false,
			trash_ability: false
		},
		restrictions: {
			banned: [],
			global_penalty: [],
			points: {},
			restricted: [],
			universal_faction_cost: {}
		},
		latest_printing_id: id,
		latest_printing_images: {
			nrdb_classic: {
				tiny: `https://card-images.netrunnerdb.com/v2/tiny/${id}.jpg`,
				small: `https://card-images.netrunnerdb.com/v2/small/${id}.jpg`,
				medium: `https://card-images.netrunnerdb.com/v2/medium/${id}.jpg`,
				large: `https://card-images.netrunnerdb.com/v2/large/${id}.jpg`
			}
		}
	},
	relationships: {
		side: { links: { related: '' } },
		cards: { links: { related: '' } },
		decklists: { links: { related: '' } },
		printings: { links: { related: '' } }
	},
	links: { self: '' }
});

// Realistic mock card data based on NetrunnerDB API
const mockCards: Card[] = [
	createMockCard('15_minutes', '15 Minutes', ['data_and_destiny']),
	createMockCard('24_7_news_cycle', '24/7 News Cycle', ['data_and_destiny']),
	createMockCard('light_the_fire', 'Light the Fire', ['borealis']),
	createMockCard('lightning_laboratory', 'Lightning Laboratory', ['liberation'])
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
		const cards = [...mockCards, createMockCard('fire_something', 'Fire Card', ['test'])];

		const result = filterAndRankCards(cards, 'fire');
		expect(result).toHaveLength(2); // "Light the Fire" and "Fire Card"
		expect(result[0].attributes.title).toBe('Fire Card'); // Starts with "fire"
		expect(result[1].attributes.title).toBe('Light the Fire'); // Contains "fire"
	});
});
