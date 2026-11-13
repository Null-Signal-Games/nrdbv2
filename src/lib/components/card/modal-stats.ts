import type { Card, Printing } from '$lib/types';

export type CardModalAttributes = Card['attributes'] | Printing['attributes'];

export type CardModalStat = {
	value: string;
	announcement: string;
	icon?: 'agenda_points' | 'mu' | 'trash';
};

type CardModalStats = {
	title: CardModalStat | undefined;
	footer: CardModalStat[];
};

export const getCardModalStats = (attributes: CardModalAttributes): CardModalStats => {
	const type = attributes.card_type_id;
	let title: CardModalStat | undefined;
	const footer: CardModalStat[] = [];

	if (
		type === 'agenda' &&
		attributes.advancement_requirement != null &&
		attributes.agenda_points != null
	) {
		title = {
			value: `${attributes.advancement_requirement} / ${attributes.agenda_points}`,
			announcement: `Advancement requirement: ${attributes.advancement_requirement} and agenda points: ${attributes.agenda_points}`,
			icon: 'agenda_points'
		};
	}

	if (type === 'program' && attributes.memory_cost != null) {
		const value = String(attributes.memory_cost);
		footer.push({ value, announcement: `Memory cost: ${value}`, icon: 'mu' });
	}

	if (type === 'program' || attributes.strength != null) {
		const value = String(attributes.strength ?? '-');
		footer.push({ value: `${value} strength`, announcement: `Strength: ${value}` });
	}

	if (
		(type === 'corp_identity' || type === 'runner_identity') &&
		attributes.minimum_deck_size != null &&
		attributes.influence_limit != null
	) {
		footer.push({
			value: `${attributes.minimum_deck_size} / ${attributes.influence_limit}`,
			announcement: `Minimum deck size: ${attributes.minimum_deck_size} and influence limit: ${attributes.influence_limit}`
		});
	}

	if (attributes.trash_cost != null) {
		const value = String(attributes.trash_cost);
		footer.push({ value, announcement: `Trash cost: ${value}`, icon: 'trash' });
	}

	return { title, footer };
};
