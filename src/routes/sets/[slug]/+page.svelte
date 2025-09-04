<script lang="ts">
	import { page } from '$app/state';
	import CardImage from '$lib/components/CardImage.svelte';
	import Header from '$lib/components/Header.svelte';
	import type { Set, Card } from '$lib/types';
	import { sets, cards } from '$lib/store';

	let set_data = $derived<Set | undefined>($sets.find((set: Set) => set.id === page.params.slug));
	let cards_data = $derived<Card[]>(
		$cards.filter((card: Card) =>
			page.params.slug ? card.attributes.card_set_ids.includes(page.params.slug) : false
		)
	);
</script>

{#if set_data && cards_data}
	<Header title={`Set: ${set_data.attributes.name}`} />

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
