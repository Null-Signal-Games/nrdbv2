<script lang="ts">
	import { page } from '$app/state';
	import Header from '$lib/components/Header.svelte';
	import type { Cycle, Card } from '$lib/types';
	import { cycles, cards } from '$lib/store';
	import Table from '$lib/components/Table.svelte';
	import { find_or_server, filter_or_server } from '$lib/utils';

	interface Props {
		data: { cycle: Cycle | null; cards: Card[] | null };
	}

	let { data }: Props = $props();

	let cycle_data = $derived<Cycle | undefined>(
		find_or_server(
			$cycles,
			(c) => c.id === page.params.slug,
			data.cycle,
			`cycle:${page.params.slug}`
		)
	);
	let cards_data = $derived<Card[]>(
		filter_or_server(
			$cards,
			(card) => card.attributes.card_cycle_ids.includes(page.params.slug),
			data.cards,
			`cycle-cards:${page.params.slug}`
		)
	);
</script>

{#if cycle_data && cards_data}
	<Header title={`Cycle: ${cycle_data.attributes.name}`} />

	<Table cards={cards_data} />
{/if}
