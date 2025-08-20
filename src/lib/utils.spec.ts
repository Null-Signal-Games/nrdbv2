import { describe, it, expect } from 'vitest';
import { getHighResImage, NRDB_API_URL, LOCAL_STORAGE_ALL_CARDS_KEY } from './utils';
import type { Card } from './types';

describe('constants', () => {
	it('should export correct API URL', () => {
		expect(NRDB_API_URL).toBe('https://api.netrunnerdb.com/api/v3/public');
	});

	it('should export correct local storage key', () => {
		expect(LOCAL_STORAGE_ALL_CARDS_KEY).toBe('allCards');
	});
});

describe('getHighResImage', () => {
	const baseMockCard: Card = {
		id: '1',
		attributes: {
			title: 'Test Card',
			card_cycle_ids: ['core'],
			latest_printing_id: 'print123',
			latest_printing_images: {
				nrdb_classic: {
					tiny: 'tiny-url',
					small: 'small-url',
					medium: 'medium-url',
					large: 'large-url'
				}
			}
		}
	};

	it('should return NSG image URL for elevation cycle cards', () => {
		const card = {
			...baseMockCard,
			attributes: {
				...baseMockCard.attributes,
				card_cycle_ids: ['elevation', 'other']
			}
		};

		const result = getHighResImage(card);
		expect(result).toBe('https://card-images.netrunnerdb.com/v2/xlarge/print123.webp');
	});

	it('should return NSG image URL for liberation cycle cards', () => {
		const card = {
			...baseMockCard,
			attributes: {
				...baseMockCard.attributes,
				card_cycle_ids: ['liberation']
			}
		};

		const result = getHighResImage(card);
		expect(result).toBe('https://card-images.netrunnerdb.com/v2/xlarge/print123.webp');
	});

	it('should return NSG image URL for borealis cycle cards', () => {
		const card = {
			...baseMockCard,
			attributes: {
				...baseMockCard.attributes,
				card_cycle_ids: ['borealis']
			}
		};

		const result = getHighResImage(card);
		expect(result).toBe('https://card-images.netrunnerdb.com/v2/xlarge/print123.webp');
	});

	it('should return NSG image URL for ashes cycle cards', () => {
		const card = {
			...baseMockCard,
			attributes: {
				...baseMockCard.attributes,
				card_cycle_ids: ['ashes']
			}
		};

		const result = getHighResImage(card);
		expect(result).toBe('https://card-images.netrunnerdb.com/v2/xlarge/print123.webp');
	});

	it('should return NSG image URL for system_gateway cycle cards', () => {
		const card = {
			...baseMockCard,
			attributes: {
				...baseMockCard.attributes,
				card_cycle_ids: ['system_gateway']
			}
		};

		const result = getHighResImage(card);
		expect(result).toBe('https://card-images.netrunnerdb.com/v2/xlarge/print123.webp');
	});

	it('should return NSG image URL when card has multiple cycles including NSG cycle', () => {
		const card = {
			...baseMockCard,
			attributes: {
				...baseMockCard.attributes,
				card_cycle_ids: ['core', 'elevation', 'other']
			}
		};

		const result = getHighResImage(card);
		expect(result).toBe('https://card-images.netrunnerdb.com/v2/xlarge/print123.webp');
	});

	it('should return classic NRDB image URL for non-NSG cycle cards', () => {
		const card = {
			...baseMockCard,
			attributes: {
				...baseMockCard.attributes,
				card_cycle_ids: ['core', 'creation-control']
			}
		};

		const result = getHighResImage(card);
		expect(result).toBe('large-url');
	});

	it('should return classic NRDB image URL for empty card_cycle_ids', () => {
		const card = {
			...baseMockCard,
			attributes: {
				...baseMockCard.attributes,
				card_cycle_ids: []
			}
		};

		const result = getHighResImage(card);
		expect(result).toBe('large-url');
	});
});
