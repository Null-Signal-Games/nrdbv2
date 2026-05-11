import type { Card, Printing, CardTypeIds, CardSubTypeIds } from './types.js';
import { NRDB_API_URL, NRDB_IMAGE_URL } from './constants.js';

// Helper to safely parse JSON strings from SQLite
function parseJsonSafe(val: unknown, fallback: unknown = []): unknown {
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
function formatUpdatedAt(dateStr: string | null): string | null {
	if (!dateStr) return null;
	const match = dateStr.match(/^(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2}:\d{2})/);
	if (match) {
		return `${match[1]}T${match[2]}+00:00`;
	}
	return dateStr;
}

// Helper to transform ["key=value"] into { "key": "value" }
function parseKVArrayToObject(val: unknown): Record<string, unknown> {
	const parsed = parseJsonSafe(val, []);
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

export function adaptCard(row: Record<string, unknown>): Card {
	const id = row.id as string;

	const card_subtype_ids = parseJsonSafe(row.card_subtype_ids, []) as string[];
	const card_cycle_ids = parseJsonSafe(row.card_cycle_ids, []) as string[];
	const printings_released_by = parseJsonSafe(row.printings_released_by, []) as string[];

	const printing_ids = parseJsonSafe(row.printing_ids, []) as string[];

	// The printing_ids array from the API places the latest printing first natively in the DB array, so we must pick the first.
	const latest_printing_id = printing_ids.length > 0 ? printing_ids[0] : null;

	// Handle special cases where -1 stands for 'X'
	const advancement_requirement =
		row.advancement_requirement === -1
			? 'X'
			: row.advancement_requirement !== null
				? String(row.advancement_requirement)
				: null;
	const cost = row.cost === -1 ? 'X' : row.cost !== null ? String(row.cost) : null;

	const hasXlarge =
		printings_released_by.includes('null_signal_games') &&
		![
			'system_core_2019',
			'magnum_opus_reprint',
			'salvaged_memories',
			'system_update_2021'
		].includes(card_cycle_ids[0]);
	const hasNarrative = Boolean(row.narrative_text);

	const face_indices = parseJsonSafe(row.face_indices, []) as number[];
	const faces_title = parseJsonSafe(row.faces_title, []) as (string | null)[];
	const faces_text = parseJsonSafe(row.faces_text, []) as (string | null)[];
	const faces_stripped_title = parseJsonSafe(row.faces_stripped_title, []) as (string | null)[];
	const faces_stripped_text = parseJsonSafe(row.faces_stripped_text, []) as (string | null)[];
	const faces_card_subtype_ids = parseJsonSafe(row.faces_card_subtype_ids, []) as string[][];
	const faces_display_subtypes = parseJsonSafe(row.faces_display_subtypes, []) as (
		| string
		| null
	)[];
	const faces_base_link = parseJsonSafe(row.faces_base_link, []) as (string | number | null)[];

	const faces = face_indices.map((index: number, i: number) => {
		const result: Record<string, unknown> = {
			card_subtype_ids: faces_card_subtype_ids[i] ?? [],
			display_subtypes: faces_display_subtypes[i] ?? null,
			images: latest_printing_id
				? {
						nrdb_classic: {
							tiny: `${NRDB_IMAGE_URL}/tiny/${latest_printing_id}-${index}.jpg`,
							small: `${NRDB_IMAGE_URL}/small/${latest_printing_id}-${index}.jpg`,
							medium: `${NRDB_IMAGE_URL}/medium/${latest_printing_id}-${index}.jpg`,
							large: `${NRDB_IMAGE_URL}/large/${latest_printing_id}-${index}.jpg`,
							...(hasXlarge
								? {
										xlarge: `${NRDB_IMAGE_URL}/xlarge/${latest_printing_id}-${index}.webp`
									}
								: {})
						}
					}
				: null,
			index,
			stripped_text: faces_stripped_text[i] ?? null,
			stripped_title: faces_stripped_title[i] ?? null,
			text: faces_text[i],
			title: faces_title[i]
		};
		// Only keep properties that are defined
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

	return {
		id,
		type: 'cards',
		attributes: {
			stripped_title: row.stripped_title,
			title: row.title,
			card_type_id: row.card_type_id,
			side_id: row.side_id,
			faction_id: row.faction_id,
			cost: cost,
			advancement_requirement: advancement_requirement,
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
			date_release: row.date_release,
			restriction_ids: parseJsonSafe(row.restriction_ids, []),
			strength: row.strength,
			stripped_text: row.stripped_text,
			text: row.text,
			trash_cost: row.trash_cost,
			is_unique: Boolean(row.is_unique),
			card_subtype_ids,
			display_subtypes: row.display_subtypes,
			attribution: row.attribution,
			updated_at: formatUpdatedAt(row.updated_at as string | null),
			format_ids: parseJsonSafe(row.format_ids, []),
			card_pool_ids: parseJsonSafe(row.card_pool_ids, []),
			snapshot_ids: parseJsonSafe(row.snapshot_ids, []),
			card_cycle_ids: card_cycle_ids,
			card_cycle_names: parseJsonSafe(row.card_cycle_names, []),
			card_set_ids: parseJsonSafe(row.card_set_ids, []),
			card_set_names: parseJsonSafe(row.card_set_names, []),
			designed_by: row.designed_by,
			narrative_text: row.narrative_text,
			printings_released_by: printings_released_by,
			pronouns: row.pronouns,
			pronunciation_approximation: row.pronunciation_approximation,
			pronunciation_ipa: row.pronunciation_ipa,
			layout_id: row.layout_id,
			num_extra_faces: row.num_extra_faces ?? 0,
			faces: faces,
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
				banned: parseJsonSafe(row.restrictions_banned, []),
				global_penalty: parseJsonSafe(row.restrictions_global_penalty, []),
				points: parseKVArrayToObject(row.restrictions_points),
				restricted: parseJsonSafe(row.restrictions_restricted, []),
				universal_faction_cost: parseKVArrayToObject(
					row.restrictions_universal_faction_cost
				)
			},
			latest_printing_id,
			latest_printing_images: latest_printing_id
				? {
						nrdb_classic: {
							tiny: `${NRDB_IMAGE_URL}/tiny/${latest_printing_id}.jpg`,
							small: `${NRDB_IMAGE_URL}/small/${latest_printing_id}.jpg`,
							medium: `${NRDB_IMAGE_URL}/medium/${latest_printing_id}.jpg`,
							large: `${NRDB_IMAGE_URL}/large/${latest_printing_id}.jpg`,
							...(hasNarrative
								? {
										narrative: `${NRDB_IMAGE_URL}/xlarge/${latest_printing_id}-narrative.webp`
									}
								: {}),
							...(hasXlarge
								? {
										xlarge: `${NRDB_IMAGE_URL}/xlarge/${latest_printing_id}.webp`
									}
								: {})
						}
					}
				: null
		},
		relationships: {
			card_cycles: {
				links: {
					related: `${NRDB_API_URL}/card_cycles?filter[id]=${(parseJsonSafe(row.card_cycle_ids, []) as string[]).join(',')}`
				}
			},
			card_sets: {
				links: {
					related: `${NRDB_API_URL}/card_sets?filter[id]=${(parseJsonSafe(row.card_set_ids, []) as string[]).join(',')}`
				}
			},
			card_subtypes: {
				links: {
					related: `${NRDB_API_URL}/card_subtypes?filter[id]=${card_subtype_ids.length > 0 ? card_subtype_ids.join(',') : 'none'}`
				}
			},
			card_type: {
				links: {
					related: `${NRDB_API_URL}/card_types/${row.card_type_id}`
				}
			},
			faction: {
				links: {
					related: `${NRDB_API_URL}/factions/${row.faction_id}`
				}
			},
			printings: {
				links: {
					related: `${NRDB_API_URL}/printings?filter[card_id]=${id}`
				}
			},
			rulings: {
				links: {
					related: `${NRDB_API_URL}/rulings?filter[card_id]=${id}`
				}
			},
			reviews: {
				links: {
					related: `${NRDB_API_URL}/reviews?filter[card_id]=${id}`
				}
			},
			side: {
				links: {
					related: `${NRDB_API_URL}/sides/${row.side_id}`
				}
			},
			decklists: {
				links: {
					related: `${NRDB_API_URL}/decklists?filter[card_id]=${id}`
				}
			},
			card_pools: {
				links: {
					related: `${NRDB_API_URL}/card_pools?filter[card_id]=${id}`
				}
			}
		},
		links: {
			self: `${NRDB_API_URL}/cards/${id}`
		}
	} as unknown as Card; // Cast through unknown to avoid deep Card interface minor discrepancies
}

export function adaptPrinting(row: Record<string, unknown>): Printing {
	const id = row.id as string;
	const card_id = row.card_id as string;

	const card_subtype_ids = parseJsonSafe(row.card_subtype_ids, []) as string[];
	const illustrator_ids = parseJsonSafe(row.illustrator_ids, []) as string[];
	const printing_ids = parseJsonSafe(row.printing_ids, []) as string[];

	const advancement_requirement =
		row.advancement_requirement === -1
			? 'X'
			: row.advancement_requirement !== null
				? String(row.advancement_requirement)
				: null;
	const cost = row.cost === -1 ? 'X' : row.cost !== null ? String(row.cost) : null;

	const hasXlarge =
		row.released_by === 'null_signal_games' &&
		![
			'system_core_2019',
			'magnum_opus_reprint',
			'salvaged_memories',
			'system_update_2021'
		].includes(row.card_cycle_id as string);

	const hasNarrative = Boolean(row.narrative_text);

	const face_indices = parseJsonSafe(row.face_indices, []) as number[];
	const faces_title = parseJsonSafe(row.faces_title, []) as (string | null)[];
	const faces_text = parseJsonSafe(row.faces_text, []) as (string | null)[];
	const faces_stripped_title = parseJsonSafe(row.faces_stripped_title, []) as (string | null)[];
	const faces_stripped_text = parseJsonSafe(row.faces_stripped_text, []) as (string | null)[];
	const faces_card_subtype_ids = parseJsonSafe(row.faces_card_subtype_ids, []) as string[][];
	const faces_display_subtypes = parseJsonSafe(row.faces_display_subtypes, []) as (
		| string
		| null
	)[];
	const faces_base_link = parseJsonSafe(row.faces_base_link, []) as (string | number | null)[];
	const faces_flavor = parseJsonSafe(row.faces_flavor, []) as (string | null)[];
	const faces_copy_quantity = parseJsonSafe(row.faces_copy_quantity, []) as (number | null)[];

	const faces = face_indices.map((index: number, i: number) => {
		const result: Record<string, unknown> = {
			images: {
				nrdb_classic: {
					tiny: `${NRDB_IMAGE_URL}/tiny/${id}-${index}.jpg`,
					small: `${NRDB_IMAGE_URL}/small/${id}-${index}.jpg`,
					medium: `${NRDB_IMAGE_URL}/medium/${id}-${index}.jpg`,
					large: `${NRDB_IMAGE_URL}/large/${id}-${index}.jpg`,
					...(hasXlarge
						? {
								xlarge: `${NRDB_IMAGE_URL}/xlarge/${id}-${index}.webp`
							}
						: {})
				}
			},
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

	return {
		id,
		type: 'printings',
		attributes: {
			card_id,
			card_cycle_id: row.card_cycle_id as string,
			card_cycle_name: row.card_cycle_name as string,
			card_set_id: row.card_set_id as string,
			card_set_name: row.card_set_name as string,
			flavor: (row.flavor as string) || null,
			display_illustrators: (row.display_illustrators as string) || null,
			illustrator_ids,
			illustrator_names: parseJsonSafe(row.illustrator_names, []) as string[],
			position: Number(row.position),
			position_in_set: Number(row.position_in_set),
			quantity: Number(row.quantity),
			date_release: row.date_release as string,
			updated_at: formatUpdatedAt(row.updated_at as string | null) as string,
			stripped_title: row.stripped_title as string,
			title: row.title as string,
			card_type_id: row.card_type_id as CardTypeIds,
			side_id: row.side_id as string,
			faction_id: row.faction_id as string,
			advancement_requirement,
			cost,
			agenda_points: row.agenda_points !== null ? Number(row.agenda_points) : null,
			base_link: row.base_link !== null ? Number(row.base_link) : null,
			deck_limit: Number(row.deck_limit),
			in_restriction: Boolean(row.in_restriction),
			influence_cost: row.influence_cost !== null ? Number(row.influence_cost) : null,
			influence_limit: row.influence_limit !== null ? Number(row.influence_limit) : null,
			memory_cost: row.memory_cost !== null ? Number(row.memory_cost) : null,
			minimum_deck_size:
				row.minimum_deck_size !== null ? Number(row.minimum_deck_size) : null,
			num_printings: Number(row.num_printings),
			is_latest_printing:
				Boolean(row.is_latest_printing) || String(row.is_latest_printing) === '1',
			printing_ids,
			restriction_ids: parseJsonSafe(row.restriction_ids, []) as string[],
			strength: row.strength !== null ? Number(row.strength) : null,
			stripped_text: row.stripped_text as string,
			text: row.text as string,
			narrative_text: (row.narrative_text as string) || null,
			trash_cost: row.trash_cost !== null ? Number(row.trash_cost) : null,
			is_unique: Boolean(row.is_unique),
			card_subtype_ids: card_subtype_ids as unknown as CardSubTypeIds,
			card_subtype_names: parseJsonSafe(row.card_subtype_names, []) as string[],
			display_subtypes: (row.display_subtypes as string) || null,
			attribution: (row.attribution as string) || null,
			format_ids: parseJsonSafe(row.format_ids, []) as string[],
			card_pool_ids: parseJsonSafe(row.card_pool_ids, []) as string[],
			snapshot_ids: parseJsonSafe(row.snapshot_ids, []) as string[],
			card_cycle_ids: parseJsonSafe(row.card_cycle_ids, []) as string[],
			card_cycle_names: parseJsonSafe(row.card_cycle_names, []) as string[],
			card_set_ids: parseJsonSafe(row.card_set_ids, []) as string[],
			card_set_names: parseJsonSafe(row.card_set_names, []) as string[],
			designed_by: row.designed_by as string,
			released_by: row.released_by as string,
			printings_released_by: parseJsonSafe(row.printings_released_by, []) as string[],
			pronouns: (row.pronouns as string) || null,
			pronunciation_approximation: (row.pronunciation_approximation as string) || null,
			pronunciation_ipa: (row.pronunciation_ipa as string) || null,
			images: {
				nrdb_classic: {
					tiny: `${NRDB_IMAGE_URL}/tiny/${id}.jpg`,
					small: `${NRDB_IMAGE_URL}/small/${id}.jpg`,
					medium: `${NRDB_IMAGE_URL}/medium/${id}.jpg`,
					large: `${NRDB_IMAGE_URL}/large/${id}.jpg`,
					...(hasNarrative
						? {
								narrative: `${NRDB_IMAGE_URL}/xlarge/${id}-narrative.webp`
							}
						: {}),
					...(hasXlarge
						? {
								xlarge: `${NRDB_IMAGE_URL}/xlarge/${id}.webp`
							}
						: {})
				}
			},
			card_abilities: {
				additional_cost: Boolean(row.additional_cost),
				advanceable: Boolean(row.advanceable),
				charge: Boolean(row.charge),
				gains_subroutines: Boolean(row.gains_subroutines),
				gains_click: Boolean(row.gains_click),
				has_paid_ability: Boolean(row.has_paid_ability),
				install_effect: Boolean(row.install_effect),
				interrupt: Boolean(row.interrupt),
				link_provided: row.link_provided !== null ? Number(row.link_provided) : null,
				mark: Boolean(row.mark),
				mu_provided: row.mu_provided !== null ? Number(row.mu_provided) : null,
				num_printed_subroutines:
					row.num_printed_subroutines !== null
						? Number(row.num_printed_subroutines)
						: null,
				on_encounter_effect: Boolean(row.on_encounter_effect),
				performs_trace: Boolean(row.performs_trace),
				recurring_credits_provided:
					row.recurring_credits_provided !== null
						? Number(row.recurring_credits_provided)
						: null,
				rez_effect: Boolean(row.rez_effect),
				sabotage: Boolean(row.sabotage),
				score_effect: Boolean(row.score_effect),
				steal_effect: Boolean(row.steal_effect),
				trash_ability: Boolean(row.trash_ability)
			},
			latest_printing_id:
				Boolean(row.is_latest_printing) || String(row.is_latest_printing) === '1'
					? id
					: printing_ids[0] || id,
			restrictions: {
				banned: parseJsonSafe(row.restrictions_banned, []) as string[],
				global_penalty: parseJsonSafe(row.restrictions_global_penalty, []) as string[],
				points: parseKVArrayToObject(row.restrictions_points) as Record<string, string>,
				restricted: parseJsonSafe(row.restrictions_restricted, []) as string[],
				universal_faction_cost: parseKVArrayToObject(
					row.restrictions_universal_faction_cost
				) as Record<string, string>
			},
			num_extra_faces: row.num_extra_faces !== null ? Number(row.num_extra_faces) : 0,
			faces: faces
		},
		relationships: {
			card: {
				links: {
					related: `${NRDB_API_URL}/cards/${card_id}`
				}
			},
			card_cycle: {
				links: {
					related: `${NRDB_API_URL}/card_cycles/${row.card_cycle_id}`
				}
			},
			card_set: {
				links: {
					related: `${NRDB_API_URL}/card_sets/${row.card_set_id}`
				}
			},
			card_type: {
				links: {
					related: `${NRDB_API_URL}/card_types/${row.card_type_id}`
				}
			},
			faction: {
				links: {
					related: `${NRDB_API_URL}/factions/${row.faction_id}`
				}
			},
			side: {
				links: {
					related: `${NRDB_API_URL}/sides/${row.side_id}`
				}
			},
			card_subtypes: {
				links: {
					related: `${NRDB_API_URL}/card_subtypes?filter[id]=${card_subtype_ids.length > 0 ? card_subtype_ids.join(',') : ''}`
				}
			},
			illustrators: {
				links: {
					related: `${NRDB_API_URL}/illustrators?filter[id]=${illustrator_ids.length > 0 ? illustrator_ids.join(',') : ''}`
				}
			},
			card_pools: {
				links: {
					related: `${NRDB_API_URL}/card_pools?filter[printing_id]=${id}`
				}
			}
		},
		links: {
			self: `${NRDB_API_URL}/printings/${id}`
		}
	} as unknown as Printing;
}
