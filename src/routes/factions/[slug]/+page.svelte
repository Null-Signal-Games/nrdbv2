<script lang="ts">
	import { page } from '$app/state';
	import CardElement from '$lib/components/Card.svelte';
	import Header from '$lib/components/Header.svelte';
	import type { Faction, Card } from '$lib/types';
	import { factions, cards } from '$lib/store';

	let faction_data = $derived<Faction | undefined>(
		$factions.find((faction: Faction) => faction.id === page.params.slug)
	);
	let cards_data = $derived<Card[]>(
		$cards.filter((card: Card) =>
			page.params.slug ? card.attributes.faction_id === page.params.slug : false
		)
	);
</script>

{#if faction_data && cards_data}
	<Header title={`Faction: ${faction_data.attributes.name}`} />

	<ul>
		{#each cards_data as card (card.id)}
			<li>
				<CardElement data={card} />
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
