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

	const groups = $derived(group_cards_by_type(cards));
	const count = $derived(card_quantity(decklist, groups));
	const identity = $derived(cards.find((card) => card.id === decklist.attributes.identity_card_id));
</script>

<div class="decklist-breakdown">
	{#each groups as group (group.type)}
	{#if group.type !== 'corp_identity' && group.type !== 'runner_identity'}
		<div>
			<header>
				<Icon name={group.type} />
				<h4>{card_types[group.type]} ({count[group.type]})</h4>
			</header>
			<article>
				<ul>
					{#each group.data as card (card.id)}
						<li>
							<a href={localizeHref(`/card/${card.id}`)} use:tooltip={card}>
								{decklist.attributes.card_slots[card.id]}&times; {card.attributes.title}
								{#if card.attributes.faction_id !== identity!.attributes.faction_id}
									<Influence 
										count={card.attributes.influence_cost} 
										theme={card.attributes.faction_id as FactionIds} 
									/>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			</article>
		</div>
	{/if}
	{/each}
</div>

<style>
	.decklist-breakdown {
		columns: 2;
		column-gap: 2rem;
	}

	.decklist-breakdown > div {
		break-inside: avoid;
		margin-bottom: 1.5rem;
	}

	.decklist-breakdown header {
		display: grid;
		gap: 0.5rem;
		grid-template-columns: auto 1fr;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.decklist-breakdown ul {
		list-style: none;
		padding: unset;
		margin: unset;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.decklist-breakdown li a {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		text-decoration: none;
	}

	.decklist-breakdown li a:hover {
		text-decoration: underline;
	}

	@media (max-width: 480px) {
		.decklist-breakdown {
			columns: 1;
		}
	}
</style>
