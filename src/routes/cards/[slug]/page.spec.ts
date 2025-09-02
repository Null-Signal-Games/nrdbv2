import { describe, it, expect } from 'vitest';
import { getHighResImage } from '$lib/utils';
import type { Card } from '$lib/types';

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
				tiny: '',
				small: '',
				medium: '',
				large: id === '1' ? 'large-image-url' : 'another-large-url'
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

const mockCards: Card[] = [
	createMockCard('1', 'Test Card One', ['core']),
	createMockCard('2', 'Another Test Card', ['elevation'])
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
