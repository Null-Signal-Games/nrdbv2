<script lang="ts">
    import type {
        SidesIds,
        FactionIds,
        CardTypeIds,
        Faction,
        Card as TCard,
    } from "$lib/types";
    import { card_types, factions as i18n_factions } from "$lib/i18n";
    import { CARD_TYPES } from "$lib/constants";
    import Icon from "$lib/components/Icon.svelte";
    import Influence from "$lib/components/Influence.svelte";
    import { tooltip } from "$lib/actions";
    import { localizeHref } from "$lib/paraglide/runtime";
    import CardImage from "../card/CardImage.svelte";

    interface Props {
        side: SidesIds;
        faction: FactionIds;
        identity: TCard["id"];
        factions: Faction[];
        cards: TCard[];
    }

    let { side, faction, identity, factions, cards }: Props = $props();

    let search_query = $state("");
    let results = $state<TCard[]>([]);
    let active_tab = $state<
        "Build" | "Notes" | "Check" | "History" | "Collection" | "Settings"
    >("Build");
    let notes_tags = $state("");
    let notes_body = $state("");
    let initialized_identity_id = $state<TCard["id"] | null>(null);

    let filters = $state<{
        factions: FactionIds[];
        types: CardTypeIds[];
    }>({
        factions: [faction],
        types: [],
    });

    let deck = $state<{
        cards: Partial<Record<CardTypeIds, Record<TCard["id"], number>>>;
    }>({
        cards: {},
    });

    let factions_list = $derived<Faction[]>(
        factions.filter((f: Faction) => f.attributes.side_id === side),
    );

    let identity_card = $derived<TCard | undefined>(
        cards.find((card: TCard) => card.id === identity),
    );

    let filtered_cards = $derived<TCard[]>(
        cards.filter(
            (card: TCard) =>
                card.attributes.card_type_id !== `${side}_identity`,
        ),
    );

    let filtered_types = $derived<CardTypeIds[]>(
        side === "corp"
            ? CARD_TYPES.filter(
                  (type) =>
                      ![
                          "event",
                          "hardware",
                          "resource",
                          "program",
                          "runner_identity",
                          "corp_identity",
                      ].includes(type),
              )
            : CARD_TYPES.filter(
                  (type) =>
                      ![
                          "agenda",
                          "asset",
                          "operation",
                          "upgrade",
                          "runner_identity",
                          "corp_identity",
                      ].includes(type),
              ),
    );

    const run_search = (value: string = "") => {
        const query = value.trim();

        const matches = filtered_cards.filter((card: TCard) => {
            const title_match =
                query.length === 0 ||
                card.attributes.title
                    .toLowerCase()
                    .includes(query.toLowerCase()) ||
                card.id.toLowerCase().includes(query.toLowerCase());

            const faction_match =
                filters.factions.length === 0 ||
                filters.factions.includes(
                    card.attributes.faction_id as FactionIds,
                );

            const type_match =
                filters.types.length === 0 ||
                filters.types.includes(card.attributes.card_type_id);

            return title_match && faction_match && type_match;
        });

        results = matches; // .slice(0, 20);
    };

    $effect(() => {
        if (!identity_card) return;

        if (initialized_identity_id === identity_card.id) return;

        initialized_identity_id = identity_card.id;

        filters.factions = [identity_card.attributes.faction_id as FactionIds];
        filters.types = [];
        deck.cards = {};
    });

    $effect(() => {
        run_search(search_query);
    });

    const toggle_faction = (faction_id: FactionIds) => {
        filters.factions = filters.factions.includes(faction_id)
            ? filters.factions.filter((value) => value !== faction_id)
            : [...filters.factions, faction_id];
    };

    const toggle_type = (card_type_id: CardTypeIds) => {
        filters.types = filters.types.includes(card_type_id)
            ? filters.types.filter((value) => value !== card_type_id)
            : [...filters.types, card_type_id];
    };

    const get_quantity = (card: TCard): number =>
        deck.cards[card.attributes.card_type_id]?.[card.id] ?? 0;

    const set_quantity = (card: TCard, quantity: number) => {
        const type_id = card.attributes.card_type_id;

        if (!deck.cards[type_id]) {
            deck.cards[type_id] = {};
        }

        if (quantity <= 0) {
            delete deck.cards[type_id][card.id];
            return;
        }

        deck.cards[type_id][card.id] = Math.min(3, quantity);
    };

    const increment = (card: TCard) => {
        set_quantity(card, get_quantity(card) + 1);
    };

    const decrement = (card: TCard) => {
        set_quantity(card, get_quantity(card) - 1);
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
                    <CardImage card={identity_card as never} />
                </div>
            {/if}

            <!-- TODO: refactor/replace this structure with the same structure in $lib/components/decklist/Breakdown.svelte -->
            <div class="builder__columns">
                {#each filtered_types as type (type)}
                    <section class="builder__group">
                        <h3>
                            <Icon name={type} size="sm" />
                            {card_types[type]}
                        </h3>
                        {#if Object.keys(deck.cards[type] ?? {}).length > 0}
                            <ul>
                                {#each Object.entries(deck.cards[type] ?? {}) as [card_id, quantity] (card_id)}
                                    {@const selected_card = filtered_cards.find(
                                        (card) => card.id === card_id,
                                    )}
                                    {#if selected_card}
                                        <li>
                                            <a
                                                href={localizeHref(
                                                    `/card/${card_id}`,
                                                )}
                                                use:tooltip={selected_card}
                                            >
                                                {quantity}x {selected_card
                                                    .attributes.title}
                                            </a>
                                            {#if selected_card.attributes.influence_cost > 0}
                                                <Influence
                                                    count={selected_card
                                                        .attributes
                                                        .influence_cost}
                                                    theme={selected_card
                                                        .attributes
                                                        .faction_id as FactionIds}
                                                />
                                            {/if}
                                        </li>
                                    {/if}
                                {/each}
                            </ul>
                        {:else}
                            <p class="builder__empty">No cards selected</p>
                        {/if}
                    </section>
                {/each}
            </div>
        </div>
    </div>

    <div class="builder__search">
        <div class="builder__tabs" role="tablist" aria-label="Decklist tabs">
            {#each ["Build", "Notes", "Check", "History", "Collection", "Settings"] as tab (tab)}
                <button
                    role="tab"
                    class:active={active_tab === tab}
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
                </button>
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
                oninput={(event) =>
                    run_search((event.currentTarget as HTMLInputElement).value)}
            />

            <div class="builder__filters">
                <section>
                    <h3>Filter by faction</h3>
                    <div class="builder__chips">
                        {#each factions_list as faction_option (faction_option.id)}
                            <button
                                class:active={filters.factions.includes(
                                    faction_option.id as FactionIds,
                                )}
                                onclick={() =>
                                    toggle_faction(
                                        faction_option.id as FactionIds,
                                    )}
                            >
                                <Icon name={faction_option.id} size="sm" />
                                {i18n_factions[faction_option.id as FactionIds]}
                            </button>
                        {/each}
                    </div>
                </section>

                <section>
                    <h3>Filter by type</h3>
                    <div class="builder__chips">
                        {#each filtered_types as type (type)}
                            <button
                                class:active={filters.types.includes(type)}
                                onclick={() => toggle_type(type)}
                            >
                                <Icon name={type} size="sm" />
                                {card_types[type]}
                            </button>
                        {/each}
                    </div>
                </section>
            </div>

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
                    {#each results as result (result.id)}
                        <tr>
                            <td>
                                <span class="builder__quantity">
                                    <button onclick={() => decrement(result)}
                                        >-</button
                                    >
                                    <input
                                        type="number"
                                        min="0"
                                        max="3"
                                        value={get_quantity(result)}
                                        oninput={(event) =>
                                            set_quantity(
                                                result,
                                                Number.parseInt(
                                                    (
                                                        event.currentTarget as HTMLInputElement
                                                    ).value,
                                                    10,
                                                ) || 0,
                                            )}
                                    />
                                    <button onclick={() => increment(result)}
                                        >+</button
                                    >
                                </span>
                            </td>
                            <td>
                                <a
                                    href={localizeHref(`/card/${result.id}`)}
                                    use:tooltip={result}
                                >
                                    {result.attributes.title}
                                </a>
                            </td>
                            <td>
                                <Icon
                                    name={result.attributes.card_type_id}
                                    size="sm"
                                />
                                {card_types[result.attributes.card_type_id]}
                            </td>
                            <td>
                                {#if result.attributes.influence_cost > 0}
                                    <Influence
                                        count={result.attributes.influence_cost}
                                        theme={result.attributes
                                            .faction_id as FactionIds}
                                    />
                                {/if}
                            </td>
                            <td>
                                <Icon
                                    name={result.attributes.faction_id}
                                    size="sm"
                                />
                                {i18n_factions[
                                    result.attributes.faction_id as FactionIds
                                ]}
                            </td>
                            <td>
                                {#if result.attributes.cost !== null}
                                    <Icon name="credit" size="sm" />
                                    {result.attributes.cost}
                                {:else if result.attributes.memory_cost !== null}
                                    <Icon name="mu" size="sm" />
                                    {result.attributes.memory_cost}
                                {:else if result.attributes.trash_cost !== null}
                                    {result.attributes.trash_cost}
                                    <Icon name="trash" size="sm" />
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
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

    .builder__columns {
        columns: 2;
        column-gap: 1rem;
    }

    .builder__group {
        break-inside: avoid-column;
        margin-bottom: 1rem;
    }

    .builder__group h3 {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        margin-bottom: 0.5rem;
    }

    .builder__group ul {
        display: grid;
        gap: 0.375rem;
        padding: 0;
        margin: 0;
        list-style: none;
    }

    .builder__group li {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        flex-wrap: wrap;
    }

    .builder__empty {
        opacity: 0.6;
    }

    .builder__label {
        font-weight: 600;
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

    .builder__tabs button {
        border: 1px solid var(--border);
        opacity: 0.5;
        background: transparent;
        padding: 0.375rem 0.75rem;
    }

    .builder__tabs button.active {
        opacity: 1;
        border-color: var(--text);
    }

    .builder__chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .builder__chips button {
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
    }

    .builder__quantity {
        display: inline-grid;
        grid-template-columns: auto 3rem auto;
        align-items: center;
        gap: 0.25rem;
    }

    .builder__quantity input {
        width: 100%;
        text-align: center;
    }

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
        opacity: 0.7;
    }

    @media (width <= 1024px) {
        .builder {
            grid-template-columns: 1fr;
        }

        .builder__filters {
            grid-template-columns: 1fr;
        }

        .builder__columns {
            columns: 1;
        }
    }
</style>
