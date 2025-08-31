<script lang="ts">
	import { filterAndRankCards } from '$lib/search';
	import { cards } from '$lib/store';
	import Card from '$lib/components/Card.svelte';

	let search = $state('');

	const filteredCards = $derived(filterAndRankCards($cards, search));
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
