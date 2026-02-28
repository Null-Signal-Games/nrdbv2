<script lang="ts">
	import type { Card, Decklist, FactionIds } from '$lib/types';
	import { group_cards_by_type, card_quantity } from '$lib/utils';
	import { card_types } from '$lib/i18n';
	import { tooltip } from '$lib/actions';
	import Icon from '$lib/components/Icon.svelte';
	import Influence from '$lib/components/Influence.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';

	interface Props {
		decklist: Decklist;
		cards: Card[];
	}

	let { decklist, cards }: Props = $props();

	const groups = group_cards_by_type(cards);
	const count = card_quantity(decklist, groups);
</script>

<div class="decklist-breakdown">
	{#each groups as group (group.type)}
		<div>
			<header>
				<Icon name={group.type} />
				<h2>{card_types[group.type]} ({count[group.type]})</h2>
			</header>
			<article>
				<ul>
					{#each group.data as card (card.id)}
						<li>
							<a href={localizeHref(`/card/${card.id}`)} use:tooltip={card}>
								{decklist.attributes.card_slots[card.id]}&times; {card.attributes.title}
								<Influence 
									count={card.attributes.influence_cost} 
									theme={card.attributes.faction_id as FactionIds} 
								/>
							</a>
						</li>
					{/each}
				</ul>
			</article>
		</div>
	{/each}
</div>

<style>
	/* Temporary styles */
	.decklist-breakdown {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.decklist-breakdown header {
		display: grid;
		gap: 0.5rem;
		grid-template-columns: auto 1fr;
		align-items: center;
	}

	.decklist-breakdown ul {
		padding: unset;
		margin: unset;
	}
</style>
