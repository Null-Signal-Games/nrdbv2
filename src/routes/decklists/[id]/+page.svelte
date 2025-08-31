<script lang="ts">
	import type { Decklist, Card as TCard, Set } from '$lib/types';
	import Header from '$lib/components/Header.svelte';
	import { group_cards_by_type, card_quantity } from '$lib/utils';
	import { tooltip } from '$lib/actions';
	import Card from '$lib/components/Card.svelte';

	interface Props {
		data: {
			decklist: Decklist;
			identity: TCard;
			cards: TCard[];
			sets: Set[];
		};
	}

	let { data }: Props = $props();

	const grouped_cards = group_cards_by_type(data.cards);
	const count = card_quantity(data.decklist, grouped_cards);
</script>

{#if data.decklist}
	<Header title={`Decklist: ${data.decklist.attributes.name}`} />

	{#each grouped_cards as group (group.type)}
		<div class="group">
			<div>
				<h2 class="text-2xl">{group.type} ({count[group.type]})</h2>
			</div>
			<ul>
				{#each group.data as card (card.id)}
					<li use:tooltip={card}>
						<Card data={card} />
					</li>
				{/each}
			</ul>
		</div>
	{/each}
{/if}

<style>
	/* Temporary styles */
	.group {
		display: grid;
		gap: 1rem;
	}

	ul {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
	}
</style>
