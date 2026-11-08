<script lang="ts">
	import type { Card as TCard, CardGroup, Decklist, Set as TSet } from '$lib/types';
	import { card_quantity, group_cards_by_type } from '$lib/utils';
	import { card_types } from '$lib/i18n';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Table from '$lib/components/Table.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import CardImage from '$lib/components/card/CardImage.svelte';
	import ToggleGroup from '$lib/components/ui/ToggleGroup.svelte';
	import DecklistBreakdown from './Breakdown.svelte';
	import Grid from './Grid.svelte';
	import DeckStats from './DeckStats.svelte';
	import { computeDeckStats } from './deck_stats';

	interface Props {
		identity: TCard;
		decklist: Decklist;
		cards: TCard[];
		sets: TSet[];
	}

	let { identity, decklist, cards, sets }: Props = $props();

	const grouped_cards: CardGroup[] = $derived(group_cards_by_type(cards));
	const count = $derived(card_quantity(decklist, grouped_cards));
	const stats = $derived(computeDeckStats(identity, cards, decklist.attributes.card_slots));

	// TODO(review): Ensure packs are unique and sorted by release date, and anything else useful
	interface PackUsage {
		set: TSet;
		cards: (TCard & { quantity: number })[];
		total: number;
	}

	const cards_by_pack: PackUsage[] = $derived(
		sets
			.map((set) => {
				const set_cards = cards
					.filter((card) => card.attributes.card_set_ids.includes(set.id))
					.map((card) => ({
						...card,
						quantity: decklist.attributes.card_slots[card.id] || 0
					}));

				return {
					set,
					cards: set_cards,
					total: set_cards.reduce((sum, card) => sum + card.quantity, 0)
				};
			})
			.filter((pack) => pack.cards.length > 0)
	);

	const tabs = [
		{ value: 'classic', label: 'Classic layout' },
		{ value: 'visual', label: 'Visual layout' },
		{ value: 'table', label: 'Table layout' },
		{ value: 'legality', label: 'Legality' },
		{ value: 'rotation', label: 'Rotation' },
		{ value: 'packs', label: 'Packs' }
	] as const;

	type TabId = (typeof tabs)[number]['value'];

	let active_tab: TabId = $state('classic');
</script>

<div class="wrapper">
	<div class="decklist__summary">
		<DeckStats {stats} />
	</div>

	<ToggleGroup
		options={[...tabs]}
		label="Decklist views"
		as_tabs
		id_prefix="decklist-view"
		selected={active_tab}
		onselect={(value) => (active_tab = value)}
	/>

	<div
		class="panel"
		role="tabpanel"
		id="decklist-view-panel-classic"
		aria-labelledby="decklist-view-tab-classic"
		tabindex="0"
		hidden={active_tab !== 'classic'}
	>
		<DecklistBreakdown {decklist} {cards} />
	</div>

	<div
		class="panel panel--visual"
		role="tabpanel"
		id="decklist-view-panel-visual"
		aria-labelledby="decklist-view-tab-visual"
		tabindex="0"
		hidden={active_tab !== 'visual'}
	>
		<Grid groups={grouped_cards} cardSlots={decklist.attributes.card_slots} />
	</div>

	<div
		class="panel"
		role="tabpanel"
		id="decklist-view-panel-table"
		aria-labelledby="decklist-view-tab-table"
		tabindex="0"
		hidden={active_tab !== 'table'}
	>
		{#each grouped_cards as group (group.type)}
			<div class="group">
				<div class="icon-text">
					<Icon name={group.type} />
					<h3>
						{card_types[group.type]} ({count[group.type]})
					</h3>
				</div>
				<Table {decklist} cards={group.data} />
			</div>
		{/each}
	</div>

	<div
		class="panel"
		role="tabpanel"
		id="decklist-view-panel-legality"
		aria-labelledby="decklist-view-tab-legality"
		tabindex="0"
		hidden={active_tab !== 'legality'}
	>
		<h2>Legality</h2>
		<!-- TODO: get decklists legality(s) -->
	</div>

	<div
		class="panel"
		role="tabpanel"
		id="decklist-view-panel-rotation"
		aria-labelledby="decklist-view-tab-rotation"
		tabindex="0"
		hidden={active_tab !== 'rotation'}
	>
		<h2>Rotation</h2>
		<!-- TODO: get decklists rotation(s) -->
	</div>

	<div
		class="panel"
		role="tabpanel"
		id="decklist-view-panel-packs"
		aria-labelledby="decklist-view-tab-packs"
		tabindex="0"
		hidden={active_tab !== 'packs'}
	>
		<h2>Packs</h2>
		{#if cards_by_pack.length > 0}
			<div class="packs">
				{#each cards_by_pack as pack (pack.set.id)}
					<article class="pack">
						<a class="pack__heading" href={localizeHref(`/sets/${pack.set.id}`)}>
							<h3>{pack.set.attributes.name}</h3>
							<p>{pack.total} cards</p>
						</a>

						<div class="pack__cards">
							{#each pack.cards as card (card.id)}
								<div class="pack__card">
									<CardImage {card} loading="lazy" />
									{#if card.quantity > 1}
										<span class="pack__quantity">&times;{card.quantity}</span>
									{/if}
								</div>
							{/each}
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<p>No packs found</p>
		{/if}
	</div>
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1rem;
	}

	.panel {
		display: grid;
		gap: 2rem;
	}

	/* `display: grid` above would otherwise override the UA `[hidden]` style */
	.panel[hidden] {
		display: none;
	}

	.panel--visual {
		min-inline-size: 0;
	}

	.decklist__summary {
		padding-block-end: 0.75rem;
		border-block-end: 1px solid var(--border);
	}

	.group {
		display: grid;
		gap: 1rem;
	}

	.packs {
		display: grid;
		gap: 1.25rem;
		grid-template-columns: repeat(3, 1fr);
	}

	.pack {
		display: grid;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid var(--border);
		background: var(--foreground);
		border-radius: 0.75rem;
	}

	.pack__heading {
		display: grid;
		gap: 0.25rem;
		color: inherit;
		text-decoration: none;
	}

	.pack__heading h3,
	.pack__heading p {
		margin: 0;
	}

	.pack__heading p {
		color: var(--text-muted);
	}

	.pack__cards {
		display: grid;
		gap: 0.5rem;
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.pack__card {
		position: relative;
	}

	.pack__quantity {
		position: absolute;
		inset-block-end: 0.25rem;
		inset-inline-end: 0.25rem;
		padding: 0.125rem 0.375rem;
		border-radius: 0.375rem;
		background: color-mix(in oklab, var(--foreground) 85%, transparent);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
	}

	@media (max-width: 936px) {
		.packs {
			grid-template-columns: 1fr;
		}
	}
</style>
