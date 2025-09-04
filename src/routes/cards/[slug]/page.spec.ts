import { describe, it, expect } from 'vitest';
import { getHighResImage } from '$lib/utils';
import { createMockCard } from '$lib/test-helpers';

const mockCards = [
	createMockCard('1', 'Test Card One', ['core'], {
		latest_printing_images: {
			nrdb_classic: {
				tiny: '',
				small: '',
				medium: '',
				large: 'large-image-url'
			}
		}
	}),
	createMockCard('2', 'Another Test Card', ['elevation'], {
		latest_printing_id: 'p2',
		latest_printing_images: {
			nrdb_classic: {
				tiny: '',
				small: '',
				medium: '',
				large: 'another-large-url'
			}
		}
	})
];

describe('Card Page Logic', () => {
	it('should find card by id correctly', () => {
		const card = mockCards.find((card) => card.id === '1');
		expect(card?.attributes.title).toBe('Test Card One');
	});

	it('should return undefined for non-existent card', () => {
		const card = mockCards.find((card) => card.id === 'nonexistent');
		expect(card).toBeUndefined();
	});

	it('should generate correct image URL for NSG cards', () => {
		const nsgCard = mockCards[1]; // elevation cycle
		const imageUrl = getHighResImage(nsgCard);
		expect(imageUrl).toBe('https://card-images.netrunnerdb.com/v2/xlarge/p2.webp');
	});

	it('should generate correct image URL for classic cards', () => {
		const classicCard = mockCards[0]; // core cycle
		const imageUrl = getHighResImage(classicCard);
		expect(imageUrl).toBe('large-image-url');
	});
});

// Component testing is handled by E2E tests due to SvelteKit context requirements
