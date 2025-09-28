import { cards, cycles, sets, factions, formats, printings } from '$lib/store';
import type {
	ApiResponse,
	Card,
	Cycle,
	Set,
	Faction,
	Format,
	CardTypeIds,
	Decklist,
	Printing
} from '$lib/types';
import { db } from '$lib/db';

export const NRDB_API_URL = 'https://api.netrunnerdb.com/api/v3/public';
export const NRDB_CLASSIC_URL = 'https://netrunnerdb.com/en';
export const SEARCH_LIMIT = 20;
export const LOCAL_STORAGE_ALL_CARDS_KEY = 'allCards';

export const initialize_app_data = async () => {
	const [
		cards_response,
		cycles_response,
		sets_response,
		factions_response,
		formats_response,
		printings_response
	] = await Promise.all([
		fetch(`${NRDB_API_URL}/cards?page[size]=10000`),
		fetch(`${NRDB_API_URL}/card_cycles?page[size]=100`),
		fetch(`${NRDB_API_URL}/card_sets?page[size]=100`),
		fetch(`${NRDB_API_URL}/factions?page[size]=100`),
		fetch(`${NRDB_API_URL}/formats?page[size]=20`),
		fetch(`${NRDB_API_URL}/printings?page[size]=10000`)
	]);

	const cards_data: ApiResponse<Card> = await cards_response.json();
	const cycles_data: ApiResponse<Cycle> = await cycles_response.json();
	const sets_data: ApiResponse<Set> = await sets_response.json();
	const factions_data: ApiResponse<Faction> = await factions_response.json();
	const formats_data: ApiResponse<Format> = await formats_response.json();
	const printings_data: ApiResponse<Printing> = await printings_response.json();

	cards.set(cards_data.data);
	cycles.set(cycles_data.data);
	sets.set(sets_data.data);
	factions.set(factions_data.data);
	formats.set(formats_data.data);
	printings.set(printings_data.data);

	// Clear and store all cards in IndexedDB
	await db.cards.clear();
	await db.cards.bulkAdd(cards_data.data);

	await db.cycles.clear();
	await db.cycles.bulkAdd(cycles_data.data);

	await db.sets.clear();
	await db.sets.bulkAdd(sets_data.data);

	await db.factions.clear();
	await db.factions.bulkAdd(factions_data.data);

	await db.formats.clear();
	await db.formats.bulkAdd(formats_data.data);

	await db.printings.clear();
	await db.printings.bulkAdd(printings_data.data);
};

export const reset_indexeddb_data = async () => {
	await db.cards.clear();
	await db.cycles.clear();
	await db.sets.clear();
	await db.factions.clear();
	await db.formats.clear();
	await db.printings.clear();

	console.info('IndexedDB cleared');

	// Refetch core data from API
	initialize_app_data();
};

export const getHighResImage = (card: Card, size: 'small' | 'medium' | 'large' = 'large') => {
	// if the card includes one of the card cycles that are released by null signal games, use the nsg image
	const nsgCardCycles = ['elevation', 'liberation', 'borealis', 'ashes', 'system_gateway'];

	// If the card is from a NSG cycle, or doesn't have a NRDB classic image, use the NRDB image
	if (nsgCardCycles.some((cycle) => card.attributes.card_cycle_ids.includes(cycle))) {
		return `https://card-images.netrunnerdb.com/v2/xlarge/${card.attributes.latest_printing_id}.webp`;
	}

	if (!card.attributes.latest_printing_images?.nrdb_classic) {
		return `https://card-images.netrunnerdb.com/v2/large/${card.attributes.latest_printing_id}.jpg`;
	}

	return card.attributes.latest_printing_images.nrdb_classic[size];
};

type CardGroup = {
	type: CardTypeIds;
	data: Card[];
};

export const group_cards_by_type = (cards: Card[]): CardGroup[] => {
	const groups: CardGroup[] = cards.reduce((accumulator: CardGroup[], card: Card) => {
		if (!card?.attributes?.card_type_id) {
			return accumulator;
		}

		const type_id = card.attributes.card_type_id;

		const existing = accumulator.find((item) => item.type === type_id);

		if (!existing) {
			accumulator.push({ type: type_id, data: [card] });
		} else {
			existing.data.push(card);
		}

		return accumulator;
	}, []);

	return groups;
};

export const card_quantity = (decklist: Decklist, cards: CardGroup[]) => {
	return cards.reduce((accumulator: Record<string, number>, group: CardGroup) => {
		accumulator[group.type] = group.data
			.map((card: Card & { quantity?: number }) => {
				card.quantity = decklist.attributes.card_slots[card.id] || 0;
				return card;
			})
			.reduce((sum: number, card: Card & { quantity?: number }) => sum + (card.quantity || 0), 0);
		return accumulator;
	}, {});
};

export const format_date = (iso: string, options?: Intl.DateTimeFormatOptions) => {
	const date: Date = new Date(iso);

	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		// hour: 'numeric',
		// minute: 'numeric',
		// second: 'numeric'
		...options
	});
};
