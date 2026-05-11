import type { Card } from './types';

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
	const faces_display_subtypes = parseJsonSafe(row.faces_display_subtypes, []) as (string | null)[];
	const faces_base_link = parseJsonSafe(row.faces_base_link, []) as (string | number | null)[];

	const faces = face_indices.map((index: number, i: number) => {
		const result: Record<string, unknown> = {
			card_subtype_ids: faces_card_subtype_ids[i] ?? [],
			display_subtypes: faces_display_subtypes[i] ?? null,
			images: latest_printing_id
				? {
						nrdb_classic: {
							tiny: `https://card-images.netrunnerdb.com/v2/tiny/${latest_printing_id}-${index}.jpg`,
							small: `https://card-images.netrunnerdb.com/v2/small/${latest_printing_id}-${index}.jpg`,
							medium: `https://card-images.netrunnerdb.com/v2/medium/${latest_printing_id}-${index}.jpg`,
							large: `https://card-images.netrunnerdb.com/v2/large/${latest_printing_id}-${index}.jpg`,
							...(hasXlarge
								? {
										xlarge: `https://card-images.netrunnerdb.com/v2/xlarge/${latest_printing_id}-${index}.webp`
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
							tiny: `https://card-images.netrunnerdb.com/v2/tiny/${latest_printing_id}.jpg`,
							small: `https://card-images.netrunnerdb.com/v2/small/${latest_printing_id}.jpg`,
							medium: `https://card-images.netrunnerdb.com/v2/medium/${latest_printing_id}.jpg`,
							large: `https://card-images.netrunnerdb.com/v2/large/${latest_printing_id}.jpg`,
							...(hasNarrative
								? {
										narrative: `https://card-images.netrunnerdb.com/v2/xlarge/${latest_printing_id}-narrative.webp`
									}
								: {}),
							...(hasXlarge
								? {
										xlarge: `https://card-images.netrunnerdb.com/v2/xlarge/${latest_printing_id}.webp`
									}
								: {})
						}
					}
				: null
		},
		relationships: {
			card_cycles: {
				links: {
					related: `https://api.netrunnerdb.com/api/v3/public/card_cycles?filter[id]=${(parseJsonSafe(row.card_cycle_ids, []) as string[]).join(',')}`
				}
			},
			card_sets: {
				links: {
					related: `https://api.netrunnerdb.com/api/v3/public/card_sets?filter[id]=${(parseJsonSafe(row.card_set_ids, []) as string[]).join(',')}`
				}
			},
			card_subtypes: {
				links: {
					related: `https://api.netrunnerdb.com/api/v3/public/card_subtypes?filter[id]=${card_subtype_ids.length > 0 ? card_subtype_ids.join(',') : 'none'}`
				}
			},
			card_type: {
				links: {
					related: `https://api.netrunnerdb.com/api/v3/public/card_types/${row.card_type_id}`
				}
			},
			faction: {
				links: {
					related: `https://api.netrunnerdb.com/api/v3/public/factions/${row.faction_id}`
				}
			},
			printings: {
				links: {
					related: `https://api.netrunnerdb.com/api/v3/public/printings?filter[card_id]=${id}`
				}
			},
			rulings: {
				links: {
					related: `https://api.netrunnerdb.com/api/v3/public/rulings?filter[card_id]=${id}`
				}
			},
			reviews: {
				links: {
					related: `https://api.netrunnerdb.com/api/v3/public/reviews?filter[card_id]=${id}`
				}
			},
			side: {
				links: {
					related: `https://api.netrunnerdb.com/api/v3/public/sides/${row.side_id}`
				}
			},
			decklists: {
				links: {
					related: `https://api.netrunnerdb.com/api/v3/public/decklists?filter[card_id]=${id}`
				}
			},
			card_pools: {
				links: {
					related: `https://api.netrunnerdb.com/api/v3/public/card_pools?filter[card_id]=${id}`
				}
			}
		},
		links: {
			self: `https://api.netrunnerdb.com/api/v3/public/cards/${id}`
		}
	} as unknown as Card; // Cast through unknown to avoid deep Card interface minor discrepancies
}
