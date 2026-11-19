import type { Printing } from '$lib/types';

export const get_illustrator_credits = (printing: Printing) => {
	const { display_illustrators, illustrator_ids, illustrator_names } = printing.attributes;
	if (illustrator_names.length) {
		return illustrator_names.map((name, index) => ({
			name,
			id: illustrator_ids[index]
		}));
	}
	if (!display_illustrators) return [];

	return [
		{
			name: display_illustrators,
			id: illustrator_ids.length === 1 ? illustrator_ids[0] : undefined
		}
	];
};
