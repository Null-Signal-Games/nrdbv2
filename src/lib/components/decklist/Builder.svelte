<script lang="ts">
	import type { SidesIds, FactionIds, CardTypeIds, Card as TCard, CardGroup } from '$lib/types';
	import { card_types, faction_name, format_toggle_options } from '$lib/i18n';
	import { CORP_CARD_TYPES, RUNNER_CARD_TYPES } from '$lib/constants';
	import type { ActiveCardPoolIds, DeckFormat } from '$lib/deck_formats';
	import { collectFactionsInActiveCardPool } from '$lib/identities';
	import { group_cards_by_type } from '$lib/utils';
	import { searchCards } from '$lib/search';
	import {
		interpretQuery,
		collectActiveFilters,
		toggleFilterInQuery
	} from '$lib/search/interpret';
	import { onDestroy } from 'svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { closeCardModal, openCardModal } from '$lib/store';
	import Icon from '$lib/components/Icon.svelte';
	import CardImage from '../card/CardImage.svelte';
	import Button from '../ui/Button.svelte';
	import Toolbar, {
		type TGroup as ToolbarGroup,
		type Option as ToolbarOption
	} from '../ui/Toolbar.svelte';
	import DeckBuilderSearchResults from './DeckBuilderSearchResults.svelte';
	import CardQuantity from './CardQuantity.svelte';
	import IdentitySelect from './IdentitySelect.svelte';
	import Grid from './Grid.svelte';
	import DeckStats from './DeckStats.svelte';
	import { isIdentity, setCardSlot, type CardSlots } from './card_slots';
	import { computeDeckStats } from './deck_stats';

	interface Props {
		identity: TCard;
		side_cards: TCard[];
		active_card_pool_ids: ActiveCardPoolIds;
		format: DeckFormat;
		on_select_format: (format: DeckFormat) => void;
		on_select_identity: (identity: TCard['id']) => void;
	}

	let {
		identity,
		side_cards,
		active_card_pool_ids,
		format,
		on_select_format,
		on_select_identity
	}: Props = $props();

	let search_query = $state('');
	let active_tab = $state<'Build' | 'Notes' | 'Check' | 'History' | 'Collection' | 'Settings'>(
		'Build'
	);
	let notes_tags = $state('');
	let notes_body = $state('');

	let deck = $state<CardSlots>({});

	let side = $derived<SidesIds>(identity.attributes.side_id);

	let interpreted_query = $derived(interpretQuery(search_query));
	let active_filters = $derived(collectActiveFilters(interpreted_query));
	let faction_filters = $derived(
		active_filters.flatMap((filter) => (filter.kind === 'faction' ? [filter.id] : []))
	);
	let type_filters = $derived(
		active_filters.flatMap((filter) => (filter.kind === 'cardType' ? [filter.id] : []))
	);

	let faction_toggles = $derived<ToolbarOption<FactionIds>[]>(
		collectFactionsInActiveCardPool(side_cards, format, active_card_pool_ids).map(
			(faction_id) => ({
				value: faction_id,
				label: faction_name(faction_id),
				color: `var(--${faction_id})`
			})
		)
	);

	let type_toggles = $derived<ToolbarOption<CardTypeIds>[]>(
		(side === 'corp' ? CORP_CARD_TYPES : RUNNER_CARD_TYPES).map((card_type_id) => ({
			value: card_type_id,
			label: card_types[card_type_id]
		}))
	);

	let grouped_cards = $derived<CardGroup[]>(group_cards_by_type(side_cards));

	let card_slots = $derived<CardSlots>(deck);

	let deck_stats = $derived(computeDeckStats(identity, side_cards, card_slots));

	let has_cards = $derived(
		grouped_cards.some((group) => group.data.some((card) => (card_slots[card.id] ?? 0) > 0))
	);

	let search_results = $state<TCard[]>([]);
	let has_current_results = $state(true);

	$effect(() => {
		const expression = interpreted_query.expression;

		if (!expression.trim() && format === 'all') {
			search_results = side_cards;
			has_current_results = true;
			return;
		}

		let cancelled = false;
		has_current_results = false;

		searchCards(expression, {
			format,
			side
		}).then(({ cards, error }) => {
			if (cancelled || error) return;
			search_results = cards;
			has_current_results = true;
		});

		return () => {
			cancelled = true;
		};
	});

	const on_toggle_faction_change = (faction_id: FactionIds) => {
		search_query = toggleFilterInQuery(interpreted_query, { kind: 'faction', id: faction_id });
	};

	const on_toggle_type_change = (card_type_id: CardTypeIds) => {
		search_query = toggleFilterInQuery(interpreted_query, {
			kind: 'cardType',
			id: card_type_id
		});
	};

	const on_faction_toolbar_change = (selection: string[]) => {
		const faction_id = faction_toggles.find(
			({ value }) => faction_filters.includes(value) !== selection.includes(value)
		)?.value;
		if (faction_id) on_toggle_faction_change(faction_id);
	};

	const on_type_toolbar_change = (selection: string[]) => {
		const card_type_id = type_toggles.find(
			({ value }) => type_filters.includes(value) !== selection.includes(value)
		)?.value;
		if (card_type_id) on_toggle_type_change(card_type_id);
	};

	let toolbar_groups = $derived<ToolbarGroup[]>([
		{
			type: 'single',
			options: format_toggle_options,
			label: m.format(),
			value: format,
			onValueChange: (value) => on_select_format(value as DeckFormat)
		},
		{
			type: 'multiple',
			options: faction_toggles,
			label: 'Filter by faction',
			value: faction_filters,
			onValueChange: on_faction_toolbar_change,
			icon_only: true
		},
		{
			type: 'multiple',
			options: type_toggles,
			label: 'Filter by type',
			value: type_filters,
			onValueChange: on_type_toolbar_change,
			icon_only: true
		}
	]);

	const update_card_quantity = (card: TCard, quantity: number) => {
		deck = setCardSlot(deck, card, quantity);
	};

	const set_card_quantity = (card: TCard, quantity: number) => {
		update_card_quantity(card, quantity);
		search_query = '';
		closeCardModal();
	};

	const select_identity = (card: TCard) => {
		on_select_identity(card.id);
		search_query = '';
		closeCardModal();
	};

	const on_card_key_down = (event: KeyboardEvent, card: TCard) => {
		if (isIdentity(card)) return;
		if (event.metaKey || event.ctrlKey || event.altKey) return;
		if (!/^[0-9]$/.test(event.key)) return;

		const quantity = Number(event.key);
		if (quantity > card.attributes.deck_limit) return;

		event.preventDefault();
		set_card_quantity(card, quantity);
	};

	const open_card_modal = (card: TCard) =>
		openCardModal(card, {
			actions: card_actions,
			onKeyDown: (event) => on_card_key_down(event, card)
		});

	onDestroy(closeCardModal);

	const on_search_submit = (event: SubmitEvent) => {
		event.preventDefault();
		if (!has_current_results) return;

		const first = search_results[0];
		if (!first) return;

		open_card_modal(first);
	};
</script>

{#snippet card_actions(card: TCard)}
	{#if isIdentity(card)}
		<IdentitySelect selected={card.id === identity.id} onselect={() => select_identity(card)} />
	{:else}
		<CardQuantity
			{card}
			quantity={deck[card.id] ?? 0}
			onselect={(quantity) => set_card_quantity(card, quantity)}
		/>
	{/if}
{/snippet}

<div class="builder">
	<div class="builder__summary">
		<div class="builder__identity-row">
			<button
				type="button"
				class="builder__identity-card"
				aria-haspopup="dialog"
				aria-label={identity.attributes.title}
				onclick={() => openCardModal(identity)}
			>
				<CardImage card={identity} href={null} />
			</button>

			<div class="builder__identity">
				<p class="builder__identity-name">{identity.attributes.title}</p>

				<DeckStats stats={deck_stats} />
			</div>
		</div>

		{#if has_cards}
			<Grid groups={grouped_cards} cardSlots={card_slots} />
		{:else}
			<p class="builder__empty">No cards selected</p>
		{/if}
	</div>

	<div class="builder__search">
		<div class="builder__tabs" role="tablist" aria-label="Decklist tabs">
			{#each ['Build', 'Notes', 'Check', 'History', 'Collection', 'Settings'] as tab (tab)}
				<Button
					role="tab"
					color={active_tab === tab ? 'primary' : 'ghost'}
					aria-selected={active_tab === tab}
					onclick={() =>
						(active_tab = tab as
							'Build' | 'Notes' | 'Check' | 'History' | 'Collection' | 'Settings')}
				>
					{tab}
				</Button>
			{/each}
		</div>

		{#if active_tab === 'Build'}
			<form class="builder__search-form" onsubmit={on_search_submit}>
				<label class="builder__label" for="deck-search">Find cards</label>
				<input
					id="deck-search"
					class="builder__input"
					type="search"
					placeholder="Find a card or filter the list"
					autocomplete="off"
					bind:value={search_query}
				/>
			</form>

			<Toolbar groups={toolbar_groups} label="Deck builder filters">
				{#snippet option(toolbar_option)}
					<Icon name={toolbar_option.value} size="sm" label="" />
				{/snippet}
			</Toolbar>

			<DeckBuilderSearchResults
				cards={search_results}
				{deck}
				identity={identity.id}
				on_open_card={open_card_modal}
				on_set_quantity={update_card_quantity}
				on_select_identity={select_identity}
			/>
			{#if search_results.length === 0}
				<p class="builder__empty">No cards found</p>
			{/if}
		{:else if active_tab === 'Notes'}
			<div class="builder__notes">
				<label>
					<span>Tags</span>
					<input type="text" class="builder__input" bind:value={notes_tags} />
				</label>
				<small>
					Tags are for easy filtering in your list of decks, e.g. tournament or glacier.
				</small>
				<label>
					<span>Notes</span>
					<textarea class="builder__textarea" bind:value={notes_body}></textarea>
				</label>
				<div class="builder__notes-preview">Markdown preview here</div>
			</div>
		{:else}
			<p>{active_tab}</p>
		{/if}
	</div>
</div>

<style>
	.builder {
		display: grid;
		margin-block: 1rem 3rem;
		gap: 2rem;
		grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
	}

	.builder__summary,
	.builder__search {
		display: grid;
		align-content: start;
		gap: 1rem;
	}

	.builder__summary {
		position: sticky;
		top: 1rem;
		align-self: start;
	}

	.builder__identity-row {
		display: flex;
		align-items: center;
		gap: 1rem 1.5rem;
	}

	.builder__identity-card {
		flex-shrink: 0;
		inline-size: 6rem;
		padding: 0;
		border: 0;
		border-radius: var(--card-radius);
		background: transparent;
		cursor: pointer;
	}

	.builder__identity-card:focus-visible {
		outline: 3px solid currentColor;
		outline-offset: 3px;
	}

	.builder__identity {
		display: grid;
		gap: 0.75rem;
		min-inline-size: 0;
	}

	.builder__identity-name {
		margin: 0;
		font-weight: var(--font-weight-semibold);
	}

	.builder__empty {
		color: var(--text-muted);
	}

	.builder__search-form {
		display: grid;
		gap: 1rem;
	}

	.builder__label {
		font-weight: var(--font-weight-semibold);
	}

	.builder__input {
		width: 100%;
	}

	.builder__tabs {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	/* .builder__tabs button {
        border: 1px solid var(--border);
        opacity: 0.5;
        background: transparent;
        padding: 0.375rem 0.75rem;
    }

    .builder__tabs button.active {
        opacity: 1;
        border-color: var(--text);
    } */

	.builder__notes {
		display: grid;
		gap: 0.75rem;
	}

	.builder__notes label {
		display: grid;
		gap: 0.25rem;
	}

	.builder__textarea {
		min-height: 8rem;
		resize: vertical;
	}

	.builder__notes-preview {
		color: var(--text-muted);
	}

	@media (width <= 1024px) {
		.builder {
			grid-template-columns: 1fr;
		}
	}
</style>
