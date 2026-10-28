<script lang="ts">
	import type { Card } from '$lib/types';
	import { isIdentity, type CardSlots } from './card_slots';
	import { card_types, factions as i18n_factions } from '$lib/i18n';
	import Icon from '$lib/components/Icon.svelte';
	import Influence from '$lib/components/Influence.svelte';
	import Button from '../ui/Button.svelte';
	import IdentitySelect from './IdentitySelect.svelte';

	interface Props {
		readonly cards: readonly Card[];
		readonly deck: CardSlots;
		readonly identity: Card['id'];
		readonly on_open_card: (card: Card) => void;
		readonly on_set_quantity: (card: Card, quantity: number) => void;
		readonly on_select_identity: (card: Card) => void;
	}

	let {
		cards,
		deck,
		identity,
		on_open_card,
		on_set_quantity: set_quantity,
		on_select_identity
	}: Props = $props();

	const get_quantity = (card: Card): number => deck[card.id] ?? 0;

	const increment = (card: Card) => {
		set_quantity(card, get_quantity(card) + 1);
	};

	const decrement = (card: Card) => {
		set_quantity(card, get_quantity(card) - 1);
	};
</script>

<table>
	<thead>
		<tr>
			<th>Qty</th>
			<th>Name</th>
			<th>Type</th>
			<th>Influence</th>
			<th>Faction</th>
			<th>Cost</th>
		</tr>
	</thead>
	<tbody>
		{#each cards as result (result.id)}
			<tr>
				<td>
					{#if isIdentity(result)}
						<span class="builder__quantity">
							<IdentitySelect
								class="builder__identity"
								selected={result.id === identity}
								onselect={() => on_select_identity(result)}
							/>
						</span>
					{:else}
						<span class="builder__quantity">
							{#if get_quantity(result) > 0}
								<Button
									size="sm"
									color="secondary"
									onclick={() => decrement(result)}
								>
									-
								</Button>
							{/if}
							<span class="builder__count">{get_quantity(result)}</span>
							{#if get_quantity(result) < result.attributes.deck_limit}
								<Button
									size="sm"
									color="secondary"
									onclick={() => increment(result)}
								>
									+
								</Button>
							{/if}
						</span>
					{/if}
				</td>
				<td>
					<button
						type="button"
						class="builder__card-title"
						aria-haspopup="dialog"
						onclick={() => on_open_card(result)}
					>
						{result.attributes.title}
					</button>
				</td>
				<td>
					<span class="icon-text">
						<Icon name={result.attributes.card_type_id} size="inline" />
						<span class="truncate">{card_types[result.attributes.card_type_id]}</span>
					</span>
				</td>
				<td>
					{#if result.attributes.influence_cost !== null && result.attributes.influence_cost > 0}
						<Influence
							count={result.attributes.influence_cost}
							theme={result.attributes.faction_id}
						/>
					{/if}
				</td>
				<td>
					<span class="icon-text">
						<Icon name={result.attributes.faction_id} size="inline" />
						{i18n_factions[result.attributes.faction_id]}
					</span>
				</td>
				<td>
					<span class="icon-text">
						{#if result.attributes.cost !== null}
							<Icon name="credit" size="inline" />
							{result.attributes.cost}
						{:else if result.attributes.memory_cost !== null}
							<Icon name="mu" size="inline" />
							{result.attributes.memory_cost}
						{:else if result.attributes.trash_cost !== null}
							{result.attributes.trash_cost}
							<Icon name="trash" size="inline" />
						{/if}
					</span>
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.builder__quantity {
		display: inline-grid;
		grid-template-columns: 1.75rem 1.5rem 1.75rem;
		align-items: center;
		gap: 0.25rem;
	}

	.builder__quantity :global(.button) {
		width: 100%;
		min-height: 1.75rem;
		padding: 0;
	}

	.builder__quantity :global(.builder__identity) {
		grid-column: 1 / -1;
	}

	.builder__count {
		grid-column: 2;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	.builder__card-title {
		padding: 0;
		font: inherit;
		color: inherit;
		text-align: start;
		background: transparent;
		border: 0;
		cursor: pointer;
	}
</style>
