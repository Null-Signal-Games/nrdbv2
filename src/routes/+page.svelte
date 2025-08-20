<script lang="ts">
	import { filterAndRankCards } from '$lib/search';
	import type { Card } from '$lib/types';
	import { getContext } from 'svelte';

	const store = getContext<{ allCards: Card[] }>('store');

	let search = $state('');

	const filteredCards = $derived(filterAndRankCards(store.allCards, search));
</script>

<div>
	<input type="text" bind:value={search} />
</div>

<ul>
	{#each filteredCards as card}
		<li>
			<a href={`/cards/${card.id}`}>{card.attributes.title}</a>
		</li>
	{/each}
</ul>
