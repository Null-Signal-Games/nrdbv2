export type SidesIds = 'corp' | 'runner';

export type Publishers = 'null_signal_games' | 'fantasy_flight_games';

export type Formats = 'eternal' | 'ram' | 'snapshot' | 'standard' | 'startup' | 'system_gateway';

export type FileFormat = 'json' | 'txt' | 'otcgn' | 'bbcode' | 'md' | 'jinteki.net';

export type CardTypeIds =
	| 'agenda'
	| 'asset'
	| 'corp_identity'
	| 'event'
	| 'hardware'
	| 'ice'
	| 'operation'
	| 'program'
	| 'resource'
	| 'runner_identity'
	| 'upgrade';

// TODO: get all available subtypes
export type CardSubTypeIds = 'fracter' | 'icebreaker';

export type FactionIds =
	| 'anarch'
	| 'criminal'
	| 'shaper'
	| 'adam'
	| 'apex'
	| 'sunny_lebeau'
	| 'haas_bioroid'
	| 'jinteki'
	| 'nbn'
	| 'weyland_consortium'
	| 'neutral_corp'
	| 'neutral_runner';

export interface Relationships {
	card_types?: {
		links: {
			related: string;
		};
	};
	cards?: {
		links: {
			related: string;
		};
	};
	decklists?: {
		links: {
			related: string;
		};
	};
	factions?: {
		links: {
			related: string;
		};
	};
	printings?: {
		links: {
			related: string;
		};
	};
	side?: {
		links: {
			related: string;
		};
	};
}

export interface Links {
	self: string;
}

export interface ApiResponse<T> {
	data: T[];
	links: {
		self: string;
		first: string;
		last: string;
	};
	meta: {
		stats: {
			total: {
				count: number;
			};
		};
	};
}

export interface Side {
	id: string;
	type: 'sides';
	attributes: {
		name: string;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}

export interface SideRow {
	id: string;
	name: string;
	created_at: string;
	updated_at: string;
}

export interface Card {
	id: string;
	attributes: {
		stripped_title: string;
		title: string;
		card_type_id: CardTypeIds;
		side_id: string;
		faction_id: string;
		cost: string;
		advancement_requirement: null;
		agenda_points: null;
		base_link: null;
		deck_limit: number;
		in_restriction: true;
		influence_cost: number;
		influence_limit: null;
		memory_cost: null;
		minimum_deck_size: null;
		num_printings: number;
		printing_ids: string[];
		date_release: string;
		restriction_ids: string[];
		strength: number | null;
		stripped_text: string;
		text: string;
		trash_cost: null;
		is_unique: false;
		card_subtype_ids: CardSubTypeIds;
		display_subtypes: null;
		attribution: null;
		updated_at: string;
		format_ids: string[];
		card_pool_ids: string[];
		snapshot_ids: string[];
		card_cycle_ids: string[];
		card_cycle_names: string[];
		card_set_ids: string[];
		card_set_names: string[];
		designed_by: string;
		printings_released_by: string[];
		pronouns: null;
		pronunciation_approximation: null;
		pronunciation_ipa: null;
		layout_id: string;
		num_extra_faces: number;
		faces: string[];
		card_abilities: {
			additional_cost: boolean;
			advanceable: boolean;
			gains_subroutines: boolean;
			interrupt: boolean;
			link_provided: null;
			mu_provided: null;
			num_printed_subroutines: null;
			on_encounter_effect: boolean;
			performs_trace: boolean;
			recurring_credits_provided: null;
			rez_effect: boolean;
			trash_ability: boolean;
		};
		restrictions: {
			banned: string[];
			global_penalty: string[];
			points: object;
			restricted: string[];
			universal_faction_cost: object;
		};
		latest_printing_id: string;
		latest_printing_images: {
			nrdb_classic: {
				tiny: string;
				small: string;
				medium: string;
				large: string;
				xlarge?: string;
			};
		};
	};
	relationships: Relationships;
	links: Links;
}

export interface Cycle {
	id: string;
	type: 'card_cycles';
	attributes: {
		name: string;
		date_release: string;
		legacy_code: string;
		card_set_ids: string[];
		first_printing_id: string;
		position: number;
		released_by: string;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}

export interface Set {
	id: string;
	type: 'card_sets';
	attributes: {
		name: string;
		date_release: string;
		size: number;
		card_cycle_id: string;
		card_set_type_id: string;
		legacy_code: string;
		position: number;
		first_printing_id: string;
		released_by: string;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}

export interface Faction {
	id: string;
	type: 'factions';
	attributes: {
		name: string;
		description: string;
		is_mini: boolean;
		side_id: string;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}

export interface Ruling {
	id: string;
	type: 'rulings';
	attributes: {
		card_id: string;
		nsg_rules_team_verified: boolean;
		question: string;
		answer?: string;
		text_ruling?: string | null;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}

export interface Format {
	id: string;
	type: 'formats';
	attributes: {
		name: string;
		active_snapshot_id: string;
		snapshot_ids: string[];
		restriction_ids: string[];
		active_card_pool_id: string;
		active_restriction_id: string;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}

export interface Restriction {
	id: string;
	type: 'restrictions';
	attributes: {
		name: string;
		date_start: string;
		format_id: Format;
		banned_subtypes: string[];
		verdicts: {
			banned: string[];
			restricted: string[];
			global_penalty: string[];
			points: { [card_id: string]: number };
			universal_faction_cost: { [card_id: string]: number };
		};
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}

export interface Illustrator {
	id: string;
	type: 'illustrators';
	attributes: {
		name: string;
		num_printings: number;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}

export interface Printing {
	id: string;
	type: 'printings';
	attributes: {
		card_id: string;
		card_cycle_id: string;
		card_cycle_name: string;
		card_set_id: string;
		card_set_name: string;
		flavor: string;
		display_illustrators: string;
		illustrator_ids: string[];
		illustrator_names: string[];
		position: number;
		position_in_set: number;
		quantity: number;
		date_release: string;
		updated_at: string;
		stripped_title: string;
		title: string;
		card_type_id: CardTypeIds;
		side_id: string;
		faction_id: string;
		advancement_requirement: string | null;
		cost: number | null;
		agenda_points: number | null;
		base_link: number | null;
		deck_limit: number;
		in_restriction: boolean;
		influence_cost: number | null;
		influence_limit: number | null;
		memory_cost: number | null;
		minimum_deck_size: number | null;
		num_printings: number;
		is_latest_printing: boolean;
		printing_ids: string[];
		restriction_ids: string[];
		strength: number | null;
		stripped_text: string;
		text: string;
		trash_cost: number | null;
		is_unique: boolean;
		card_subtype_ids: CardSubTypeIds;
		card_subtype_names: string[];
		display_subtypes: string | null;
		attribution: string | null;
		format_ids: string[];
		card_pool_ids: string[];
		snapshot_ids: string[];
		card_cycle_ids: string[];
		card_cycle_names: string[];
		card_set_ids: string[];
		card_set_names: string[];
		designed_by: string;
		released_by: string;
		printings_released_by: string[];
		pronouns: string | null;
		pronunciation_approximation: string | null;
		pronunciation_ipa: string | null;
		images: {
			nrdb_classic: {
				tiny: string;
				small: string;
				medium: string;
				large: string;
			};
		};
		card_abilities: {
			additional_cost: boolean;
			advanceable: boolean;
			gains_subroutines: boolean;
			interrupt: boolean;
			link_provided: number | null;
			mu_provided: number | null;
			num_printed_subroutines: number | null;
			on_encounter_effect: boolean;
			performs_trace: boolean;
			recurring_credits_provided: number | null;
			rez_effect: boolean;
			trash_ability: boolean;
		};
		latest_printing_id: string;
		restrictions: {
			banned: string[];
			global_penalty: string[];
			points: {
				[key: string]: string;
			};
			restricted: string[];
			universal_faction_cost: {
				[key: string]: string;
			};
		};
		num_extra_faces: number;
		faces: string[];
	};
	relationships: Relationships;
	links: Links;
}

export interface Review {
	id: string;
	type: 'reviews';
	attributes: {
		username: string;
		body: string;
		card: string;
		card_id: string;
		created_at: string;
		updated_at: string;
		votes: number;
		comments: {
			id: number;
			body: string;
			user: string;
			created_at: string;
			updated_at: string;
		}[];
	};
	relationships: Relationships;
	links: Links;
}

export interface Decklist {
	id: string;
	type: 'decklists';
	attributes: {
		user_id: string;
		follows_basic_deckbuilding_rules: boolean;
		identity_card_id: string;
		name: string;
		notes: string;
		tags: string[] | null;
		side_id: 'corp' | 'runner';
		created_at: string;
		updated_at: string;
		faction_id: FactionIds;
		card_slots: Record<string, number>;
		num_cards: number;
		influence_spent: number;
	};
	relationships: Relationships;
	links: Links;
}

export interface Comment {
	id: number;
	body: string;
	user: string;
	created_at: string;
	updated_at: string;
}

export interface CardGroup {
	type: CardTypeIds;
	data: Card[];
}

export type UnifiedCardRow = {
	id: string;
	title: string;
	stripped_title: string;
	card_type_id: string;
	side_id: string;
	faction_id: string;
	advancement_requirement: number | null;
	agenda_points: number | null;
	base_link: number | null;
	cost: number | null;
	deck_limit: number;
	influence_cost: number | null;
	influence_limit: number | null;
	memory_cost: number | null;
	minimum_deck_size: number | null;
	narrative_text: string | null;
	pronouns: string | null;
	pronunciation_approximation: string | null;
	pronunciation_ipa: string | null;
	strength: number | null;
	stripped_text: string | null;
	text: string | null;
	trash_cost: number | null;
	is_unique: number;
	display_subtypes: string | null;
	attribution: string | null;
	created_at: string;
	updated_at: string;
	additional_cost: number;
	advanceable: number;
	gains_subroutines: number;
	interrupt: number;
	link_provided: number | null;
	mu_provided: number | null;
	num_printed_subroutines: number | null;
	on_encounter_effect: number;
	performs_trace: number;
	recurring_credits_provided: number | null;
	rez_effect: number;
	trash_ability: number;
	install_effect: number;
	charge: number;
	gains_click: number;
	has_paid_ability: number;
	mark: number;
	sabotage: number;
	score_effect: number;
	steal_effect: number;
	card_subtype_ids: string;
	lower_card_subtype_names: string;
	card_subtype_names: string;
	printing_ids: string;
	num_printings: number;
	card_cycle_ids: string;
	card_cycle_names: string;
	card_set_ids: string;
	card_set_names: string;
	restriction_ids: string;
	in_restriction: number;
	restrictions_banned: string;
	restrictions_global_penalty: string;
	restrictions_points: string;
	restrictions_restricted: string;
	restrictions_universal_faction_cost: string;
	format_ids: string;
	card_pool_ids: string;
	snapshot_ids: string;
	date_release: string;
	designed_by: string;
	printings_released_by: string;
	layout_id: string;
	num_extra_faces: number;
	face_indices: string | null;
	faces_base_link: string | null;
	faces_display_subtypes: string | null;
	faces_card_subtype_ids: string | null;
	faces_stripped_text: string | null;
	faces_stripped_title: string | null;
	faces_text: string | null;
	faces_title: string | null;
};

export type UnifiedPrintingRow = {
	id: string;
	card_id: string;
	card_cycle_id: string;
	card_cycle_name: string;
	card_set_id: string;
	card_set_name: string;
	flavor: string | null;
	display_illustrators: string | null;
	position: number;
	position_in_set: number;
	quantity: number;
	date_release: string;
	created_at: string;
	updated_at: string;
	additional_cost: number;
	advanceable: number;
	advancement_requirement: number | null;
	agenda_points: number | null;
	base_link: number | null;
	card_type_id: string;
	cost: number | null;
	faction_id: string;
	gains_subroutines: number;
	influence_cost: number | null;
	interrupt: number;
	is_unique: number;
	link_provided: number | null;
	memory_cost: number | null;
	mu_provided: number | null;
	num_printed_subroutines: number | null;
	narrative_text: string | null;
	on_encounter_effect: number;
	performs_trace: number;
	pronouns: string | null;
	pronunciation_approximation: string | null;
	pronunciation_ipa: string | null;
	recurring_credits_provided: number | null;
	side_id: string;
	strength: number | null;
	stripped_text: string | null;
	stripped_title: string;
	trash_ability: number;
	trash_cost: number | null;

	install_effect: number;
	charge: number;
	gains_click: number;
	has_paid_ability: number;
	mark: number;
	sabotage: number;
	score_effect: number;
	steal_effect: number;
	card_subtype_ids: string;
	lower_card_subtype_names: string;
	card_subtype_names: string;
	printing_ids: string;
	is_latest_printing: number;
	num_printings: number;
	card_cycle_ids: string;
	card_cycle_names: string;
	card_set_ids: string;
	card_set_names: string;
	illustrator_ids: string;
	illustrator_names: string;
	restriction_ids: string;
	in_restriction: number;
	restrictions_banned: string;
	restrictions_global_penalty: string;
	restrictions_points: string;
	restrictions_restricted: string;
	restrictions_universal_faction_cost: string;
	format_ids: string;
	card_pool_ids: string;
	snapshot_ids: string;

	attribution: string | null;
	deck_limit: number;
	display_subtypes: string | null;
	influence_limit: number | null;
	minimum_deck_size: number | null;
	rez_effect: number;
	text: string | null;
	title: string;
	designed_by: string;
	released_by: string;
	printings_released_by: string;
	layout_id: string;
	num_extra_faces: number;
	face_indices: string | null;
	faces_base_link: string | null;
	faces_display_subtypes: string | null;
	faces_card_subtype_ids: string | null;
	faces_stripped_text: string | null;
	faces_stripped_title: string | null;
	faces_text: string | null;
	faces_title: string | null;
	faces_copy_quantity: string | null;
	faces_flavor: string | null;
};

export interface CardCycleRow {
	id: string;
	name: string;
	description: string | null;
	created_at: string;
	updated_at: string;
	date_release: string | null;
	legacy_code: string | null;
	released_by: string | null;
	position: number | null;
	card_set_ids?: string; // from join in queries
	first_printing_id?: string; // from join in queries
}

export interface CardSetRow {
	id: string;
	name: string;
	date_release: string | null;
	size: number | null;
	card_cycle_id: string | null;
	card_set_type_id: string | null;
	position: number | null;
	created_at: string;
	updated_at: string;
	legacy_code: string | null;
	released_by: string | null;
	first_printing_id?: string; // from join in queries
}

export interface FactionRow {
	id: string;
	is_mini: boolean;
	name: string;
	side_id: string;
	created_at: string;
	updated_at: string;
	description: string | null;
}

export interface FormatRow {
	id: string;
	name: string;
	active_snapshot_id: string;
	created_at: string;
	updated_at: string;

	// joined from related tables
	snapshot_ids?: string;
	restriction_ids?: string;
	active_card_pool_id?: string;
	active_restriction_id?: string;
}

export interface IllustratorRow {
	id: string;
	name: string;
	num_printings: number;
	updated_at: string;
}

export interface CardType {
	id: string;
	type: 'card_types';
	attributes: {
		name: string;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}

export interface CardTypeRow {
	id: string;
	name: string;
	created_at: string;
	updated_at: string;
	side_id: string;
}

export interface CardSetTypeRow {
	id: string;
	name: string;
	description: string | null;
	created_at: string;
	updated_at: string;
}

export interface CardSetType {
	id: string;
	type: 'card_set_types';
	attributes: {
		name: string;
		description: string | null;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}

export interface CardSubtypeRow {
	id: string;
	name: string;
	created_at: string;
	updated_at: string;
}

export interface CardSubtype {
	id: string;
	type: 'card_subtypes';
	attributes: {
		name: string;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}
