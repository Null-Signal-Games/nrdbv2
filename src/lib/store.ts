import { writable } from 'svelte/store';
import type { Card, Printing } from './types';

export const search_query = writable<string>('');

export const tooltip = writable<{
	element: HTMLElement | null;
	visible: boolean;
	card: Card | Printing | null;
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

// True once the SQLite DB has been confirmed present (or downloaded) in OPFS
export const db_ready = writable<boolean>(false);
