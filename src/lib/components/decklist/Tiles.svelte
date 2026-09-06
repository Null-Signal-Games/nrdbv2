<script lang="ts">
	import type { Card, Decklist } from '$lib/types';
	import { getCardsByIds } from '$lib/cards';
	import { db_ready } from '$lib/store';
	import Tile from './Tile.svelte';

	interface TileData {
		decklist: Decklist;
		cards?: Card[];
	}

	let {
		tiles
	}: {
		tiles: TileData[];
	} = $props();

	let queried_cards = $state<Card[]>([]);

	// Collect unique card IDs among all decklists
	const card_ids = $derived.by(() => {
		const ids = new Set<string>();

		for (const tile of tiles) {
			// Only add card IDs if the cards are not already loaded
			if (tile.cards !== undefined) continue;

			for (const id of Object.keys(tile.decklist.attributes.card_slots)) {
				ids.add(id);
			}
		}

		return [...ids];
	});

	$effect(() => {
		if (!$db_ready || card_ids.length === 0) return;

		let cancelled = false;

		void (async () => {
			try {
				const cards = await getCardsByIds(card_ids);
				if (!cancelled) queried_cards = cards;
			} catch (error) {
				console.error('[DECKLIST] Failed to load cards for decklist tiles:', error);
			}
		})();

		return () => {
			// If the component is unmounted, cancelled becomes `true` so
			// queried_cards is not updated.
			cancelled = true;
		};
	});

	const cards_for = (tile: TileData): Card[] =>
		tile.cards ??
		queried_cards.filter((card) => Object.hasOwn(tile.decklist.attributes.card_slots, card.id));
</script>

<ul class="tiles">
	{#each tiles as tile (tile.decklist.id)}
		<li>
			<Tile decklist={tile.decklist} cards={cards_for(tile)} />
		</li>
	{/each}
</ul>

<style>
	.tiles {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
</style>
