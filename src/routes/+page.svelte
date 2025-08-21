<script lang="ts">
	import { filterAndRankCards } from '$lib/search';
	import type { Card } from '$lib/types';
	import { getHighResImage } from '$lib/utils.js';
	import { getContext } from 'svelte';

	const store = getContext<{ allCards: Card[] }>('store');
	const { data } = $props();

	if (store.allCards.length === 0) {
		store.allCards = data.cards;
	}

	let search = $state('');

	const filteredCards = $derived(filterAndRankCards(store.allCards, search));
</script>

<div>
	<input type="text" bind:value={search} />
</div>

<div class="card-grid">
	{#each filteredCards as card (card.id)}
		<a href={`/cards/${card.id}`} class="card-grid-item">
			<img class="card" src={getHighResImage(card)} alt={card.attributes.title} loading="lazy" />
		</a>
	{/each}
</div>

<style>
	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
	}

	.card-grid-item {
		min-height: 400px;
		display: block;
	}
</style>
