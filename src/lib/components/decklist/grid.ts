import type { Card, CardGroup, CardTypeIds } from '$lib/types';
import type { CardSlots } from './card_slots';

type DeckGridCardType = Exclude<CardTypeIds, 'corp_identity' | 'runner_identity'>;

const CARD_TYPE_ORDER = {
	runner_identity: 0,
	corp_identity: 1,
	event: 2,
	hardware: 3,
	program: 4,
	resource: 5,
	agenda: 6,
	asset: 7,
	operation: 8,
	upgrade: 9,
	ice: 10
} satisfies Record<CardTypeIds, number>;

export interface DeckGridItem {
	readonly card: Card;
	readonly copies: number;
}

export interface DeckGridGroup {
	readonly type: DeckGridCardType;
	readonly items: readonly DeckGridItem[];
	readonly totalCopies: number;
}

export type DeckGridModel = readonly DeckGridGroup[];

interface BuildDeckGridModelOptions {
	readonly groups: readonly CardGroup[];
	readonly cardSlots: CardSlots;
}

export const buildDeckGridModel = ({
	groups,
	cardSlots
}: BuildDeckGridModelOptions): DeckGridModel => {
	const model: DeckGridGroup[] = [];
	const orderedGroups = [...groups].sort(
		(left, right) => CARD_TYPE_ORDER[left.type] - CARD_TYPE_ORDER[right.type]
	);

	for (const group of orderedGroups) {
		if (group.type === 'corp_identity' || group.type === 'runner_identity') {
			continue;
		}

		const items: DeckGridItem[] = [];
		let totalCopies = 0;

		for (const card of group.data) {
			const copies = cardSlots[card.id] ?? 0;
			if (copies <= 0) {
				continue;
			}

			items.push({ card, copies });
			totalCopies += copies;
		}

		if (items.length > 0) {
			model.push({ type: group.type, items, totalCopies });
		}
	}

	return model;
};
