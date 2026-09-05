<script lang="ts">
    import type {
        SidesIds,
        FactionIds,
        CardTypeIds,
        Card as TCard,
        CardGroup,
    } from "$lib/types";
    import { card_types, factions as i18n_factions } from "$lib/i18n";
    import {
        CORP_CARD_TYPES,
        RUNNER_CARD_TYPES,
    } from "$lib/constants";
    import { group_cards_by_type } from "$lib/utils";
    import Icon from "$lib/components/Icon.svelte";
    import CardImage from "../card/CardImage.svelte";
    import Button from "../ui/Button.svelte";
    import DeckBuilderSearchResults from "./DeckBuilderSearchResults.svelte";
    import Grid from "./Grid.svelte";
    import type { CardSlots } from "./grid";

    interface Props {
        identity: TCard["id"];
        side_cards: TCard[];
    }

    let { identity, side_cards }: Props = $props();

    let search_query = $state("");
    let active_tab = $state<
        "Build" | "Notes" | "Check" | "History" | "Collection" | "Settings"
    >("Build");
    let notes_tags = $state("");
    let notes_body = $state("");

    let deck = $state<CardSlots>({});

    let identity_card = $derived<TCard | undefined>(
        side_cards.find((card: TCard) => card.id === identity),
    );

    let side = $derived<SidesIds>(
        identity_card?.attributes.side_id ?? "corp",
    );

    let faction_filters = $state<FactionIds[]>([]);

    let type_filters = $state<CardTypeIds[]>([]);

    let faction_options = $derived<FactionIds[]>(
        [
            ...new Set(
                side_cards.map((card) => card.attributes.faction_id),
            ),
        ].sort((a, b) =>
            i18n_factions[a].localeCompare(i18n_factions[b]),
        ),
    );

    let type_options = $derived<CardTypeIds[]>(
        side === "corp" ? CORP_CARD_TYPES : RUNNER_CARD_TYPES,
    );

    let grouped_cards = $derived<CardGroup[]>(
        group_cards_by_type(side_cards),
    );

    let card_slots = $derived<CardSlots>(deck);

    let has_cards = $derived(
        grouped_cards.some((group) =>
            group.data.some((card) => (card_slots[card.id] ?? 0) > 0),
        ),
    );

    let search_results = $derived.by<TCard[]>(() => {
        const query = search_query.trim();

        return side_cards.filter((card: TCard) => {
            const title_match =
                query.length === 0 ||
                card.attributes.title
                    .toLowerCase()
                    .includes(query.toLowerCase()) ||
                card.id.toLowerCase().includes(query.toLowerCase());

            const faction_match =
                faction_filters.length === 0 ||
                faction_filters.includes(card.attributes.faction_id);

            const type_match =
                type_filters.length === 0 ||
                type_filters.includes(card.attributes.card_type_id);

            return title_match && faction_match && type_match;
        });
    });

    const toggle = <T>(values: T[], value: T): T[] =>
        values.includes(value)
            ? values.filter((existing) => existing !== value)
            : [...values, value];

    const on_toggle_faction_change = (faction_id: FactionIds) => {
        faction_filters = toggle(faction_filters, faction_id);
    };

    const on_toggle_type_change = (card_type_id: CardTypeIds) => {
        type_filters = toggle(type_filters, card_type_id);
    };
</script>

<div class="builder">
    <div class="builder__summary">
        <div class="builder__summary__sticky">
            <h2>Decklist builder</h2>
            {#if identity_card}
                <p>
                    Decklist for <strong
                        >{identity_card.attributes.title}</strong
                    >
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
            {#each ["Build", "Notes", "Check", "History", "Collection", "Settings"] as tab (tab)}
                <Button
                    role="tab"
                    color={active_tab === tab ? "primary" : "ghost"}
                    aria-selected={active_tab === tab}
                    onclick={() =>
                        (active_tab = tab as
                            | "Build"
                            | "Notes"
                            | "Check"
                            | "History"
                            | "Collection"
                            | "Settings")}
                >
                    {tab}
                </Button>
            {/each}
        </div>

        {#if active_tab === "Build"}
            <label class="builder__label" for="deck-search">Find cards</label>
            <input
                id="deck-search"
                class="builder__input"
                type="search"
                placeholder="Find a card or filter the list"
                bind:value={search_query}
            />

            <div class="builder__filters">
                <section>
                    <h3>Filter by faction</h3>
                    <div class="builder__chips">
                        {#each faction_options as faction_option (faction_option)}
                            <Button
                                color={faction_filters.includes(
                                    faction_option,
                                )
                                    ? "primary"
                                    : "ghost"}
                                onclick={() =>
                                    on_toggle_faction_change(faction_option)}
                            >
                                <Icon name={faction_option} size="sm" />
                                {i18n_factions[faction_option]}
                            </Button>
                        {/each}
                    </div>
                </section>

                <section>
                    <h3>Filter by type</h3>
                    <div class="builder__chips">
                        {#each type_options as type (type)}
                            <Button
                                color={type_filters.includes(type)
                                    ? "primary"
                                    : "ghost"}
                                onclick={() =>
                                    on_toggle_type_change(type)}
                            >
                                <Icon name={type} size="sm" />
                                {card_types[type]}
                            </Button>
                        {/each}
                    </div>
                </section>
            </div>

            <DeckBuilderSearchResults cards={search_results} bind:deck />
            {#if search_results.length === 0}
                <p class="builder__empty">No cards found</p>
            {/if}
        {:else if active_tab === "Notes"}
            <div class="builder__notes">
                <label>
                    <span>Tags</span>
                    <input
                        type="text"
                        class="builder__input"
                        bind:value={notes_tags}
                    />
                </label>
                <small>
                    Tags are for easy filtering in your list of decks, e.g.
                    tournament or glacier.
                </small>
                <label>
                    <span>Notes</span>
                    <textarea class="builder__textarea" bind:value={notes_body}
                    ></textarea>
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

    .builder__label {
        font-weight: var(--font-weight-semibold);
    }

    .builder__input {
        width: 100%;
    }

    .builder__filters {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(2, minmax(0, 1fr));
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

    .builder__chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    /* .builder__chips button {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem 0.5rem;
        border: 1px solid var(--border);
        background: transparent;
        opacity: 0.5;
    }

    .builder__chips button.active {
        background: var(--text);
        color: var(--foreground);
        opacity: 1;
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

        .builder__filters {
            grid-template-columns: 1fr;
        }
    }
</style>
