<script lang="ts">
	import { filterAndRankCards } from '$lib/search';
	import type { Card as TCard } from '$lib/types';
	import { getContext } from 'svelte';
	import Card from '$lib/components/Card.svelte';

	const store = getContext<{ cards: TCard[] }>('store');
	const { data } = $props();

	if (store.cards.length === 0) {
		store.cards = data.cards;
	}

	let search = $state('');

	const filteredCards = $derived(filterAndRankCards(store.cards, search));
</script>

<div>
	<input type="text" bind:value={search} />
</div>

<ul>
	{#each filteredCards as card (card.id)}
		<li>
			<!-- <a href={`/cards/${card.id}`}>{card.attributes.title}</a> -->
			<Card data={card} />
		</li>
	{/each}
</ul>
