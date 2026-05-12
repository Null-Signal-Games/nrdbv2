import type { Card, Printing } from './types.js';
import { NRDB_API_URL, NRDB_IMAGE_URL } from './constants.js';

const NO_XLARGE_CYCLES = [
	'system_core_2019',
	'magnum_opus_reprint',
	'salvaged_memories',
	'system_update_2021'
];

export function adaptCard(row: UnifiedCardRow): Card {
	const id = row.id;
	const printing_ids = parseJsonWithDefault(row.printing_ids) as string[];
	const latest_printing_id = printing_ids.length > 0 ? printing_ids[0] : null;

	const printings_released_by = parseJsonWithDefault(row.printings_released_by) as string[];
	const card_cycle_ids = parseJsonWithDefault(row.card_cycle_ids) as string[];
	const card_subtype_ids = parseJsonWithDefault(row.card_subtype_ids) as string[];

	const hasXlarge =
		printings_released_by.includes('null_signal_games') &&
		!NO_XLARGE_CYCLES.includes(card_cycle_ids[0]);
	const hasNarrative = Boolean(row.narrative_text);

	return {
		id,
		type: 'cards',
		attributes: {
			...getSharedAttributes(row, latest_printing_id),
			date_release: row.date_release,
			layout_id: row.layout_id,
			printings_released_by: printings_released_by,
			latest_printing_id,
			latest_printing_images: latest_printing_id
				? buildImages(latest_printing_id, hasNarrative, hasXlarge)
				: null
		},
		relationships: {
			card_cycles: buildRel('card_cycles', toStringArrary(row.card_cycle_ids).join(',')),
			card_sets: buildRel('card_sets', toStringArrary(row.card_set_ids).join(',')),
			card_subtypes: buildRel(
				'card_subtypes',
				card_subtype_ids.length > 0 ? card_subtype_ids.join(',') : 'none'
			),
			card_type: buildRel(`card_types/${row.card_type_id}`),
			faction: buildRel(`factions/${row.faction_id}`),
			printings: buildRel('printings', id, 'card_id'),
			rulings: buildRel('rulings', id, 'card_id'),
			reviews: buildRel('reviews', id, 'card_id'),
			side: buildRel(`sides/${row.side_id}`),
			decklists: buildRel('decklists', id, 'card_id'),
			card_pools: buildRel('card_pools', id, 'card_id')
		},
		links: {
			self: `${NRDB_API_URL}/cards/${id}`
		}
	} as unknown as Card;
}

export function adaptPrinting(row: UnifiedPrintingRow): Printing {
	const id = row.id;
	const card_id = row.card_id;
	const illustrator_ids = parseJsonWithDefault(row.illustrator_ids) as string[];
	const printing_ids = parseJsonWithDefault(row.printing_ids) as string[];
	const card_subtype_ids = parseJsonWithDefault(row.card_subtype_ids) as string[];

	const hasXlarge =
		row.released_by === 'null_signal_games' &&
		![
			'system_core_2019',
			'magnum_opus_reprint',
			'salvaged_memories',
			'system_update_2021'
		].includes(row.card_cycle_id);

	const hasNarrative = Boolean(row.narrative_text);

	return {
		id,
		type: 'printings',
		attributes: {
			card_id,
			card_cycle_id: row.card_cycle_id,
			card_cycle_name: row.card_cycle_name,
			card_set_id: row.card_set_id,
			card_set_name: row.card_set_name,
			flavor: row.flavor || null,
			display_illustrators: row.display_illustrators || null,
			illustrator_ids,
			illustrator_names: parseJsonWithDefault(row.illustrator_names) as string[],
			position: row.position,
			position_in_set: row.position_in_set,
			quantity: row.quantity,
			date_release: row.date_release,
			...getSharedAttributes(row, id),
			card_subtype_names: parseJsonWithDefault(row.card_subtype_names) as string[],
			released_by: row.released_by,
			printings_released_by: parseJsonWithDefault(row.printings_released_by) as string[],
			images: buildImages(id, hasNarrative, hasXlarge),
			latest_printing_id:
				Boolean(row.is_latest_printing) || String(row.is_latest_printing) === '1'
					? id
					: printing_ids[0] || id,
			is_latest_printing:
				Boolean(row.is_latest_printing) || String(row.is_latest_printing) === '1'
		},
		relationships: {
			card: buildRel(`cards/${card_id}`),
			card_cycle: buildRel(`card_cycles/${row.card_cycle_id}`),
			card_set: buildRel(`card_sets/${row.card_set_id}`),
			card_type: buildRel(`card_types/${row.card_type_id}`),
			faction: buildRel(`factions/${row.faction_id}`),
			side: buildRel(`sides/${row.side_id}`),
			card_subtypes: buildRel(
				'card_subtypes',
				card_subtype_ids.length > 0 ? card_subtype_ids.join(',') : ''
			),
			illustrators: buildRel(
				'illustrators',
				illustrator_ids.length > 0 ? illustrator_ids.join(',') : ''
			),
			card_pools: buildRel('card_pools', id, 'printing_id')
		},
		links: {
			self: `${NRDB_API_URL}/printings/${id}`
		}
	} as unknown as Printing;
}

function toNum(val: unknown): number | null {
	return val !== null && val !== undefined ? Number(val) : null;
}

function toBool(val: unknown): boolean {
	return Boolean(val);
}

function toStringArrary(val: unknown): string[] {
	return parseJsonWithDefault(val) as string[];
}

function buildRel(path: string, filterId?: string | null, filterField: string = 'id') {
	if (filterId !== undefined && filterId !== null && filterId !== '' && filterId !== 'none') {
		return { links: { related: `${NRDB_API_URL}/${path}?filter[${filterField}]=${filterId}` } };
	}
	if (filterId === 'none' || filterId === '') {
		return { links: { related: `${NRDB_API_URL}/${path}?filter[${filterField}]=${filterId}` } };
	}
	return { links: { related: `${NRDB_API_URL}/${path}` } };
}

// Helper to safely parse JSON strings from SQLite.  Returns [] if undefined or parsing fails.
function parseJsonWithDefault(val: unknown): unknown {
	const fallback: unknown[] = [];
	if (typeof val === 'string') {
		try {
			return JSON.parse(val);
		} catch {
			return fallback;
		}
	}
	return val ?? fallback;
}

// Convert "2026-05-09 22:43:54.826250" to "2026-05-09T22:43:54+00:00"
function formatTimestamp(dateStr: string | null): string | null {
	if (!dateStr) return null;
	const match = dateStr.match(/^(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2}:\d{2})/);
	if (match) {
		return `${match[1]}T${match[2]}+00:00`;
	}
	return dateStr;
}

// Helper to transform ["key=value"] into { "key": "value" }
function parseKVArrayToObject(val: unknown): Record<string, unknown> {
	const parsed = parseJsonWithDefault(val);
	if (Array.isArray(parsed) && parsed.length === 0) return {};
	if (Array.isArray(parsed)) {
		return parsed.reduce(
			(acc: Record<string, unknown>, curr: unknown) => {
				if (typeof curr === 'string' && curr.includes('=')) {
					const [key, value] = curr.split('=');

					// Try parsing the value as a number if appropriate
					const num = Number(value);
					acc[key] = !isNaN(num) ? num : value;
				}
				return acc;
			},
			{} as Record<string, unknown>
		);
	}
	return parsed as Record<string, unknown>;
}

function buildImages(id_prefix: string, hasNarrative: boolean, hasXlarge: boolean) {
	return {
		nrdb_classic: {
			tiny: `${NRDB_IMAGE_URL}/tiny/${id_prefix}.jpg`,
			small: `${NRDB_IMAGE_URL}/small/${id_prefix}.jpg`,
			medium: `${NRDB_IMAGE_URL}/medium/${id_prefix}.jpg`,
			large: `${NRDB_IMAGE_URL}/large/${id_prefix}.jpg`,
			...(hasNarrative
				? {
						narrative: `${NRDB_IMAGE_URL}/xlarge/${id_prefix}-narrative.webp`
					}
				: {}),
			...(hasXlarge
				? {
						xlarge: `${NRDB_IMAGE_URL}/xlarge/${id_prefix}.webp`
					}
				: {})
		}
	};
}

function buildFaces(row: UnifiedCardRow | UnifiedPrintingRow, id_prefix: string | null) {
	const released_by_check =
		('released_by' in row ? row.released_by === 'null_signal_games' : false) ||
		toStringArrary(row.printings_released_by).includes('null_signal_games');
	const cycle_check =
		('card_cycle_id' in row ? row.card_cycle_id : '') ||
		toStringArrary(row.card_cycle_ids)[0];

	const hasXlarge = released_by_check && !NO_XLARGE_CYCLES.includes(cycle_check);

	const face_indices = parseJsonWithDefault(row.face_indices) as number[];
	const faces_title = parseJsonWithDefault(row.faces_title) as (string | null)[];
	const faces_text = parseJsonWithDefault(row.faces_text) as (string | null)[];
	const faces_stripped_title = parseJsonWithDefault(row.faces_stripped_title) as (
		| string
		| null
	)[];
	const faces_stripped_text = parseJsonWithDefault(row.faces_stripped_text) as (string | null)[];
	const faces_card_subtype_ids = parseJsonWithDefault(row.faces_card_subtype_ids) as string[][];
	const faces_display_subtypes = parseJsonWithDefault(row.faces_display_subtypes) as (
		| string
		| null
	)[];
	const faces_base_link = parseJsonWithDefault(row.faces_base_link) as (string | number | null)[];
	const faces_flavor = parseJsonWithDefault('faces_flavor' in row ? row.faces_flavor : null) as (
		| string
		| null
	)[];
	const faces_copy_quantity = parseJsonWithDefault(
		'faces_copy_quantity' in row ? row.faces_copy_quantity : null
	) as (number | null)[];

	return face_indices.map((index: number, i: number) => {
		const result: Record<string, unknown> = {
			images: id_prefix ? buildImages(`${id_prefix}-${index}`, false, hasXlarge) : null,
			index,
			stripped_text: faces_stripped_text[i] ?? null,
			stripped_title: faces_stripped_title[i] ?? null,
			text: faces_text[i] ?? null,
			title: faces_title[i] ?? null,
			flavor: faces_flavor[i] ?? null
		};

		if (faces_card_subtype_ids[i] && faces_card_subtype_ids[i].length > 0) {
			result.card_subtype_ids = faces_card_subtype_ids[i];
		}

		if (faces_display_subtypes[i]) {
			result.display_subtypes = faces_display_subtypes[i];
		} else {
			result.display_subtypes = null;
		}

		if (faces_copy_quantity[i]) {
			result.copy_quantity = faces_copy_quantity[i];
		}

		Object.keys(result).forEach((key) => {
			if (result[key] === undefined || result[key] === null) {
				delete result[key];
			}
		});

		if (faces_base_link[i] !== undefined && faces_base_link[i] !== null) {
			result.base_link = String(faces_base_link[i]);
		}

		return result;
	});
}

function getSharedAttributes(row: UnifiedCardRow | UnifiedPrintingRow, id_prefix: string | null) {
	const advancement_requirement =
		row.advancement_requirement === -1
			? 'X'
			: toNum(row.advancement_requirement) !== null
				? String(row.advancement_requirement)
				: null;
	const cost = row.cost === -1 ? 'X' : toNum(row.cost) !== null ? String(row.cost) : null;
	const card_subtype_ids = toStringArrary(row.card_subtype_ids);
	const printing_ids = toStringArrary(row.printing_ids);

	return {
		stripped_title: row.stripped_title,
		title: row.title,
		card_type_id: row.card_type_id,
		side_id: row.side_id,
		faction_id: row.faction_id,
		cost,
		advancement_requirement,
		agenda_points: toNum(row.agenda_points),
		base_link: toNum(row.base_link),
		deck_limit: toNum(row.deck_limit),
		in_restriction: toBool(row.in_restriction),
		influence_cost: toNum(row.influence_cost),
		influence_limit: toNum(row.influence_limit),
		memory_cost: toNum(row.memory_cost),
		minimum_deck_size: toNum(row.minimum_deck_size),
		num_printings: toNum(row.num_printings),
		printing_ids,
		restriction_ids: toStringArrary(row.restriction_ids),
		strength: toNum(row.strength),
		stripped_text: row.stripped_text,
		text: row.text,
		trash_cost: toNum(row.trash_cost),
		is_unique: toBool(row.is_unique),
		card_subtype_ids,
		display_subtypes: row.display_subtypes,
		attribution: row.attribution,
		updated_at: formatTimestamp(row.updated_at),
		format_ids: parseJsonWithDefault(row.format_ids),
		card_pool_ids: parseJsonWithDefault(row.card_pool_ids),
		snapshot_ids: parseJsonWithDefault(row.snapshot_ids),
		card_cycle_ids: parseJsonWithDefault(row.card_cycle_ids),
		card_cycle_names: parseJsonWithDefault(row.card_cycle_names),
		card_set_ids: parseJsonWithDefault(row.card_set_ids),
		card_set_names: parseJsonWithDefault(row.card_set_names),
		designed_by: row.designed_by,
		narrative_text: row.narrative_text,
		pronouns: row.pronouns,
		pronunciation_approximation: row.pronunciation_approximation,
		pronunciation_ipa: row.pronunciation_ipa,
		num_extra_faces:
			row.num_extra_faces !== null && row.num_extra_faces !== undefined
				? Number(row.num_extra_faces)
				: 0,
		card_abilities: {
			additional_cost: Boolean(row.additional_cost),
			advanceable: Boolean(row.advanceable),
			charge: Boolean(row.charge),
			gains_subroutines: Boolean(row.gains_subroutines),
			gains_click: Boolean(row.gains_click),
			has_paid_ability: Boolean(row.has_paid_ability),
			install_effect: Boolean(row.install_effect),
			interrupt: Boolean(row.interrupt),
			link_provided:
				row.link_provided !== null && row.link_provided !== undefined
					? Number(row.link_provided)
					: null,
			mark: Boolean(row.mark),
			mu_provided:
				row.mu_provided !== null && row.mu_provided !== undefined
					? Number(row.mu_provided)
					: null,
			num_printed_subroutines:
				row.num_printed_subroutines !== null && row.num_printed_subroutines !== undefined
					? Number(row.num_printed_subroutines)
					: null,
			on_encounter_effect: Boolean(row.on_encounter_effect),
			performs_trace: Boolean(row.performs_trace),
			recurring_credits_provided:
				row.recurring_credits_provided !== null &&
				row.recurring_credits_provided !== undefined
					? Number(row.recurring_credits_provided)
					: null,
			rez_effect: Boolean(row.rez_effect),
			sabotage: Boolean(row.sabotage),
			score_effect: Boolean(row.score_effect),
			steal_effect: Boolean(row.steal_effect),
			trash_ability: Boolean(row.trash_ability)
		},
		restrictions: {
			banned: parseJsonWithDefault(row.restrictions_banned),
			global_penalty: parseJsonWithDefault(row.restrictions_global_penalty),
			points: parseKVArrayToObject(row.restrictions_points),
			restricted: parseJsonWithDefault(row.restrictions_restricted),
			universal_faction_cost: parseKVArrayToObject(row.restrictions_universal_faction_cost)
		},
		faces: buildFaces(row, id_prefix)
	};
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
