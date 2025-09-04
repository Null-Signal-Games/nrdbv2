import type { Card } from './types';

/**
 * Helper function to create mock Card objects with all required properties.
 * This centralizes the mock card creation to avoid duplication across test files.
 *
 * @param id - Card ID
 * @param title - Card title
 * @param card_cycle_ids - Array of card cycle IDs (defaults to ['core'])
 * @param overrides - Optional overrides for specific attributes
 */
export const createMockCard = (
	id: string,
	title: string,
	card_cycle_ids: string[] = ['core'],
	overrides: Partial<Card['attributes']> = {}
): Card => ({
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
		},
		// Apply any overrides
		...overrides
	},
	relationships: {
		side: { links: { related: '' } },
		cards: { links: { related: '' } },
		decklists: { links: { related: '' } },
		printings: { links: { related: '' } }
	},
	links: { self: '' }
});
