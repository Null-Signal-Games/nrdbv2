// Types for SQLite database rows.

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

export interface CardPoolRow {
	id: string;
	name: string;
	format_id: string;
	created_at: string;
	updated_at: string;
	card_cycle_ids?: string; // from join
	num_cards?: number; // from join
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

export interface CardSetTypeRow {
	id: string;
	name: string;
	description: string | null;
	created_at: string;
	updated_at: string;
}

export interface CardSubtypeRow {
	id: string;
	name: string;
	created_at: string;
	updated_at: string;
}

export interface CardTypeRow {
	id: string;
	name: string;
	created_at: string;
	updated_at: string;
	side_id: string;
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

export interface RestrictionRow {
    id: string;
    name: string;
    date_start: string;
    point_limit: number | null;
    format_id: string;
    created_at: string;
    updated_at: string;
    banned?: string;
    restricted?: string;
    universal_faction_cost?: string;
    global_penalty?: string;
    points?: string;
    banned_subtypes?: string;
    size?: number;
}

export interface SideRow {
	id: string;
	name: string;
	created_at: string;
	updated_at: string;
}

export interface SnapshotRow {
	id: string;
	format_id: string;
	card_pool_id: string;
	date_start: string;
	restriction_id: string | null;
	active: boolean | number;
	created_at: string;
	updated_at: string;
	card_cycle_ids?: string; // from join
	card_set_ids?: string; // from join
	num_cards?: number; // from join
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
}

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
}