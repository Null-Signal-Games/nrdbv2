<script lang="ts">
	import type { PageData } from './$types';
	import Container from '$lib/components/Container.svelte';
	import Meta from '$lib/components/Meta.svelte';
	import Printer from '$lib/components/Printer.svelte';
	import DeckHeader from '$lib/components/decklist/DeckHeader.svelte';
	import DeckDetails from '$lib/components/decklist/DeckDetails.svelte';
	import DeckExportMenu from '$lib/components/decklist/DeckExportMenu.svelte';
	import { format_date } from '$lib/utils';

	let { data }: { data: PageData } = $props();

	const attributes = $derived(data.deck.attributes);
	const identity = $derived(data.cards.find((card) => card.id === attributes.identity_card_id));
</script>

<Meta title={attributes.name} />

<Container class="deck">
	{#if identity}
		<DeckHeader {identity} name={attributes.name} compact>
			<p class="deck__byline">
				Updated <time datetime={attributes.updated_at}
					>{format_date(attributes.updated_at)}</time
				>
			</p>

			{#snippet actions()}
				<DeckExportMenu decklist={data.deck} cards={data.cards} />
			{/snippet}
		</DeckHeader>

		<DeckDetails {identity} decklist={data.deck} cards={data.cards} sets={data.sets} />
	{:else}
		<h1>{attributes.name}</h1>
		<p>The identity for this deck could not be found.</p>
	{/if}

	{#if attributes.notes?.trim()}
		<section class="deck__notes" aria-label="Notes">
			<h2>Notes</h2>
			<p>{attributes.notes}</p>
		</section>
	{/if}
</Container>

<Printer decklist={data.deck} cards={data.cards} />

<style>
	:global(.deck) {
		display: grid;
		gap: 1.5rem;
		padding-block: 2rem 3rem;
	}

	.deck__byline {
		margin: 0;
		color: var(--text-muted);
		font-size: var(--font-size-sm);
	}

	.deck__notes p {
		margin: 0;
		white-space: pre-line;
	}
</style>
