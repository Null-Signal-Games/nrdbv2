<script lang="ts">
	import { page } from '$app/state';
	import Header from '$lib/components/Header.svelte';
	import type { Set, Card } from '$lib/types';
	import { sets, cards } from '$lib/store';
	import Table from '$lib/components/Table.svelte';

	let set_data = $derived<Set | undefined>($sets.find((set: Set) => set.id === page.params.slug));
	let cards_data = $derived<Card[]>(
		$cards.filter((card: Card) =>
			page.params.slug ? card.attributes.card_set_ids.includes(page.params.slug) : false
		)
	);
</script>

{#if set_data && cards_data}
	<Header title={`Set: ${set_data.attributes.name}`} />

	<Table data={cards_data} />
{/if}
