import { NRDB_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { ApiResponse, Format, Printing, Restriction } from '$lib/types';

const FORMAT_IDS = ['startup', 'standard', 'eternal'];

function capitalize(text: string): string {
	return text.charAt(0).toUpperCase() + text.slice(1);
}

export interface BanCardGroup {
	banned: Printing[];
	restricted: Printing[];
	global_penalty: Printing[];
	onePoint: Printing[];
	twoPoints: Printing[];
	threePoints: Printing[];
	oneUniversalInfluence: Printing[];
	threeUniversalInfluence: Printing[];
}

export interface ProcessedRestriction {
	id: string;
	name: string;
	date_start: string;
	banned_subtype: string | null;
	formatted_banned_subtype: string | null;
	has_points: boolean;
	has_universal_influence: boolean;
	corp: BanCardGroup;
	runner: BanCardGroup;
}

export interface ProcessedFormat {
	id: string;
	name: string;
	restrictions: ProcessedRestriction[];
}

function emptyCardGroup(): BanCardGroup {
	return {
		banned: [],
		restricted: [],
		global_penalty: [],
		onePoint: [],
		twoPoints: [],
		threePoints: [],
		oneUniversalInfluence: [],
		threeUniversalInfluence: []
	};
}

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	if (cookies.get('nrdb_cache') === '1') return { formats: null };

	// 1. Fetch all formats
	const formatsRes = await fetch(`${NRDB_API_URL}/formats?page[size]=20`);
	const formatsJson: ApiResponse<Format> = await formatsRes.json();
	const targetFormats = formatsJson.data.filter((f) => FORMAT_IDS.includes(f.id));

	// 2. Fetch restrictions for each format in parallel
	const restrictionsResponses = await Promise.all(
		targetFormats.map((f) =>
			fetch(`${NRDB_API_URL}/restrictions?filter[format_id]=${f.id}&page[size]=100`)
		)
	);
	const restrictionsJsons: ApiResponse<Restriction>[] = await Promise.all(
		restrictionsResponses.map((r) => r.json())
	);

	// 3. Collect all unique card IDs referenced in verdicts
	const cardIds = new Set<string>();
	restrictionsJsons.forEach((json) => {
		json.data.forEach((restriction) => {
			const v = restriction.attributes.verdicts;
			v.banned.forEach((id) => cardIds.add(id));
			v.restricted.forEach((id) => cardIds.add(id));
			v.global_penalty.forEach((id) => cardIds.add(id));
			Object.keys(v.points).forEach((id) => cardIds.add(id));
			Object.keys(v.universal_faction_cost).forEach((id) => cardIds.add(id));
		});
	});

	// 4. Fetch one printing per card for all collected IDs
	const cardIdsArray = Array.from(cardIds).sort();
	const printingsRes = await fetch(
		`${NRDB_API_URL}/printings?filter[card_id]=${cardIdsArray.join(',')}&filter[distinct_cards]=true&page[size]=2000`
	);
	const printingsJson: ApiResponse<Printing> = await printingsRes.json();

	const cards = new Map<string, Printing>();
	printingsJson.data.forEach((p) => {
		if (!cards.has(p.attributes.card_id)) {
			cards.set(p.attributes.card_id, p);
		}
	});

	// 5. Build processed format/restriction data
	const formats: ProcessedFormat[] = targetFormats.map((format, i) => {
		const restrictions: ProcessedRestriction[] = restrictionsJsons[i].data.map(
			(restriction) => {
				const v = restriction.attributes.verdicts;
				const banned_subtype = restriction.attributes.banned_subtypes[0] ?? null;

				const processed: ProcessedRestriction = {
					id: restriction.id,
					name: restriction.attributes.name,
					date_start: restriction.attributes.date_start,
					banned_subtype,
					formatted_banned_subtype: banned_subtype ? capitalize(banned_subtype) : null,
					has_points: false,
					has_universal_influence: false,
					corp: emptyCardGroup(),
					runner: emptyCardGroup()
				};

				v.banned.forEach((cardId) => {
					const card = cards.get(cardId);
					if (!card) return;
					if (banned_subtype && card.attributes.card_subtype_ids.includes(banned_subtype))
						return;
					if (card.attributes.side_id === 'corp') processed.corp.banned.push(card);
					else if (card.attributes.side_id === 'runner')
						processed.runner.banned.push(card);
				});

				v.restricted.forEach((cardId) => {
					const card = cards.get(cardId);
					if (!card) return;
					if (card.attributes.side_id === 'corp') processed.corp.restricted.push(card);
					else if (card.attributes.side_id === 'runner')
						processed.runner.restricted.push(card);
				});

				v.global_penalty.forEach((cardId) => {
					const card = cards.get(cardId);
					if (!card) return;
					if (card.attributes.side_id === 'corp')
						processed.corp.global_penalty.push(card);
					else if (card.attributes.side_id === 'runner')
						processed.runner.global_penalty.push(card);
				});

				Object.entries(v.points).forEach(([cardId, points]) => {
					processed.has_points = true;
					const card = cards.get(cardId);
					if (!card) return;
					const n = Number(points);
					if (card.attributes.side_id === 'corp') {
						if (n === 1) processed.corp.onePoint.push(card);
						else if (n === 2) processed.corp.twoPoints.push(card);
						else if (n === 3) processed.corp.threePoints.push(card);
					} else if (card.attributes.side_id === 'runner') {
						if (n === 1) processed.runner.onePoint.push(card);
						else if (n === 2) processed.runner.twoPoints.push(card);
						else if (n === 3) processed.runner.threePoints.push(card);
					}
				});

				Object.entries(v.universal_faction_cost).forEach(([cardId, cost]) => {
					processed.has_universal_influence = true;
					const card = cards.get(cardId);
					if (!card) return;
					const n = Number(cost);
					if (card.attributes.side_id === 'corp') {
						if (n === 1) processed.corp.oneUniversalInfluence.push(card);
						else if (n === 3) processed.corp.threeUniversalInfluence.push(card);
					} else if (card.attributes.side_id === 'runner') {
						if (n === 1) processed.runner.oneUniversalInfluence.push(card);
						else if (n === 3) processed.runner.threeUniversalInfluence.push(card);
					}
				});

				return processed;
			}
		);

		return {
			id: format.id,
			name: format.attributes.name,
			restrictions
		};
	});

	return { formats };
};
