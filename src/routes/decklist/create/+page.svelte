<script lang="ts">
    import Container from "$lib/components/Container.svelte";
    import Header from "$lib/components/Header.svelte";
    import type { SidesIds, Faction, FactionIds, Card } from "$lib/types";
    import { factions, cards } from "$lib/store";
    import { store_or_server, filter_or_server } from "$lib/utils";
    import { onMount } from "svelte";
    import DecklistBuilder from "$lib/components/decklist/Builder.svelte";
    import Icon from "$lib/components/Icon.svelte";

    interface Props {
        data: {
            factions: Faction[] | null;
            faction_cards: Card[] | null;
        };
    }

    let { data }: Props = $props();

    let selected_side = $state<SidesIds | null>(null);
    let selected_faction = $state<FactionIds | null>(null);
    let selected_identity = $state<Card["id"] | null>(null);

    const is_side_id = (value: string): value is SidesIds =>
        value === "corp" || value === "runner";

    const is_faction_id = (value: string): value is FactionIds =>
        factions_list.some((faction: Faction) => faction.id === value);

    let factions_list = $derived<Faction[]>(
        store_or_server($factions, data.factions, "factions"),
    );
    let selected_side_factions = $derived<Faction[]>(
        factions_list.filter(
            (faction: Faction) => faction.attributes.side_id === selected_side,
        ),
    );

    let identities_list = $derived<Card[]>(
        filter_or_server(
            $cards,
            (card) => card.attributes.faction_id === selected_faction,
            data.faction_cards,
            `faction-cards:${selected_faction}`,
        ),
    );

    let all_cards_list = $derived<Card[]>(
        store_or_server($cards, data.faction_cards, "cards"),
    );

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
        <div class="decklist-create-options">
            <button onclick={() => select_side("corp")}>Corp</button>
            <button onclick={() => select_side("runner")}>Runner</button>
        </div>
    {:else if selected_side && !selected_faction}
        <button onclick={back_to_side}>back</button>
        <ul>
            {#each selected_side_factions as faction (faction.id)}
                <li>
                    <button
                        onclick={() => select_faction(faction.id as FactionIds)}
                    >
                        {faction.attributes.name}
                    </button>
                </li>
            {/each}
        </ul>
    {:else if selected_side && selected_faction && !selected_identity}
        <button onclick={back_to_faction}>back</button>
        <ul>
            {#each identities_list as identity (identity.id)}
                <li>
                    <button onclick={() => select_identity(identity.id)}>
                        {identity.attributes.title}
                    </button>
                </li>
            {/each}
        </ul>
    {:else}
        <button onclick={back_to_identity}>back</button>
        <DecklistBuilder
            side={selected_side as SidesIds}
            faction={selected_faction as FactionIds}
            identity={selected_identity as Card["id"]}
        />
    {/if}
</Container>
