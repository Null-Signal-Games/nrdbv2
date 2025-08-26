export interface Card {
	id: string;
	attributes: {
		title: string;
		card_cycle_ids: string[];
		latest_printing_id: string;
		latest_printing_images: {
			nrdb_classic: {
				tiny: string;
				small: string;
				medium: string;
				large: string;
			};
		};
	};
}

export interface Decklist {
	id: string;
	attributes: {
		user_id: string;
		follows_basic_deckbuilding_rules: boolean;
		identity_card_id: string;
		name: string;
		notes: string;
		tags: string[] | null;
		side_id: 'corp' | 'runner';
		created_at: string;
		updated_at: string;
		faction_id: string;
		card_slots: Record<string, number>;
		num_cards: number;
		influence_spent: number;
	};
}
