import type { Card, Decklist, FileFormat, CardGroup } from '$lib/types';

import { NRDB_IMAGE_URL, NRDB_SQLITE_NAME } from '$lib/constants';

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

const parse_sqlite_value = (value: unknown) => {
	if (typeof value !== 'string') {
		return value;
	}

	const trimmed = value.trim();

	if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) {
		return value;
	}

	try {
		return JSON.parse(trimmed) as unknown;
	} catch {
		return value;
	}
};

export const normalize_sqlite_single = <T extends Record<string, unknown>>(
	row: T
): {
	id: string;
	type?: string;
	attributes: Omit<T, 'id' | 'type'>;
} => {
	const normalized_row = Object.fromEntries(
		Object.entries(row).map(([key, value]) => [key, parse_sqlite_value(value)])
	) as T & { id?: string; type?: string };

	const { id, type, ...attributes } = normalized_row;

	return {
		id: id as string,
		...(typeof type === 'string' ? { type } : {}),
		attributes: attributes as Omit<T, 'id' | 'type'>
	};
};

export const normalize_sqlite = <T extends Record<string, unknown>>(rows: T[]) => {
	return rows.map((row) => normalize_sqlite_single(row));
};

type ImageCard = {
	id: string;
	type?: string;
	card_id?: string;
	attributes?: {
		printing_ids?: string[];
		latest_printing_id?: string;
		latest_printing_images?: {
			nrdb_classic: {
				tiny: string;
				small: string;
				medium: string;
				large: string;
			};
		};
		card_cycle_ids?: string[];
		title?: string;
	};
	printing_ids?: string[];
	latest_printing_id?: string;
	latest_printing_images?: {
		nrdb_classic: {
			tiny: string;
			small: string;
			medium: string;
			large: string;
		};
	};
	card_cycle_ids?: string[];
};

export const getHighResImage = (
	card: ImageCard,
	size: 'small' | 'medium' | 'large' = 'large'
): string => {
	const attributes = ('attributes' in card && card.attributes ? card.attributes : card) as {
		printing_ids?: string[];
		latest_printing_id?: string;
		latest_printing_images?: ImageCard['latest_printing_images'];
		card_cycle_ids?: string[];
	};

	if ('type' in card && card.type === 'printings') {
		return `${NRDB_IMAGE_URL}/${size}/${card.id}.jpg`;
	}

	return `${NRDB_IMAGE_URL}/xlarge/${attributes.printing_ids?.[0] ?? card.id}.webp`;
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
const format_to_markdown = (data: Decklist, allCards: Card[]) => {
	// Only handle Decklist type
	if (!data || !data.attributes || !data.attributes.card_slots) {
		return 'Invalid decklist data';
	}
	const decklist = data;
	// Helper: Get card by id
	function getCardById(id: string) {
		return allCards.find((card) => card.id === id);
	}
	// Helper: Get set name by card
	function getSetName(card?: Card) {
		if (!card || !card.attributes.card_set_names || !card.attributes.card_set_names.length)
			return '';
		return card.attributes.card_set_names[card.attributes.card_set_names.length - 1];
	}
	// Helper: Get card type display name
	function getCardTypeDisplay(type: string) {
		return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}
	// Helper: Get influence dots
	function getInfluenceDots(card?: Card, quantity: number = 0) {
		if (!card || !card.attributes.influence_cost) return '';
		return '●'.repeat(card.attributes.influence_cost * quantity);
	}
	// Helper: Get card link
	function getCardLink(card: Card) {
		return `https://netrunnerdb.com/en/card/${card.id}`;
	}
	// Helper: Get identity card
	function getIdentity(decklist: Decklist) {
		return getCardById(decklist.attributes.identity_card_id);
	}
	// Helper: Group cards by type
	function groupDeckCardsByType(decklist: Decklist) {
		const slots = decklist.attributes.card_slots;
		const cardsInDeck = Object.keys(slots)
			.map((id) => getCardById(id))
			.filter(Boolean);
		const groups: Partial<Record<string, Card[]>> = {};
		for (const card of cardsInDeck) {
			if (!card) continue;
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
			.sort((a: Card, b: Card) => a.attributes.title.localeCompare(b.attributes.title));
		// Get total count for this type
		const total = cardsSorted.reduce(
			(sum: number, card: Card) => sum + (decklist.attributes.card_slots[card.id] || 0),
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

export const export_format = (
	data: object | object[],
	format: FileFormat,
	cards: Card[] = []
): unknown => {
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
			return format_to_markdown(data as Decklist, cards);
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
