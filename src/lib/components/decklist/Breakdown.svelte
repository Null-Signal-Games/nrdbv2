<script lang="ts">
	import type { Card, Decklist } from '$lib/types';
	import { group_cards_by_type, card_quantity } from '$lib/utils';
	import { card_types } from '$lib/i18n';
	import { tooltip } from '$lib/actions';
	import Icon from '$lib/components/Icon.svelte';
	import Influence from '$lib/components/Influence.svelte';

	interface Props {
		decklist: Decklist;
		cards: Card[];
	}

	let { decklist, cards }: Props = $props();

	const groups = group_cards_by_type(cards);
	const count = card_quantity(decklist, groups);
</script>

<ul class="wrapper">
	{#each groups as group (group.type)}
		<li>
			<div>
				<Icon name={group.type} />
				<h2>{card_types[group.type]} ({count[group.type]})</h2>
			</div>
			<ul>
				{#each group.data as card (card.id)}
					<li use:tooltip={card}>
						<a href={`/card/${card.id}`}>
							{decklist.attributes.card_slots[card.id]}x {card.attributes.title}
							<Influence count={card.attributes.influence_cost} />
						</a>
					</li>
				{/each}
			</ul>
		</li>
	{/each}
</ul>

<style>
	/* Temporary styles */
	.wrapper {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}
</style>
