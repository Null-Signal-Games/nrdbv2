<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { card_types } from '$lib/i18n';
	import type { Card, CardGroup } from '$lib/types';
	import { openCardModal } from '$lib/store';
	import GridStack from './GridStack.svelte';
	import { buildDeckGridModel, type CardSlots } from './grid';

	interface Props {
		readonly groups: readonly CardGroup[];
		readonly cardSlots: CardSlots;
	}

	let { groups, cardSlots }: Props = $props();

	const model = $derived(buildDeckGridModel({ groups, cardSlots }));

	const accessibleName = (card: Card, copies: number): string =>
		`${card.attributes.title}, ${copies} ${copies === 1 ? 'copy' : 'copies'}`;
</script>

<div class="deck-grid">
	{#each model as group (group.type)}
		<section class="deck-grid__group">
			<header class="deck-grid__header">
				<Icon name={group.type} size="sm" />
				<h4>{card_types[group.type]} ({group.totalCopies})</h4>
			</header>

			<ul class="deck-grid__track">
				{#each group.items as item (item.card.id)}
					<li class="deck-grid__cell">
						<button
							type="button"
							class="deck-grid__card"
							aria-haspopup="dialog"
							aria-label={accessibleName(item.card, item.copies)}
							onclick={() => openCardModal(item.card)}
						>
							<GridStack card={item.card} copies={item.copies} />
						</button>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>

<style>
	.deck-grid {
		--grid-card-width: 120px;

		display: grid;
		gap: 1.1rem;
	}

	.deck-grid__group {
		display: grid;
		gap: 1rem;
	}

	.deck-grid__header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.deck-grid__header h4 {
		margin: 0;
	}

	.deck-grid__track {
		display: grid;
		grid-template-columns: repeat(auto-fill, var(--grid-card-width));
		row-gap: 1.6rem;
		column-gap: 1.1rem;
		justify-content: start;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.deck-grid__cell,
	.deck-grid__card {
		inline-size: var(--grid-card-width);
	}

	.deck-grid__card {
		display: block;
		padding: 0;
		border: 0;
		border-radius: var(--card-radius);
		background: transparent;
		color: inherit;
		cursor: pointer;
	}

	.deck-grid__card:focus-visible {
		outline: 3px solid currentColor;
		outline-offset: 4px;
	}
</style>
