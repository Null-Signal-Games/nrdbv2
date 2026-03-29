import { cards, cycles, sets, factions, formats, printings } from '$lib/store';
import type {
	ApiResponse,
	Card,
	Cycle,
	Set,
	Faction,
	Format,
	Decklist,
	Printing,
	FileFormat,
	CardGroup
} from '$lib/types';
import { db } from '$lib/db';

import { NRDB_API_URL, NRDB_SQLITE_NAME } from '$lib/constants';

export const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Returns items from the live store if it is populated, otherwise falls back to
 * server-provided data. Use inside $derived() expressions.
 */
export function store_or_server<T>(
	store_value: T[],
	server_value: T[] | null | undefined,
	label?: string
): T[] {
	if (store_value.length > 0) {
		if (label) console.debug(`[cache] ${label}: using store`);
		return store_value;
	}
	if (label) console.debug(`[cache] ${label}: using server data`);
	return server_value ?? [];
}

/**
 * Filters items from the live store if it is populated, otherwise falls back to
 * server-provided data. The predicate is only applied when the store has data,
 * preventing a false empty-result from masking a legitimately warm store.
 * Use inside $derived() expressions.
 */
export function filter_or_server<T>(
	store_value: T[],
	predicate: (item: T) => boolean,
	server_value: T[] | null | undefined,
	label?: string
): T[] {
	if (store_value.length > 0) {
		if (label) console.debug(`[cache] ${label}: filtering from store`);
		return store_value.filter(predicate);
	}
	if (label) console.debug(`[cache] ${label}: using server data`);
	return server_value ?? [];
}

/**
 * Finds a single item from the live store if it is populated, otherwise returns
 * the server-provided fallback. Use inside $derived() expressions.
 */
export function find_or_server<T>(
	store_value: T[],
	predicate: (item: T) => boolean,
	server_value: T | null | undefined,
	label?: string
): T | undefined {
	const found = store_value.find(predicate);
	if (found !== undefined) {
		if (label) console.debug(`[cache] ${label}: found in store`);
		return found;
	}
	if (label) console.debug(`[cache] ${label}: using server data`);
	return server_value ?? undefined;
}

export const initialize_app_data = async () => {
	try {
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

		// Atomically clear and repopulate all IndexedDB tables so a partial failure never leaves the cache in a half-written state
		await db.transaction(
			'rw',
			[db.cards, db.cycles, db.sets, db.factions, db.formats, db.printings, db.meta],
			async () => {
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

				await db.meta.put({ key: 'last_updated', value: String(Date.now()) });
			}
		);
	} catch (err) {
		console.error('Failed to fetch or cache app data:', err);
		throw err;
	}
};

export const reset_indexeddb_data = async () => {
	await db.cards.clear();
	await db.cycles.clear();
	await db.sets.clear();
	await db.factions.clear();
	await db.formats.clear();
	await db.printings.clear();
	await db.meta.clear();

	// Clear cache cookie
	document.cookie = 'nrdb_cache=; max-age=0; path=/; SameSite=Lax';

	console.info('IndexedDB cleared');

	// Refetch core data from API
	await initialize_app_data();
};

export const reset_opfs_data = async () => {
	const root = await navigator.storage.getDirectory();
	root.removeEntry(NRDB_SQLITE_NAME)
		.then(() => {
			console.info('OPFS database file removed');
		})
		.catch((err) => {
			console.error('Failed to remove OPFS database file:', err);
		});

	window.location.reload();
};

export const getHighResImage = (card: Card, size: 'small' | 'medium' | 'large' = 'large') => {
	// if the card includes one of the card cycles that are released by null signal games, use the nsg image
	const nsgCardCycles = ['elevation', 'liberation', 'borealis', 'ashes', 'system_gateway'];

	// If the card is a printing, use the printing image URL structure (id is the printing ID, not the card ID)
	if (card && 'type' in card && card.type === 'printings') {
		return `https://card-images.netrunnerdb.com/v2/${size}/${card.id}.jpg`;
	}

	// If the card is from a NSG cycle, or doesn't have a NRDB classic image, use the NRDB image
	if (nsgCardCycles.some((cycle) => card.attributes.card_cycle_ids.includes(cycle))) {
		return `https://card-images.netrunnerdb.com/v2/xlarge/${card.attributes.latest_printing_id}.webp`;
	}

	if (!card.attributes.latest_printing_images?.nrdb_classic) {
		return `https://card-images.netrunnerdb.com/v2/large/${card.attributes.latest_printing_id}.jpg`;
	}

	return card.attributes.latest_printing_images.nrdb_classic[size];
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
			.reduce(
				(sum: number, card: Card & { quantity?: number }) => sum + (card.quantity || 0),
				0
			);
		return accumulator;
	}, {});
};

export const format_date = (iso: string, options?: Intl.DateTimeFormatOptions) => {
	const date: Date = new Date(iso);
	const locale = navigator.language || 'en-US';

	return date.toLocaleDateString(locale, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		// hour: 'numeric',
		// minute: 'numeric',
		// second: 'numeric'
		...options
	});
};

export const print = () => {
	window.print();
};

export const share = async (config: ShareData) => {
	try {
		await navigator.share({
			title: config.title,
			text: config.text,
			url: config.url
		});
	} catch (err) {
		console.error('Error sharing:', err);
	}
};

export const content_type: Record<FileFormat, string> = {
	json: 'application/json',
	txt: 'text/plain',
	otcgn: 'application/x-otcgn',
	bbcode: 'text/plain',
	md: 'text/markdown',
	'jinteki.net': 'text/plain'
};

export const validate_markdown = (data: string): boolean => {
	if (typeof data !== 'string') return false;

	const patterns = [
		/^\s{0,3}#{1,6} /m, // headings
		/```[\s\S]*?```/, // code blocks
		/^\s*([-*+] |\d+\. )/m, // lists
		/\*\*[^*]+\*\*/, // bold
		/\*[^*]+\*/, // italic
		/\[[^\]]+\]\([^)]+\)/, // links
		/^\s*> /m // blockquote
	];

	return patterns.some((re) => re.test(data));
};

// Decklist to Markdown formatter
const format_to_markdown = (data) => {
	// Only handle Decklist type
	if (!data || !data.attributes || !data.attributes.card_slots) {
		return 'Invalid decklist data';
	}
	// Get cards and sets from Svelte stores
	const allCards = cards.get ? cards.get() : [];
	// const allSets = sets.get ? sets.get() : [];
	const decklist = data;
	// Helper: Get card by id
	function getCardById(id) {
		return allCards.find((card) => card.id === id);
	}
	// Helper: Get set name by card
	function getSetName(card) {
		if (!card || !card.attributes.card_set_names || !card.attributes.card_set_names.length)
			return '';
		return card.attributes.card_set_names[card.attributes.card_set_names.length - 1];
	}
	// Helper: Get card type display name
	function getCardTypeDisplay(type) {
		return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}
	// Helper: Get influence dots
	function getInfluenceDots(card, quantity) {
		if (!card || !card.attributes.influence_cost) return '';
		return '●'.repeat(card.attributes.influence_cost * quantity);
	}
	// Helper: Get card link
	function getCardLink(card) {
		return `https://netrunnerdb.com/en/card/${card.id}`;
	}
	// Helper: Get identity card
	function getIdentity(decklist) {
		return getCardById(decklist.attributes.identity_card_id);
	}
	// Helper: Group cards by type
	function groupDeckCardsByType(decklist) {
		const slots = decklist.attributes.card_slots;
		const cardsInDeck = Object.keys(slots)
			.map((id) => getCardById(id))
			.filter(Boolean);
		const groups = {};
		for (const card of cardsInDeck) {
			const type = card.attributes.card_type_id;
			if (!groups[type]) groups[type] = [];
			groups[type].push(card);
		}
		return groups;
	}
	const identity = getIdentity(decklist);
	const deckName = decklist.attributes.name;
	const deckTitle = `## ${deckName}`;
	const deckSubtitle = identity
		? `[${identity.attributes.title}](${getCardLink(identity)}) _(Core Set)_`
		: '';
	// Group cards by type
	const groups = groupDeckCardsByType(decklist);
	// Order of types for display
	const typeOrder = [
		'event',
		'hardware',
		'resource',
		'program',
		'agenda',
		'asset',
		'ice',
		'operation',
		'upgrade'
	];
	// Build markdown for each group
	const groupSections = [];
	for (const type of typeOrder) {
		if (!groups[type] || !groups[type].length) continue;
		// Sort cards alphabetically
		const cardsSorted = groups[type]
			.slice()
			.sort((a, b) => a.attributes.title.localeCompare(b.attributes.title));
		// Get total count for this type
		const total = cardsSorted.reduce(
			(sum, card) => sum + (decklist.attributes.card_slots[card.id] || 0),
			0
		);
		let section = `### ${getCardTypeDisplay(type)} (${total})`;
		for (const card of cardsSorted) {
			const qty = decklist.attributes.card_slots[card.id] || 0;
			const setName = getSetName(card);
			const dots = getInfluenceDots(card, qty);
			section += `\n* ${qty}x [${card.attributes.title}](${getCardLink(card)}) _(${setName})_ ${dots}`;
		}
		groupSections.push(section);
	}
	// Influence, card count, etc.
	const influence = decklist.attributes.influence_spent;
	const minCards =
		identity && identity.attributes.minimum_deck_size
			? identity.attributes.minimum_deck_size
			: 0;
	const numCards = decklist.attributes.num_cards;
	const influenceLine = `${influence} influence spent (max ${influence}, available 0)`;
	const cardCountLine = `${numCards} cards (min ${minCards})`;
	// TODO: Cards up to set/cycle (not enough info here)
	const upToLine = `Cards up to ???`;
	// Decklist link (if available)
	const decklistLink = decklist.id
		? `Decklist [published on NetrunnerDB](https://netrunnerdb.com/en/decklist/${decklist.id}/${encodeURIComponent(deckName.replace(/\s+/g, '-').toLowerCase())}).`
		: '';
	return [
		deckTitle,
		'',
		deckSubtitle,
		'',
		...groupSections,
		'',
		influenceLine + '  ',
		cardCountLine + '  ',
		upToLine + '  ',
		'',
		decklistLink
	]
		.filter(Boolean)
		.join('\n');
};

export const export_format = (data: object | object[], format: FileFormat): unknown => {
	switch (format) {
		case 'json':
			return data;

		// TODO: Implement logic for other formats
		case 'txt':
			return data;
		case 'otcgn':
			return data;
		case 'bbcode':
			return data;
		case 'md':
			return format_to_markdown(data);
		case 'jinteki.net':
			return data;
	}
};

/**
 *
 * @param data string - you will need to format the data before passing it in using JSON.stringify() or similar
 * @param name string - name of the file without extension
 * @param extension - file extension, must be one of the FileFormat types
 */
export const download_file = (data: string, name: string, extension: FileFormat) => {
	const blob = new Blob([data], { type: content_type[extension] });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');

	// Assign the URL to the anchor element and trigger a click to start the download
	a.href = url;
	a.download = `${name}.${extension}`;
	a.click();

	// Clean-up the URL object and remove the anchor element
	URL.revokeObjectURL(url);
	a.remove();
};
