<script lang="ts">
	import { filterAndRankCards } from '$lib/search';
	import type { Card } from '$lib/types';
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

<ul>
	{#each filteredCards as card (card.id)}
		<li>
			<a href={`/cards/${card.id}`}>{card.attributes.title}</a>
		</li>
	{/each}
</ul>
