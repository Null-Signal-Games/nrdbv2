<script lang="ts">
	import { page } from '$app/state';
	import CardImage from '$lib/components/CardImage.svelte';
	import Header from '$lib/components/Header.svelte';
	import type { Cycle, Card } from '$lib/types';
	import { cycles, cards } from '$lib/store';

	let cycle_data = $derived<Cycle | undefined>(
		$cycles.find((cycle: Cycle) => cycle.id === page.params.slug)
	);
	let cards_data = $derived<Card[]>(
		$cards.filter((card: Card) =>
			page.params.slug ? card.attributes.card_cycle_ids.includes(page.params.slug) : false
		)
	);
</script>

{#if cycle_data && cards_data}
	<Header title={`Cycle: ${cycle_data.attributes.name}`} />

	<ul>
		{#each cards_data as card (card.id)}
			<li>
				<CardImage {card} />
			</li>
		{/each}
	</ul>
{/if}

<style>
	/* Temporary styles */
	ul {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
	}
</style>
