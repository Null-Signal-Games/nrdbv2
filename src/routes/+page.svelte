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
        <section class="home__main" data-id="deck-of-the-week">
            {#await data.decklist_of_the_week}
                <Ghost aspect="3/2" />
            {:then deck_of_the_week_data}
                <h2 class="home__heading">Deck of the Week</h2>
                <DecklistSummary
                    identity={deck_of_the_week_data.identity}
                    decklist={deck_of_the_week_data.decklist}
                />
                <DecklistBreakdown
                    decklist={deck_of_the_week_data.decklist}
                    cards={deck_of_the_week_data.cards}
                />
            {:catch error}
                <p class="home__error">
                    Error loading deck of the week: {error.message}
                </p>
            {/await}
        </section>
        <section class="home__sidebar" data-id="latest-decks">
            <h2 class="home__heading">Latest decks</h2>
            {#await data.decklists}
                <ul class="home__decks">
                    {#each Array(5) as _}
                        <li><Ghost aspect="6/1" /></li>
                    {/each}
                </ul>
            {:then decklists}
                <ul class="home__decks">
                    {#each decklists as decklist (decklist.id)}
                        <li>
                            <DecklistPreview {decklist} />
                        </li>
                    {/each}
                </ul>
            {:catch error}
                <p class="home__error">
                    Error loading decklists: {error.message}
                </p>
            {/await}
        </section>
    </div>
</Container>

<style>
    .home {
        display: grid;
        grid-template-columns: 3fr 1fr;
        gap: 2rem;
        margin-top: 2rem;
    }

    .home__heading {
        margin-bottom: 1rem;
    }

    .home__decks {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .home__error {
        color: var(--jinteki);
    }

    @media (max-width: 768px) {
        .home {
            grid-template-columns: 1fr;
        }
    }
</style>
