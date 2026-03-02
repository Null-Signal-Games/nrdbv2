import { writable } from 'svelte/store';
import type { Card, Cycle, Set, Faction, Format, Printing } from './types';

export const cards = writable<Card[]>([]);
export const cycles = writable<Cycle[]>([]);
export const sets = writable<Set[]>([]);
export const factions = writable<Faction[]>([]);
export const formats = writable<Format[]>([]);
export const printings = writable<Printing[]>([]);

export const searchQuery = writable<string>('');

export const tooltip = writable<{
	element: HTMLElement | null;
	visible: boolean;
	card: Card | null;
	position: {
		x: number;
		y: number;
	};
}>({
	element: null,
	visible: false,
	card: null,
	position: {
		x: 0,
		y: 0
	}
});

// Track whether cursor is over tooltip or bridge (used by tooltip action)
export const tooltip_hover = writable<{
	is_over_tooltip: boolean;
	is_over_bridge: boolean;
}>({
	is_over_tooltip: false,
	is_over_bridge: false
});

export const theme = writable<'light' | 'dark' | null>(null);
