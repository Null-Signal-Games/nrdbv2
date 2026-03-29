<script lang="ts">
    import type { PageData } from "./$types";
    // import { page } from "$app/state";
    import Header from "$lib/components/Header.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";
    import Icon from "$lib/components/Icon.svelte";
    import Container from "$lib/components/Container.svelte";
    import Ghost from "$lib/components/Ghost.svelte";
    import CardImage from "$lib/components/card/CardImage.svelte";
    import DecklistItem from "$lib/components/decklist/Item.svelte";
    import type { Card } from "$lib/types";

    let { data }: { data: PageData } = $props();

    const get_identity = (id: string): Card => {
        return data.identities.find((i) => i.id === id);
    };
</script>

<!-- `Property 'name' does not exist on type 'Faction'.` - disregard for now, sqlite data does not match API structure yet -->
<Header title={`Faction: ${data.faction.name}`}>
    {#snippet icon()}
        <Icon name={data.faction.id} size="xl" />
    {/snippet}

    <a
        href={localizeHref(
            `/decklist/create?side=${data.faction.side_id}&faction=${data.faction.id}`,
        )}
        class="button"
    >
        <!-- TODO(i18n): use/create a locale -->
        Create decklist with this faction
    </a>
</Header>

<Container>
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
                        <h2>{get_identity(group.identity).title}</h2>
                        <!-- TODO(i18n): use/create a locale -->
                        <!-- TODO(auth): Add user auth logic, although this will likely be handled on the given route, depending if the user is already authenticated -->
                        <!-- svelte-ignore a11y_invalid_attribute -->
                        <a href={`/decklist/create?identity=${group.identity}`}
                            >Create deck with this identity</a
                        >

                        <!-- TODO(i18n): use/create a locale -->
                        <!-- TODO(misc): add correct href url to search/find page with URL paramters to filter to this specific identity -->
                        <!-- svelte-ignore a11y_invalid_attribute -->
                        <a href="#">More decks</a>
                    </header>
                    <main>
                        <div use:tooltip={get_identity(group.identity)}>
                            <!-- Broken while sqlite data does not match API structure -->
                            <CardImage card={get_identity(group.identity)} />
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

    <h2>Cards from {data.faction.name}</h2>
    <ul>
        {#each data.cards as card (card.id)}
            <li>
                <!-- Broken while sqlite data does not match API structure -->
                <CardImage {card} />
            </li>
        {/each}
    </ul>
</Container>

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
