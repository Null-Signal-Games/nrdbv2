import type { Card, Printing, UnifiedCardRow, UnifiedPrintingRow } from './types.js';
import { NRDB_API_URL, NRDB_IMAGE_URL } from './constants.js';

const NO_XLARGE_CYCLES = [
	'system_core_2019',
	'magnum_opus_reprint',
	'salvaged_memories',
	'system_update_2021'
];

export function adaptCard(row: UnifiedCardRow): Card {
	const id = row.id;
	const printing_ids = toStringArray(row.printing_ids);
	const latest_printing_id = printing_ids.length > 0 ? printing_ids[0] : null;

	const printings_released_by = toStringArray(row.printings_released_by);
	const card_cycle_ids = toStringArray(row.card_cycle_ids);
	const card_subtype_ids = toStringArray(row.card_subtype_ids);

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
			card_cycles: buildRel('card_cycles', toStringArray(row.card_cycle_ids).join(',')),
			card_sets: buildRel('card_sets', toStringArray(row.card_set_ids).join(',')),
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
	const illustrator_ids = toStringArray(row.illustrator_ids);
	const printing_ids = toStringArray(row.printing_ids);
	const card_subtype_ids = toStringArray(row.card_subtype_ids);

	const hasXlarge =
		row.released_by === 'null_signal_games' && !NO_XLARGE_CYCLES.includes(row.card_cycle_id);

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
			illustrator_names: toStringArray(row.illustrator_names),
			position: row.position,
			position_in_set: row.position_in_set,
			quantity: row.quantity,
			date_release: row.date_release,
			...getSharedAttributes(row, id),
			card_subtype_names: toStringArray(row.card_subtype_names),
			released_by: row.released_by,
			printings_released_by: toStringArray(row.printings_released_by),
			images: buildImages(id, hasNarrative, hasXlarge),
			latest_printing_id: row.is_latest_printing ? id : printing_ids[0] || id,
			is_latest_printing: Boolean(row.is_latest_printing)
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

function toStringArray(val: unknown): string[] {
	return parseJsonWithDefault(val) as string[];
}

function buildRel(path: string, filterId?: string | null, filterField: string = 'id') {
	if (filterId !== undefined && filterId !== null) {
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
		toStringArray(row.printings_released_by).includes('null_signal_games');
	const cycle_check =
		('card_cycle_id' in row ? row.card_cycle_id : '') || toStringArray(row.card_cycle_ids)[0];

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
			: row.advancement_requirement !== null
				? String(row.advancement_requirement)
				: null;
	const cost = row.cost === -1 ? 'X' : row.cost !== null ? String(row.cost) : null;
	const card_subtype_ids = toStringArray(row.card_subtype_ids);
	const printing_ids = toStringArray(row.printing_ids);

	return {
		stripped_title: row.stripped_title,
		title: row.title,
		card_type_id: row.card_type_id,
		side_id: row.side_id,
		faction_id: row.faction_id,
		cost,
		advancement_requirement,
		agenda_points: row.agenda_points,
		base_link: row.base_link,
		deck_limit: row.deck_limit,
		in_restriction: Boolean(row.in_restriction),
		influence_cost: row.influence_cost,
		influence_limit: row.influence_limit,
		memory_cost: row.memory_cost,
		minimum_deck_size: row.minimum_deck_size,
		num_printings: row.num_printings,
		printing_ids,
		restriction_ids: toStringArray(row.restriction_ids),
		strength: row.strength,
		stripped_text: row.stripped_text,
		text: row.text,
		trash_cost: row.trash_cost,
		is_unique: Boolean(row.is_unique),
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
		num_extra_faces: row.num_extra_faces ?? 0,
		card_abilities: {
			additional_cost: Boolean(row.additional_cost),
			advanceable: Boolean(row.advanceable),
			charge: Boolean(row.charge),
			gains_subroutines: Boolean(row.gains_subroutines),
			gains_click: Boolean(row.gains_click),
			has_paid_ability: Boolean(row.has_paid_ability),
			install_effect: Boolean(row.install_effect),
			interrupt: Boolean(row.interrupt),
			link_provided: row.link_provided,
			mark: Boolean(row.mark),
			mu_provided: row.mu_provided,
			num_printed_subroutines: row.num_printed_subroutines,
			on_encounter_effect: Boolean(row.on_encounter_effect),
			performs_trace: Boolean(row.performs_trace),
			recurring_credits_provided: row.recurring_credits_provided,
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
