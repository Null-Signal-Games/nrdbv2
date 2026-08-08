import type { Card } from './types';

export type DeckFormat = 'core' | 'startup' | 'standard' | 'eternal';

export const DECK_FORMATS: DeckFormat[] = ['core', 'startup', 'standard', 'eternal'];

const CORE_CYCLE_IDS = ['system_gateway', 'elevation'];

export type FormatCycles = Record<string, string[]>;

export const cardInFormatPool = (
	card: Card,
	format: DeckFormat,
	formatCycles: FormatCycles
): boolean => {
	const cycles = format === 'core' ? CORE_CYCLE_IDS : (formatCycles[format] ?? []);
	if (cycles.length === 0) return false;

	return card.attributes.card_cycle_ids.some((cycleId) => cycles.includes(cycleId));
};

export const isDeckFormat = (value: string): value is DeckFormat =>
	(DECK_FORMATS as string[]).includes(value);
