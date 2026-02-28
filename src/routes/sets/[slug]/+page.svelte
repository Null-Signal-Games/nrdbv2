<script lang="ts">
	import { page } from '$app/state';
	import Header from '$lib/components/Header.svelte';
	import type { Set, Card } from '$lib/types';
	import { sets, cards } from '$lib/store';
	import Table from '$lib/components/Table.svelte';
	import { find_or_server, filter_or_server } from '$lib/utils';

	interface Props {
		data: { set: Set | null; cards: Card[] | null };
	}

	let { data }: Props = $props();

	let set_data = $derived<Set | undefined>(
		find_or_server($sets, (s) => s.id === page.params.slug, data.set, `set:${page.params.slug}`)
	);
	let cards_data = $derived<Card[]>(
		filter_or_server(
			$cards,
			(card) => card.attributes.card_set_ids.includes(page.params.slug),
			data.cards,
			`set-cards:${page.params.slug}`
		)
	);
</script>

{#if set_data && cards_data}
	<Header title={`Set: ${set_data.attributes.name}`} />

	<Table cards={cards_data} />
{/if}
