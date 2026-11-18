import { adaptCard, adaptCardSet } from './adapter';
import { sql } from './sqlite';
import type { Card, CardSetRow, Set, UnifiedCardRow } from './types';

export interface DeckCards {
	cards: Card[];
	sets: Set[];
}

export const loadDeckCards = async (card_ids: string[]): Promise<DeckCards | null> => {
	const ids = JSON.stringify(card_ids);
	const rows: UnifiedCardRow[] =
		await sql`SELECT * FROM unified_cards WHERE id IN (SELECT value FROM json_each(${ids}))`;

	if (rows.length === 0 && card_ids.length > 0) return null;

	const cards = rows.map(adaptCard);
	const set_ids = JSON.stringify([
		...new Set(cards.flatMap((card) => card.attributes.card_set_ids))
	]);
	const set_rows: CardSetRow[] =
		await sql`SELECT * FROM card_sets WHERE id IN (SELECT value FROM json_each(${set_ids}))`;

	return { cards, sets: set_rows.map(adaptCardSet) };
};
