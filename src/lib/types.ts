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

export interface Cycle {
	id: string;
	type: 'card_cycles';
	attributes: {
		name: string;
		date_release: string;
		legacy_code: string;
		card_set_ids: string[];
		first_printing_id: string;
		position: number;
		released_by: string;
		updated_at: string;
	};
	relationships: {
		card_sets: {
			links: {
				related: string;
			};
		};
		printings: {
			links: {
				related: string;
			};
		};
		cards: {
			links: {
				related: string;
			};
		};
		card_pools: {
			links: {
				related: string;
			};
		};
	};
	links: {
		self: string;
	};
}
