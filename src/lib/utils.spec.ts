import { describe, it, expect } from 'vitest';
import { getHighResImage } from './utils';
import { createMockCard } from './test-helpers';

describe('getHighResImage', () => {
	it('should return NSG image URL for elevation cycle cards', () => {
		const card = createMockCard('1', 'Test Card', ['elevation', 'other'], {
			latest_printing_id: 'print123'
		});

		const result = getHighResImage(card);
		expect(result).toBe('https://card-images.netrunnerdb.com/v2/xlarge/print123.webp');
	});

	it('should return NSG image URL for liberation cycle cards', () => {
		const card = createMockCard('1', 'Test Card', ['liberation'], {
			latest_printing_id: 'print123'
		});

		const result = getHighResImage(card);
		expect(result).toBe('https://card-images.netrunnerdb.com/v2/xlarge/print123.webp');
	});

	it('should return NSG image URL for borealis cycle cards', () => {
		const card = createMockCard('1', 'Test Card', ['borealis'], {
			latest_printing_id: 'print123'
		});

		const result = getHighResImage(card);
		expect(result).toBe('https://card-images.netrunnerdb.com/v2/xlarge/print123.webp');
	});

	it('should return NSG image URL for ashes cycle cards', () => {
		const card = createMockCard('1', 'Test Card', ['ashes'], {
			latest_printing_id: 'print123'
		});

		const result = getHighResImage(card);
		expect(result).toBe('https://card-images.netrunnerdb.com/v2/xlarge/print123.webp');
	});

	it('should return NSG image URL for system_gateway cycle cards', () => {
		const card = createMockCard('1', 'Test Card', ['system_gateway'], {
			latest_printing_id: 'print123'
		});

		const result = getHighResImage(card);
		expect(result).toBe('https://card-images.netrunnerdb.com/v2/xlarge/print123.webp');
	});

	it('should return NSG image URL when card has multiple cycles including NSG cycle', () => {
		const card = createMockCard('1', 'Test Card', ['core', 'elevation', 'other'], {
			latest_printing_id: 'print123'
		});

		const result = getHighResImage(card);
		expect(result).toBe('https://card-images.netrunnerdb.com/v2/xlarge/print123.webp');
	});

	it('should return classic NRDB image URL for non-NSG cycle cards', () => {
		const card = createMockCard('1', 'Test Card', ['core'], {
			latest_printing_images: {
				nrdb_classic: {
					tiny: 'tiny-url',
					small: 'small-url',
					medium: 'medium-url',
					large: 'large-url'
				}
			}
		});

		const result = getHighResImage(card);
		expect(result).toBe('large-url');
	});

	it('should return classic NRDB image URL for empty card_cycle_ids', () => {
		const card = createMockCard('1', 'Test Card', [], {
			latest_printing_images: {
				nrdb_classic: {
					tiny: 'tiny-url',
					small: 'small-url',
					medium: 'medium-url',
					large: 'large-url'
				}
			}
		});

		const result = getHighResImage(card);
		expect(result).toBe('large-url');
	});
});
