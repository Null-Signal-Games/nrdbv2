<script lang="ts">
	import type { Decklist, Card as TCard } from '$lib/types';
	import Header from '$lib/components/Header.svelte';
	import { group_cards_by_type, card_quantity, format_date } from '$lib/utils';
	import { tooltip } from '$lib/actions';
	import CardImage from '$lib/components/CardImage.svelte';
	import Table from '$lib/components/Table.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { card_types } from '$lib/i18n';
	import DeckListSummary from '$lib/components/decklist/Summary.svelte';
	import DecklistBreakdown from '$lib/components/decklist/Breakdown.svelte';

	interface Props {
		data: {
			identity: TCard;
			decklist: Decklist;
			cards: TCard[];
		};
	}

	let { data }: Props = $props();

	const grouped_cards = group_cards_by_type(data.cards);
	const count = card_quantity(data.decklist, grouped_cards);
	// const total_cards = Object.values(count).reduce((sum, n) => sum + n, 0);
</script>

{#if data.decklist}
	<Icon name={data.decklist.attributes.faction_id} />
	<Header
		title={`Decklist: ${data.decklist.attributes.name}`}
		subtitle={`by ${data.decklist.attributes.user_id}`}
	/>
	<p>Created at: {format_date(data.decklist.attributes.created_at)}</p>
	<p>Updated at: {format_date(data.decklist.attributes.updated_at)}</p>

	<div class="wrapper">
		<div class="temp">
			<p>Default layout (classic)</p>
			<!-- TODO: Abstract to component for reuse on homepage -->
			<div class="decklist">
				<DeckListSummary identity={data.identity} decklist={data.decklist} />
				<DecklistBreakdown decklist={data.decklist} cards={data.cards} />
			</div>
		</div>

		<div class="temp">
			<p>Visual card layout</p>
			{#each grouped_cards as group (group.type)}
				<div class="group">
					<div>
						<Icon name={group.type} />
						<h2>{card_types[group.type]} ({count[group.type]})</h2>
					</div>
					<ul class="cards">
						{#each group.data as card (card.id)}
							<li use:tooltip={card}>
								<CardImage hasTransition {card} />
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>

		<div class="temp">
			<p>Table layout</p>
			<Table decklist={data.decklist} cards={data.cards} />
		</div>
	</div>

	<pre>{JSON.stringify(data, null, 2)}</pre>
{/if}

<style>
	/* Temporary styles */
	.group {
		display: grid;
		gap: 1rem;
	}

	ul {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.cards {
		grid-template-columns: repeat(4, 1fr);
	}

	.wrapper {
		display: grid;
		gap: 1rem;
	}

	.temp {
		border: 1px solid red;
		padding: 1rem;
	}
</style>
