<script lang="ts">
    import Container from "$lib/components/Container.svelte";
    import Header from "$lib/components/Header.svelte";
    import type { SidesIds, Faction, FactionIds, Card } from "$lib/types";
    import { onMount } from "svelte";
    import DecklistBuilder from "$lib/components/decklist/Builder.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import { db_ready } from "$lib/store";
    import { sql } from "$lib/sqlite";
    import { normalize_sqlite } from "$lib/utils";
    import CardImage from "$lib/components/card/CardImage.svelte";
    import Meta from "$lib/components/card/Meta.svelte";

    const empty_relationships = {
        side: { links: { related: "" } },
        cards: { links: { related: "" } },
        decklists: { links: { related: "" } },
        printings: { links: { related: "" } },
    };

    type FactionRow = { id: string } & Faction["attributes"];
    type CardRow = { id: string } & Card["attributes"];

    type NormalizedFactionRow = {
        id: string;
        type?: string;
        attributes: Faction["attributes"];
    };

    type NormalizedCardRow = {
        id: string;
        type?: string;
        attributes: Card["attributes"];
    };

    const to_card = (card: NormalizedCardRow): Card => ({
        id: card.id,
        attributes: card.attributes,
        relationships: empty_relationships,
        links: { self: "" },
    });

    const to_faction = (faction: NormalizedFactionRow): Faction => ({
        id: faction.id,
        type: "factions",
        attributes: faction.attributes,
        relationships: empty_relationships,
        links: { self: "" },
    });

    let selected_side = $state<SidesIds | null>(null);
    let selected_faction = $state<FactionIds | null>(null);
    let selected_identity = $state<Card["id"] | null>(null);
    let loading = $state(true);
    let factions_list = $state<Faction[]>([]);
    let all_cards_list = $state<Card[]>([]);

    const is_side_id = (value: string): value is SidesIds =>
        value === "corp" || value === "runner";

    const is_faction_id = (value: string): value is FactionIds =>
        factions_list.some((faction: Faction) => faction.id === value);

    let selected_side_factions = $derived<Faction[]>(
        factions_list.filter(
            (faction: Faction) => faction.attributes.side_id === selected_side,
        ),
    );

    let identities_list = $derived<Card[]>(
        all_cards_list.filter(
            (card: Card) =>
                card.attributes.faction_id === selected_faction &&
                card.attributes.card_type_id === `${selected_side}_identity`,
        ),
    );

    $effect(() => {
        if (!$db_ready) {
            loading = true;
            return;
        }

        let cancelled = false;

        loading = true;

        (async () => {
            try {
                const [factions, cards] = await Promise.all([
                    sql`SELECT * FROM factions`,
                    sql`SELECT * FROM unified_cards`,
                ]);

                if (cancelled) {
                    return;
                }

                factions_list = normalize_sqlite(factions as FactionRow[]).map(
                    to_faction,
                );
                all_cards_list = normalize_sqlite(cards as CardRow[]).map(
                    to_card,
                );
            } catch (error) {
                if (!cancelled) {
                    console.error(
                        "[SQLITE] Failed to load decklist create data:",
                        error,
                    );
                    factions_list = [];
                    all_cards_list = [];
                }
            } finally {
                if (!cancelled) {
                    loading = false;
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    });

    $effect(() => {
        if (!selected_identity) return;

        const identity = all_cards_list.find(
            (card: Card) => card.id === selected_identity,
        );

        if (!identity) return;

        const side_id = identity.attributes.side_id;
        const faction_id = identity.attributes.faction_id;

        if (is_side_id(side_id)) selected_side = side_id;
        if (is_faction_id(faction_id)) selected_faction = faction_id;
    });

    const select_side = (side: SidesIds) => {
        selected_side = side;
        selected_faction = null;
        selected_identity = null;
    };

    const select_faction = (faction: FactionIds) => {
        selected_faction = faction;
        selected_identity = null;
    };

    const select_identity = (identity: Card["id"]) => {
        selected_identity = identity;
    };

    const back_to_side = () => {
        selected_side = null;
        selected_faction = null;
        selected_identity = null;
    };

    const back_to_faction = () => {
        selected_faction = null;
        selected_identity = null;
    };

    const back_to_identity = () => {
        selected_identity = null;
    };

    onMount(() => {
        const params = new URLSearchParams(window.location.search);

        const side = params.get("side");
        if (side && is_side_id(side)) selected_side = side;

        const faction = params.get("faction");
        if (faction) {
            selected_faction = faction as FactionIds;
        }

        const identity = params.get("identity");
        if (identity) selected_identity = identity as Card["id"];
    });
</script>

{#if loading}
    <Header title="Choose decklist" subtitle="Loading deck data" />
{:else}
    <Header title="Choose decklist" subtitle="">
        {#snippet icon()}
            {#if selected_faction}
                <Icon name={selected_faction} size="xl" />
            {/if}
        {/snippet}

        <p>
            {#if selected_side}
                <span>{selected_side} - </span>
            {/if}

            {#if selected_faction}
                <span
                    >{factions_list.find((f) => f.id === selected_faction)
                        ?.attributes.name} -
                </span>
            {/if}

            {#if selected_identity}
                <span
                    >{identities_list.find((i) => i.id === selected_identity)
                        ?.attributes.title}</span
                >
            {/if}
        </p>
    </Header>

    <Container>
        {#if !selected_side}
            <div data-step="side" class="decklist-create-options">
                <Button
                    onclick={() => select_side("corp")}
                    data-id="create-corp">Corp</Button
                >
                <Button
                    onclick={() => select_side("runner")}
                    data-id="create-runner">Runner</Button
                >
            </div>
        {:else if selected_side && !selected_faction}
            <div data-step="faction" class="decklist-create-options">
                <Button onclick={back_to_side}>back</Button>
                <ul>
                    {#each selected_side_factions as faction (faction.id)}
                        <li>
                            <Button
                                onclick={() =>
                                    select_faction(faction.id as FactionIds)}
                                data-id={`select-faction-${faction.id}`}
                            >
                                {faction.attributes.name}
                            </Button>
                        </li>
                    {/each}
                </ul>
            </div>
        {:else if selected_side && selected_faction && !selected_identity}
            <div data-step="identity" class="decklist-create-options">
                <Button onclick={back_to_faction}>back</Button>
                <ul
                    style="display: grid; gap: 1rem; grid-template-columns: repeat(5, 1fr);"
                >
                    {#each identities_list as identity (identity.id)}
                        <li>
                            <Meta card={identity}>
                                <Button
                                    onclick={() => select_identity(identity.id)}
                                >
                                    <CardImage card={identity} href={null} />
                                    {identity.attributes.title}
                                </Button>
                            </Meta>
                        </li>
                    {/each}
                </ul>
            </div>
        {:else}
            <div data-step="builder" class="decklist-create-options">
                <Button onclick={back_to_identity}>back</Button>
                <DecklistBuilder
                    side={selected_side as SidesIds}
                    faction={selected_faction as FactionIds}
                    identity={selected_identity as Card["id"]}
                    factions={factions_list}
                    cards={all_cards_list}
                />
            </div>
        {/if}
    </Container>
{/if}
