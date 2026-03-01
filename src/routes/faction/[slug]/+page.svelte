<script lang="ts">
    import { page } from "$app/state";
    import CardImage from "$lib/components/card/CardImage.svelte";
    import Header from "$lib/components/Header.svelte";
    import type { Decklist, Faction, Card } from "$lib/types";
    import { factions, cards } from "$lib/store";
    import Icon from "$lib/components/Icon.svelte";
    import DecklistItem from "$lib/components/decklist/Item.svelte";
    import { tooltip } from "$lib/actions";
    import { find_or_server, filter_or_server } from "$lib/utils";
    import Ghost from "$lib/components/Ghost.svelte";

    interface Props {
        data: {
            faction: Faction | null;
            faction_cards: Card[] | null;
            // identities: Card[];
            decklists: {
                identity: Card;
                decklists: Decklist[];
            }[];
        };
    }

    let { data }: Props = $props();

    let faction_data = $derived<Faction | undefined>(
        find_or_server(
            $factions,
            (f) => f.id === page.params.slug,
            data.faction,
            `faction:${page.params.slug}`,
        ),
    );

    let cards_data = $derived<Card[]>(
        filter_or_server(
            $cards,
            (card) => card.attributes.faction_id === page.params.slug,
            data.faction_cards,
            `faction-cards:${page.params.slug}`,
        ),
    );
</script>

{#if faction_data && cards_data}
    <Icon name={faction_data.id} />
    <Header title={`Faction: ${faction_data.attributes.name}`} />

    <!-- Streamed in decklists for the current faction (per identity) -->
    {#await data.decklists}
        {#each Array(5) as _}
            <Ghost />
        {/each}
    {:then decklists}
        <div class="group">
            {#each decklists as group (group.identity)}
                <article>
                    <header>
                        <h2>{group.identity.attributes.title}</h2>
                        <!-- TODO(i18n): use/create a locale -->
                        <!-- TODO(auth): Add user auth logic, although this will likely be handled on the given route, depending if the user is already authenticated -->
                        <!-- svelte-ignore a11y_invalid_attribute -->
                        <a href="#">Create deck with this identity</a>

                        <!-- TODO(i18n): use/create a locale -->
                        <!-- TODO(misc): add correct href url to search/find page with URL paramters to filter to this specific identity -->
                        <!-- svelte-ignore a11y_invalid_attribute -->
                        <a href="#">More decks</a>
                    </header>
                    <main>
                        <div use:tooltip={group.identity}>
                            <CardImage card={group.identity} />
                        </div>
                        <ul>
                            {#each group.decklists as decklist (decklist.id)}
                                <DecklistItem {decklist} />
                            {/each}
                        </ul>
                    </main>
                </article>
            {/each}
        </div>
    {:catch error}
        <p>error loading decklists: {error.message}</p>
    {/await}

    <!-- All cards from the current faction (IndexedDB data) -->
    <h2>Cards from {faction_data.attributes.name}</h2>
    <ul>
        {#each cards_data as card (card.id)}
            <li>
                <CardImage {card} />
            </li>
        {/each}
    </ul>
{/if}

<pre>{JSON.stringify(data, null, 2)}</pre>

<style>
    /* Temporary styles */
    ul {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
    }

    article main {
        display: grid;
        grid-template-columns: 1fr 3fr;
        gap: 1rem;
    }

    article main ul {
        grid-template-columns: 1fr;
    }
</style>
