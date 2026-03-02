<script lang="ts">
    import type {
        SidesIds,
        FactionIds,
        Faction,
        Card as TCard,
    } from "$lib/types";
    import { cards, factions } from "$lib/store";
    import { find_or_server, filter_or_server } from "$lib/utils";
    import { card_types } from "$lib/i18n";
    import { CARD_TYPES } from "$lib/constants";

    interface Props {
        side: SidesIds;
        faction: FactionIds;
        identity: TCard["id"];
    }

    let { side, faction, identity }: Props = $props();

    let factions_list = $derived<Faction[]>(
        filter_or_server(
            $factions,
            (f: Faction) => f.attributes.side_id === side,
            null,
            `faction:${faction}`,
        ),
    );

    // let filtered_cards = $derived<TCard[]>();
</script>

<div class="builder">
    <h2>Decklist builder</h2>

    <input type="text" placeholder="Search cards" />

    <div style="border: 1px solid red; padding: 1rem">
        <h3>Factions</h3>
        <ul>
            {#each factions_list as faction (faction.id)}
                <button onclick={() => console.log(faction.id)}
                    >{faction.attributes.name}</button
                >
            {/each}
        </ul>
    </div>

    <div style="border: 1px solid red; padding: 1rem">
        <h3>Card Types</h3>
        <ul>
            {#each CARD_TYPES as type (type)}
                <button onclick={() => console.log(type)}>{type}</button>
            {/each}
        </ul>
    </div>

    <!-- <p>
        Faction: {faction.attributes.name}, Identity: {identity.attributes
            .title}
    </p> -->

    <!-- <ul>
        {#each filtered_cards as card (card.id)}
            <li>{card.attributes.title}</li>
        {/each}
    </ul> -->

    <!-- <pre>{JSON.stringify(filtered_cards, null, 2)}</pre> -->
</div>
