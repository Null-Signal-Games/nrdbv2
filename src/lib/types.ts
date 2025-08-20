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
