import { writable } from 'svelte/store';
import type { Snippet } from 'svelte';
import type { Card, Printing } from './types';
import type { SearchMode } from './search';
import type { DeckFormat } from './deck_formats';

export const search_query = writable<string>('');

export const DEFAULT_SEARCH_MODE: SearchMode = 'interpreted';

export const search_mode = writable<SearchMode>(DEFAULT_SEARCH_MODE);

export const DEFAULT_SEARCH_FORMAT: DeckFormat = 'standard';

export const search_format = writable<DeckFormat>(DEFAULT_SEARCH_FORMAT);

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

// The card shown in the global card modal, or null when closed
export const cardModal = writable<{
	card: Card;
	actions?: Snippet<[Card]>;
	onKeyDown?: (event: KeyboardEvent) => void;
} | null>(null);

export function openCardModal(
	card: Card,
	options: {
		actions?: Snippet<[Card]>;
		onKeyDown?: (event: KeyboardEvent) => void;
	} = {}
) {
	cardModal.set({ card, ...options });
}

export function closeCardModal() {
	cardModal.set(null);
}
