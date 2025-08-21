<script lang="ts">
	import { filterAndRankCards } from '$lib/search';
	import type { Card } from '$lib/types';
	import { getContext } from 'svelte';
	import CardImage from '$lib/components/CardImage.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	const store = getContext<{ allCards: Card[] }>('store');
	const { data } = $props();

	if (store.allCards.length === 0) {
		store.allCards = data.cards;
	}

	const getSearch = () => page.url.searchParams.get('q') || '';

	const filteredCards = $derived(filterAndRankCards(store.allCards, getSearch()).slice(0, 5));
</script>

<div>
	<input
		type="text"
		value={getSearch()}
		oninput={async (e) => {
			const input = e.target as HTMLInputElement;

			const url = new URL(location.href);
			url.searchParams.set('q', input.value);
			await goto(url.href, { replaceState: true, keepFocus: true });
		}}
	/>
</div>
{#if getSearch().length > 0}
	<div class="card-grid">
		{#each filteredCards as card (card.id)}
			<a href={`/cards/${card.id}?${page.url.searchParams.toString()}`} class="card-grid-item">
				<CardImage {card} loading="lazy" />
			</a>
		{/each}
	</div>
{/if}

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
