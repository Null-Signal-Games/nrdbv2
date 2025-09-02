import { describe, it, expect } from 'vitest';
import { getHighResImage } from './utils';
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
				tiny: 'tiny-url',
				small: 'small-url',
				medium: 'medium-url',
				large: 'large-url'
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

describe('getHighResImage', () => {
	const baseMockCard = createMockCard('1', 'Test Card', ['core']);

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
