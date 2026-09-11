export const DECK_FORMATS = ['core', 'startup', 'standard', 'eternal', 'all'] as const;
export type DeckFormat = (typeof DECK_FORMATS)[number];

export type ActiveCardPoolIds = Partial<Record<DeckFormat, string>>;

export const isDeckFormat = (value: string): value is DeckFormat =>
	(DECK_FORMATS as readonly string[]).includes(value);
