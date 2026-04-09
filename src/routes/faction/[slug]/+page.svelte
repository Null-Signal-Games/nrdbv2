<script lang="ts">
    import type { PageData } from "./$types";
    import Header from "$lib/components/Header.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";
    import Icon from "$lib/components/Icon.svelte";
    import Container from "$lib/components/Container.svelte";
    import Ghost from "$lib/components/Ghost.svelte";
    import CardImage from "$lib/components/card/CardImage.svelte";
    import DecklistItem from "$lib/components/decklist/Item.svelte";
    import { tooltip } from "$lib/actions";
    import Button from "$lib/components/ui/Button.svelte";
    import type { Card, Decklist } from "$lib/types";

    interface Props {
        data: PageData & {
            decklists: Promise<
                {
                    identity: Card["id"];
                    decklists: Decklist[];
                }[]
            >;
        };
    }

    let { data }: Props = $props();
</script>

<!-- `Property 'name' does not exist on type 'Faction'.` - disregard for now, sqlite data does not match API structure yet -->
<Header title={`Faction: ${data.faction.attributes.name}`}>
    {#snippet icon()}
        <Icon name={data.faction.id} size="xl" />
    {/snippet}

    <Button
        href={localizeHref(
            `/decklist/create?side=${data.faction.attributes.side_id}&faction=${data.faction.id}`,
        )}
        class="button"
    >
        <!-- TODO(i18n): use/create a locale -->
        Create decklist with this faction
    </Button>
</Header>

<Container>
    <!-- Streamed in decklists for the current faction (per identity).
         Render identities immediately from sqlite; await decklists per-identity so
         only the decks area shows placeholders while the streamed promise resolves. -->
    <div class="group">
        {#each data.identities as identity (identity.id)}
            <article>
                <header>
                    <h2>{identity.attributes.title}</h2>
                    <!-- TODO(i18n): use/create a locale -->
                    <!-- TODO(auth): Add user auth logic, although this will likely be handled on the given route, depending if the user is already authenticated -->
                    <!-- svelte-ignore a11y_invalid_attribute -->
                    <Button href={`/decklist/create?identity=${identity.id}`}
                        >Create deck with this identity</Button
                    >

                    <!-- TODO(i18n): use/create a locale -->
                    <!-- TODO(misc): add correct href url to search/find page with URL paramters to filter to this specific identity -->
                    <!-- svelte-ignore a11y_invalid_attribute -->
                    <Button href="#">More decks</Button>
                </header>
                <main>
                    <div use:tooltip={identity}>
                        <!-- Broken while sqlite data does not match API structure -->
                        <CardImage card={identity} />
                    </div>
                    <ul>
                        <!-- <pre>{JSON.stringify(data.decklists, null, 2)}</pre> -->
                        <!-- {data.decklists.find((g) => g.identity === identity.id)?.decklists.length ?? 0} decklists -->

                        <!-- {@const decklists = data.decklists.find((g) => g.identity === identity.id)?.decklists ?? []} -->
                        {#await data.decklists}
                            {#each Array(3) as _}
                                <li><Ghost /></li>
                            {/each}
                        {:then grouped_decklists}
                            {#each grouped_decklists.find((g) => g.identity === identity.id)?.decklists ?? [] as decklist}
                                <DecklistItem decklist={decklist as Decklist} />
                                <details>
                                    <summary>JSON</summary>
                                    <p>{JSON.stringify(decklist, null, 2)}</p>
                                </details>
                            {/each}
                        {:catch error}
                            <li>
                                error loading decklists: {error.message}
                            </li>
                        {/await}
                    </ul>
                </main>
            </article>
        {/each}
    </div>

    <h2>Cards from {data.faction.attributes.name}</h2>
    <ul>
        {#each data.cards as card (card.id)}
            <li>
                <!-- Broken while sqlite data does not match API structure -->
                <CardImage {card} />
                <summary>
                    <details>
                        <pre>{JSON.stringify(card.attributes, null, 2)}</pre>
                    </details>
                </summary>
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
