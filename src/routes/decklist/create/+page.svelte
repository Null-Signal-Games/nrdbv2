<script lang="ts">
    import Container from "$lib/components/Container.svelte";
    import Header from "$lib/components/Header.svelte";
    import type { SidesIds, Faction, FactionIds, Card } from "$lib/types";
    import { factions, cards } from "$lib/store";
    import { store_or_server, filter_or_server } from "$lib/utils";
    import { onMount } from "svelte";
    import DecklistBuilder from "$lib/components/decklist/Builder.svelte";

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

    onMount(() => {
        const params = new URLSearchParams(window.location.search);

        const side = params.get("selected_side");
        if (side === "corp" || side === "runner") {
            selected_side = side as SidesIds;
        }

        const faction = params.get("selected_faction");
        if (faction) selected_faction = faction as FactionIds;

        const identity = params.get("selected_identity");
        if (identity) selected_identity = identity as Card["id"];
    });
</script>

<Header title="Choose decklist" subtitle="" />

<Container>
    <p>selected_side: {selected_side}</p>
    <p>selected_faction: {selected_faction}</p>
    <p>selected_identity: {selected_identity}</p>

    {#if !selected_side}
        <div class="decklist-create-options">
            <button onclick={() => (selected_side = "corp")}>Corp</button>
            <button onclick={() => (selected_side = "runner")}>Runner</button>
        </div>
    {:else if selected_side && !selected_faction}
        <button onclick={() => (selected_side = null)}>back</button>
        <p>Selected side: {selected_side}</p>
        <ul>
            {#each selected_side_factions as faction (faction.id)}
                <li>
                    <button onclick={() => (selected_faction = faction.id)}>
                        {faction.attributes.name}
                    </button>
                </li>
            {/each}
        </ul>
    {:else if selected_side && selected_faction && !selected_identity}
        <button onclick={() => (selected_faction = null)}>back</button>
        <p>
            Selected side: {selected_side}, faction: {selected_faction}
        </p>
        <ul>
            {#each identities_list as identity (identity.id)}
                <li>
                    <button onclick={() => (selected_identity = identity.id)}>
                        {identity.attributes.title}
                    </button>
                </li>
            {/each}
        </ul>
    {:else}
        <button onclick={() => (selected_identity = null)}>back</button>
        <p>
            Selected side: {selected_side}, faction: {selected_faction},
            identity: {selected_identity}
        </p>
        <DecklistBuilder
            side={selected_side as SidesIds}
            faction={selected_faction as FactionIds}
            identity={selected_identity as Card["id"]}
        />
    {/if}
</Container>
