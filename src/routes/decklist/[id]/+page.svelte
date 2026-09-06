<script lang="ts">
    import type {
        Decklist,
        FileFormat,
        Card as TCard,
        CardGroup,
        Set as TSet,
    } from "$lib/types";
    import Header from "$lib/components/Header.svelte";
    import {
        group_cards_by_type,
        card_quantity,
        format_date,
        print,
        share,
        download_file,
        export_format,
    } from "$lib/utils";
    import Table from "$lib/components/Table.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { card_types } from "$lib/i18n";
    import DeckListSummary from "$lib/components/decklist/Summary.svelte";
    import DecklistBreakdown from "$lib/components/decklist/Breakdown.svelte";
    import Grid from "$lib/components/decklist/Grid.svelte";
    import Printer from "$lib/components/Printer.svelte";
    import ToggleGroup from "$lib/components/ui/ToggleGroup.svelte";
    import CardImage from "$lib/components/card/CardImage.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";
    import Container from "$lib/components/Container.svelte";

    interface Props {
        data: {
            identity: TCard;
            decklist: Decklist;
            cards: TCard[];
            sets: TSet[];
        };
    }

    let { data }: Props = $props();

    const grouped_cards: CardGroup[] = $derived(group_cards_by_type(data.cards));
    const count = $derived(card_quantity(data.decklist, grouped_cards));
    // const total_cards = Object.values(count).reduce((sum, n) => sum + n, 0);

    // TODO(review): Ensure packs are unique and sorted by release date, and anything else useful
    interface PackUsage {
        set: TSet;
        cards: (TCard & { quantity: number })[];
        total: number;
    }

    const cards_by_pack: PackUsage[] = $derived(
        data.sets
            .map((set) => {
                const cards = data.cards
                    .filter((card) =>
                        card.attributes.card_set_ids.includes(set.id),
                    )
                    .map((card) => ({
                        ...card,
                        quantity:
                            data.decklist.attributes.card_slots[card.id] || 0,
                    }));

                return {
                    set,
                    cards,
                    total: cards.reduce((sum, card) => sum + card.quantity, 0),
                };
            })
            .filter((pack) => pack.cards.length > 0),
    );

    const export_and_download = async (format: FileFormat = "json") => {
        const data_formatted = export_format(
            data.decklist,
            format as FileFormat,
            data.cards,
        );
        download_file(
            JSON.stringify(data_formatted, null, 2),
            data.decklist.attributes.name,
            format,
        );
    };

    const tabs = [
        { value: "classic", label: "Classic layout" },
        { value: "visual", label: "Visual layout" },
        { value: "table", label: "Table layout" },
        { value: "legality", label: "Legality" },
        { value: "rotation", label: "Rotation" },
        { value: "packs", label: "Packs" },
    ] as const;

    type TabId = (typeof tabs)[number]["value"];

    let active_tab: TabId = $state("classic");
</script>

{#if data.decklist}
    <Header title={`Decklist: ${data.decklist.attributes.name}`}>
        <a href={localizeHref(`/profile/${data.decklist.attributes.user_id}`)}
            >{data.decklist.attributes.user_id}</a
        >
        <Icon name={data.decklist.attributes.faction_id} />
        <p>
            Created at:
            <time datetime={data.decklist.attributes.created_at}>
                {format_date(data.decklist.attributes.created_at)}
            </time>
        </p>
        <p>
            Updated at:
            <time datetime={data.decklist.attributes.updated_at}>
                {format_date(data.decklist.attributes.updated_at)}
            </time>
        </p>

        <!-- TODO: get decklists likes count -->
        <p>
            <Icon name="heart" />
            Likes: [NUMBER]
        </p>

        <!-- TODO: get decklists favourites count -->
        <p>
            <Icon name="star" />
            Favourites: [NUMBER]
        </p>

        <!-- TODO: get decklists comments count -->
        <p>
            <Icon name="comment" />
            Comments: [NUMBER]
        </p>
    </Header>

    <Container>
        <div>
            <h2>Actions</h2>
            <p>Download as:</p>
            {#each ["json", "txt", "otcgn", "bbcode", "md", "jinteki.net"] as format, index (index)}
                <button
                    onclick={() => export_and_download(format as FileFormat)}
                >
                    {format}
                </button>
            {/each}
            <hr />
            <button onclick={() => print()}>print</button>
            <button
                onclick={() =>
                    share({
                        title: data.decklist.attributes.name,
                        text: `Decklist by ${data.decklist.attributes.user_id}`,
                        url: window.location.href,
                    })}>share</button
            >
        </div>

        <div class="wrapper">
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
                hidden={active_tab !== "classic"}
            >
                <!-- TODO: Abstract to component for reuse on homepage -->
                <div class="decklist">
                    <DeckListSummary
                        identity={data.identity}
                        decklist={data.decklist}
                    />
                    <DecklistBreakdown
                        decklist={data.decklist}
                        cards={data.cards}
                    />
                </div>
            </div>

            <div
                class="panel panel--visual"
                role="tabpanel"
                id="decklist-view-panel-visual"
                aria-labelledby="decklist-view-tab-visual"
                tabindex="0"
                hidden={active_tab !== "visual"}
            >
                <Grid
                    groups={grouped_cards}
                    cardSlots={data.decklist.attributes.card_slots}
                />
            </div>

            <div
                class="panel"
                role="tabpanel"
                id="decklist-view-panel-table"
                aria-labelledby="decklist-view-tab-table"
                tabindex="0"
                hidden={active_tab !== "table"}
            >
                {#each grouped_cards as group (group.type)}
                    <div class="group">
                        <div class="icon-text">
                            <Icon name={group.type} />
                            <h4>
                                {card_types[group.type]} ({count[group.type]})
                            </h4>
                        </div>
                        <Table decklist={data.decklist} cards={group.data} />
                    </div>
                {/each}
            </div>

            <div
                class="panel"
                role="tabpanel"
                id="decklist-view-panel-legality"
                aria-labelledby="decklist-view-tab-legality"
                tabindex="0"
                hidden={active_tab !== "legality"}
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
                hidden={active_tab !== "rotation"}
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
                hidden={active_tab !== "packs"}
            >
                <h2>Packs</h2>
                {#if cards_by_pack.length > 0}
                    <div class="packs">
                        {#each cards_by_pack as pack (pack.set.id)}
                            <article class="pack">
                                <a
                                    class="pack__heading"
                                    href={localizeHref(`/sets/${pack.set.id}`)}
                                >
                                    <h3>{pack.set.attributes.name}</h3>
                                    <p>{pack.total} cards</p>
                                </a>

                                <div class="pack__cards">
                                    {#each pack.cards as card (card.id)}
                                        <div class="pack__card">
                                            <CardImage
                                                card={card}
                                                loading="lazy"
                                            />
                                            {#if card.quantity > 1}
                                                <span class="pack__quantity"
                                                    >&times;{card.quantity}</span
                                                >
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
    </Container>

    <Printer decklist={data.decklist} cards={data.cards} />
{/if}

<style>
    /* Temporary styles */
    .group {
        display: grid;
        gap: 1rem;
    }

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
