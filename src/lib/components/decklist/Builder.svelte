<script lang="ts">
	import type { SidesIds, FactionIds, CardTypeIds, Card as TCard, CardGroup } from '$lib/types';
	import { card_types, faction_name, formats as i18n_formats } from '$lib/i18n';
	import { CORP_CARD_TYPES, RUNNER_CARD_TYPES } from '$lib/constants';
	import { DECK_FORMATS, type ActiveCardPoolIds, type DeckFormat } from '$lib/deck_formats';
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
	import ToggleGroup, { type ToggleOption } from '../ui/ToggleGroup.svelte';
	import DeckBuilderSearchResults from './DeckBuilderSearchResults.svelte';
	import CardQuantity from './CardQuantity.svelte';
	import Grid from './Grid.svelte';
	import { setCardSlot, type CardSlots } from './card_slots';

	interface Props {
		identity: TCard['id'];
		side_cards: TCard[];
		active_card_pool_ids: ActiveCardPoolIds;
		format: DeckFormat;
		on_select_format: (format: DeckFormat) => void;
	}

	let { identity, side_cards, active_card_pool_ids, format, on_select_format }: Props = $props();

	let search_query = $state('');
	let active_tab = $state<'Build' | 'Notes' | 'Check' | 'History' | 'Collection' | 'Settings'>(
		'Build'
	);
	let notes_tags = $state('');
	let notes_body = $state('');

	let deck = $state<CardSlots>({});

	let identity_card = $derived<TCard | undefined>(
		side_cards.find((card: TCard) => card.id === identity)
	);

	let side = $derived<SidesIds>(identity_card?.attributes.side_id ?? 'corp');

	let interpreted_query = $derived(interpretQuery(search_query));
	let active_filters = $derived(collectActiveFilters(interpreted_query));
	let faction_filters = $derived(
		active_filters.flatMap((filter) => (filter.kind === 'faction' ? [filter.id] : []))
	);
	let type_filters = $derived(
		active_filters.flatMap((filter) => (filter.kind === 'cardType' ? [filter.id] : []))
	);

	let faction_toggles = $derived<ToggleOption<FactionIds>[]>(
		collectFactionsInActiveCardPool(side_cards, format, active_card_pool_ids).map(
			(faction_id) => ({
				value: faction_id,
				label: faction_name(faction_id),
				color: `var(--${faction_id})`
			})
		)
	);

	let type_toggles = $derived<ToggleOption<CardTypeIds>[]>(
		(side === 'corp' ? CORP_CARD_TYPES : RUNNER_CARD_TYPES).map((card_type_id) => ({
			value: card_type_id,
			label: card_types[card_type_id]
		}))
	);

	const format_toggles: ToggleOption<DeckFormat>[] = DECK_FORMATS.map((format_option) => ({
		value: format_option,
		label: i18n_formats[format_option]
	}));

	const format_clause = $derived(format === 'all' ? '' : `format:${format}`);

	let grouped_cards = $derived<CardGroup[]>(group_cards_by_type(side_cards));

	let card_slots = $derived<CardSlots>(deck);

	let has_cards = $derived(
		grouped_cards.some((group) => group.data.some((card) => (card_slots[card.id] ?? 0) > 0))
	);

	let search_results = $state<{ query: string; cards: TCard[] }>({ query: '', cards: [] });

	let search_request = 0;

	const full_query = $derived(
		[interpreted_query.expression, format_clause].filter(Boolean).join(' ')
	);

	$effect(() => {
		const request = ++search_request;
		const query = full_query;

		if (query.length === 0) {
			search_results = { query: '', cards: side_cards };
			return;
		}

		searchCards(query, {
			constraint: {
				clause: 'unified_cards.side_id = ?',
				params: [side]
			}
		}).then(({ cards, error }) => {
			if (error === null && request === search_request) {
				search_results = { query, cards };
			}
		});
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

	const set_card_quantity = (card: TCard, quantity: number) => {
		deck = setCardSlot(deck, card, quantity);
		search_query = '';
		closeCardModal();
	};

	const on_card_key_down = (event: KeyboardEvent, card: TCard) => {
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
		if (search_results.query !== full_query) return;

		const first = search_results.cards[0];
		if (!first) return;

		open_card_modal(first);
	};
</script>

{#snippet card_actions(card: TCard)}
	<CardQuantity
		{card}
		quantity={deck[card.id] ?? 0}
		onselect={(quantity) => set_card_quantity(card, quantity)}
	/>
{/snippet}

<div class="builder">
	<div class="builder__summary">
		<div class="builder__summary__sticky">
			<h2>Decklist builder</h2>
			{#if identity_card}
				<p>
					Decklist for <strong>{identity_card.attributes.title}</strong>
				</p>
				<div style="width: 50%;">
					<CardImage card={identity_card} />
				</div>
			{/if}

			{#if has_cards}
				<Grid groups={grouped_cards} cardSlots={card_slots} />
			{:else}
				<p class="builder__empty">No cards selected</p>
			{/if}
		</div>
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
					bind:value={search_query}
				/>
			</form>

			<ToggleGroup
				options={format_toggles}
				label={m.format()}
				size="sm"
				selected={format}
				onselect={on_select_format}
			/>

			<div class="builder__filters">
				<ToggleGroup
					options={faction_toggles}
					label="Filter by faction"
					size="sm"
					icon_only
					multiple
					selection={faction_filters}
					ontoggle={(_selection, faction_id) => on_toggle_faction_change(faction_id)}
				>
					{#snippet option(faction_option)}
						<Icon name={faction_option.value} size="sm" label="" />
					{/snippet}
				</ToggleGroup>

				<ToggleGroup
					options={type_toggles}
					label="Filter by type"
					size="sm"
					icon_only
					multiple
					selection={type_filters}
					ontoggle={(_selection, card_type_id) => on_toggle_type_change(card_type_id)}
				>
					{#snippet option(type_option)}
						<Icon name={type_option.value} size="sm" label="" />
					{/snippet}
				</ToggleGroup>
			</div>

			<DeckBuilderSearchResults
				cards={search_results.cards}
				bind:deck
				on_open_card={open_card_modal}
			/>
			{#if search_results.cards.length === 0}
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
		gap: 2rem;
		grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
	}

	.builder__summary,
	.builder__search {
		display: grid;
		align-content: start;
		gap: 1rem;
	}

	.builder__summary__sticky {
		position: sticky;
		top: 1rem;
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

	.builder__filters {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
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
