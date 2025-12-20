<script lang="ts">
	import type { Card, Decklist } from '$lib/types';
	import DecklistSummary from '$lib/components/decklist/Summary.svelte';
	import DecklistBreakdown from '$lib/components/decklist/Breakdown.svelte';
	import Factions from '$lib/components/Factions.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';

	interface Props {
		data: {
			decklist_of_the_week: {
				identity: Card;
				decklist: Decklist;
				cards: Card[];
			};
			decklists: Decklist[];
		};
	}

	let { data }: Props = $props();
</script>

<Factions />

<div class="home">
	<div>
		{#await data.decklist_of_the_week}
			<p>Loading deck of the week...</p>
		{:then deck_of_the_week_data}
			<h2>Deck of the Week</h2>
			<DecklistSummary
				identity={deck_of_the_week_data.identity}
				decklist={deck_of_the_week_data.decklist}
			/>
			<DecklistBreakdown
				decklist={deck_of_the_week_data.decklist}
				cards={deck_of_the_week_data.cards}
			/>
		{:catch error}
			<p>error loading deck of the day: {error.message}</p>
		{/await}
	</div>
	<div>
		Latest decks
		<ul>
			{#await data.decklists}
				Loading decklists...
			{:then decklists}
				{#each decklists as decklist (decklist.id)}
					<li>
						<a href={localizeHref(`/decklist/${decklist.id}`)}>
							{decklist.attributes.name}
						</a>
					</li>
				{/each}
			{:catch error}
				<p>error loading decklists: {error.message}</p>
			{/await}
		</ul>
	</div>
</div>

<style>
	/* Temporary styles */
	.home {
		display: grid;
		grid-template-columns: 3fr 1fr;
		gap: 1rem;
	}
</style>
