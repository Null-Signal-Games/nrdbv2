<script lang="ts">
	import { filterAndRankCards } from '$lib/search';
	import CardImage from '$lib/components/CardImage.svelte';
	import DecklistSuggestions from '$lib/components/DecklistSuggestions.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { setupStore, store } from '$lib/store/index.svelte';

	const { data } = $props();

	if (store.allCards.length === 0) {
		setupStore(data.cards);
	}

	const getSearch = () => page.url.searchParams.get('q') || '';

	const filteredCards = $derived(filterAndRankCards(store.allCards, getSearch()).slice(0, 5));
</script>

<div class="search-container">
	<span class="search-input-container">
		<input
			type="text"
			value={getSearch()}
			oninput={async (e) => {
				const input = e.target as HTMLInputElement;

				const url = new URL(location.href);
				url.searchParams.set('q', input.value);
				await goto(url.href, { replaceState: true, keepFocus: true });
			}}
		/></span
	>
	{#if getSearch().length > 0}
		<div class="card-dropdown">
			<div class="card-grid">
				{#each filteredCards as card (card.id)}
					<div class="card-grid-item">
						<a href={`/cards/${card.id}?${page.url.searchParams.toString()}`}>
							<CardImage {card} loading="lazy" boxShadow={false} />
						</a>
					</div>
				{/each}
			</div>
			<DecklistSuggestions firstCard={filteredCards[0]} />
		</div>
	{/if}
</div>

<style>
	.search-input-container {
		display: flex;
		flex-direction: row;
		gap: 1rem;
	}

	input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ccc;
		font-size: 1rem;
		line-height: 1.5;
	}

	.search-container {
		width: 100%;
		max-width: 800px;
		margin: 0 auto;
	}

	.card-dropdown {
		position: relative;
	}

	.card-grid {
		padding: 0.5rem;
		display: flex;
		gap: 1rem;
		overflow-x: scroll;
	}

	.card-grid-item {
		max-width: 200px;
		display: block;
		flex: 0 0 auto;
	}
</style>
