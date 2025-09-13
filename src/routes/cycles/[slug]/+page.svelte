<script lang="ts">
	import { page } from '$app/state';
	import Header from '$lib/components/Header.svelte';
	import type { Cycle, Card } from '$lib/types';
	import { cycles, cards } from '$lib/store';
	import Table from '$lib/components/Table.svelte';

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

	<Table data={cards_data} />
{/if}
