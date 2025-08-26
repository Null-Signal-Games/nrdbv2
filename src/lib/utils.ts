import type { Card } from './types';

export const NRDB_API_URL = 'https://api.netrunnerdb.com/api/v3/public';

export const LOCAL_STORAGE_ALL_CARDS_KEY = 'allCards';

export const getHighResImage = (card: Card, size: 'small' | 'medium' | 'large' = 'large') => {
	// if the card includes one of the card cycles that are released by null signal games, use the nsg image
	const nsgCardCycles = ['elevation', 'liberation', 'borealis', 'ashes', 'system_gateway'];

	if (nsgCardCycles.some((cycle) => card.attributes.card_cycle_ids.includes(cycle))) {
		return `https://card-images.netrunnerdb.com/v2/xlarge/${card.attributes.latest_printing_id}.webp`;
	}

	return card.attributes.latest_printing_images.nrdb_classic[size];
};
