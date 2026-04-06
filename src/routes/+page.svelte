<script lang="ts">
    import type { Card, Decklist } from "$lib/types";
    import DecklistSummary from "$lib/components/decklist/Summary.svelte";
    import DecklistBreakdown from "$lib/components/decklist/Breakdown.svelte";
    import Factions from "$lib/components/Factions.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";
    import DecklistPreview from "$lib/components/decklist/Preview.svelte";
    import Container from "$lib/components/Container.svelte";
    import Ghost from "$lib/components/Ghost.svelte";

    interface Props {
        data: {
            decklist_of_the_week: Promise<{
                identity: Card;
                decklist: Decklist;
                cards: Card[];
            }>;
            decklists: Promise<Decklist[]>;
        };
    }

    let { data }: Props = $props();
</script>

<Container>
    <Factions />

    <div class="home">
        <div data-id="deck-of-the-week">
            {#await data.decklist_of_the_week}
                <Ghost aspect="3/2" />
            {:then deck_of_the_week_data}
                <h2>Deck of the Week</h2>
                <DecklistSummary
                    identity={deck_of_the_week_data.identity}
                    decklist={deck_of_the_week_data.decklist}
                />
                <DecklistBreakdown
                    decklist={deck_of_the_week_data.decklist}
                    cards={deck_of_the_week_data.cards}
                />
            {:catch error}
                <p>error loading deck of the week: {error.message}</p>
            {/await}
        </div>
        <div data-id="latest-decks">
            Latest decks
            <ul>
                {#await data.decklists}
                    Loading decklists...
                {:then decklists}
                    {#each decklists as decklist (decklist.id)}
                        <li>
                            <DecklistPreview {decklist} />
                        </li>
                    {/each}
                {:catch error}
                    <p>error loading decklists: {error.message}</p>
                {/await}
            </ul>
        </div>
    </div>
</Container>

<style>
    /* Temporary styles */
    .home {
        display: grid;
        grid-template-columns: 3fr 1fr;
        gap: 1rem;
    }
</style>
