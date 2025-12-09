<script lang="ts">
	import type { FactionIds, Card, Decklist } from '$lib/types';
	import { factions } from '$lib/i18n';
	import DecklistSummary from '$lib/components/decklist/Summary.svelte';
	import DecklistBreakdown from '$lib/components/decklist/Breakdown.svelte';
	import Icon from '$lib/components/Icon.svelte';

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

	const display_factions: FactionIds[] = [
		'anarch',
		'criminal',
		'haas_bioroid',
		'jinteki',
		'nbn',
		'shaper',
		'weyland_consortium'
	];
</script>

<div class="factions">
	{#each display_factions as faction (faction)}
		<a href={'/faction/' + faction}>
			<Icon name={faction} />
			{factions[faction]}
		</a>
	{/each}
</div>

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
						<a href={`/decklist/${decklist.id}`}>
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
	.factions {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}

	.home {
		display: grid;
		grid-template-columns: 3fr 1fr;
		gap: 1rem;
	}
</style>
