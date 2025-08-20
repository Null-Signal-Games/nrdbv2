import { describe, it, expect } from 'vitest';
import { getHighResImage } from '$lib/utils';
import type { Card } from '$lib/types';

const mockCards: Card[] = [
	{
		id: '1',
		attributes: {
			title: 'Test Card One',
			card_cycle_ids: ['core'],
			latest_printing_id: 'p1',
			latest_printing_images: {
				nrdb_classic: { tiny: '', small: '', medium: '', large: 'large-image-url' }
			}
		}
	},
	{
		id: '2',
		attributes: {
			title: 'Another Test Card',
			card_cycle_ids: ['elevation'],
			latest_printing_id: 'p2',
			latest_printing_images: {
				nrdb_classic: { tiny: '', small: '', medium: '', large: 'another-large-url' }
			}
		}
	}
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

// For the actual component, we'll rely more on E2E tests due to complexity of context setup
describe('/cards/[slug]/+page.svelte (simplified)', () => {
	it('should export component correctly', async () => {
		// Just verify the component can be imported
		const CardPage = await import('./+page.svelte');
		expect(CardPage).toBeDefined();
		expect(CardPage.default).toBeDefined();
	});
});
