<script lang="ts">
	import { cards, searchQuery } from '$lib/store';
	import { filterAndRankCards } from '$lib/search';
	import CardImage from '$lib/components/CardImage.svelte';
	import DecklistSuggestions from '$lib/components/DecklistSuggestions.svelte';
	import { afterNavigate } from '$app/navigation';

	let inputEl: HTMLInputElement | null = null;
	let isOpen = $state(false);
	let dropdownEl = $state<HTMLDivElement | null>(null);
	const filteredCards = $derived(filterAndRankCards($cards, $searchQuery).slice(0, 5));

	afterNavigate(() => {
		isOpen = false;
	});
</script>

<div class="search-input-root">
	<span class="search-input-container">
		<input
			bind:this={inputEl}
			type="text"
			placeholder="Search"
			bind:value={$searchQuery}
			onfocus={() => (isOpen = true)}
			onblur={(e) => {
				const next = (e as FocusEvent).relatedTarget as Node | null;
				const focusInside = dropdownEl && next ? dropdownEl.contains(next) : false;
				if (!focusInside) {
					isOpen = false;
				}
			}}
		/>
	</span>
	{#if isOpen && $searchQuery.length > 0}
		<div class="search-dropdown" bind:this={dropdownEl}>
			<h2>Cards</h2>
			<div class="card-grid">
				{#each filteredCards as card (card.id)}
					<div class="card-grid-item">
						<CardImage
							{card}
							loading="lazy"
							boxShadow={false}
							hasTransition={true}
							href={`/card/${card.id}`}
						/>
					</div>
				{/each}
			</div>
			<DecklistSuggestions firstCard={filteredCards[0]} />
		</div>
	{/if}
</div>

<style>
	.search-input-root {
		position: relative;
		width: 100%;
	}

	.search-input-container {
		display: flex;
		flex-direction: row;
		gap: 1rem;
	}

	.search-input-container input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ccc;
		font-size: 1rem;
		line-height: 1.5;
	}

	.search-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		z-index: 10;
		background-color: #fff;
		box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
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
