<script lang="ts">
    import type { PageData } from "./$types";
    import { NRDB_API_URL } from "$lib/constants";
    import Meta from "$lib/components/Meta.svelte";
    import CardMeta from "$lib/components/card/Meta.svelte";
    import CardImage from "$lib/components/card/CardImage.svelte";
    import type { CardTypeIds, CardSubTypeIds, FactionIds } from "$lib/types";
    import Review from "$lib/components/review/Item.svelte";
    import Header from "$lib/components/Header.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { card_types, card_sub_types, factions } from "$lib/i18n";
    import Influence from "$lib/components/Influence.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";
    import { getHighResImage } from "$lib/utils";
    import FormatText from "$lib/components/FormatText.svelte";
    import Container from "$lib/components/Container.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import { next, previous } from "$lib/paraglide/messages";
    import Ghost from "$lib/components/Ghost.svelte";
    import RulingItem from "$lib/components/Ruling.svelte";
    import HeaderImage from "$lib/components/HeaderImage.svelte";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
</script>

<Meta title={data.card.attributes.title}>
    {#if data.card_prev?.id}
        <link
            rel="preload"
            href={getHighResImage(data.card_prev)}
            as="image"
            fetchpriority="high"
        />
    {/if}

    {#if data.card_next?.id}
        <link
            rel="preload"
            href={getHighResImage(data.card_next)}
            as="image"
            fetchpriority="high"
        />
    {/if}
</Meta>

<!-- <pre>{JSON.stringify(data.card, null, 2)}</pre> -->

<Header title={data.card.attributes.title}>
    {#snippet actions()}
        {#if data.card_prev.id}
            <Button href={localizeHref(`/card/${data.card_prev.id}`)}>
                {previous()}
            </Button>
        {/if}

        {#if data.card_next.id}
            <Button href={localizeHref(`/card/${data.card_next.id}`)}>
                {next()}
            </Button>
        {/if}
    {/snippet}

    <!-- <p>
        <a
            href={localizeHref(
                `/sets/${data.card.card_set_ids[0]}`,
            )}>{data.card.card_set_names}</a
        >
    </p> -->
</Header>

<Container>
    <div class="card-details">
        <CardImage card={data.card} hasTransition={true} href={null} />
        <div>
            <table>
                <tbody>
                    <tr>
                        <td>Type</td>
                        <td>
                            <span class="icon-label">
                                <Icon
                                    name={data.card.attributes.card_type_id}
                                    size="sm"
                                />
                                {card_types[
                                    data.card.attributes
                                        .card_type_id as CardTypeIds
                                ]}
                            </span>
                        </td>
                    </tr>
                    {#if data.card.attributes.card_subtype_ids.length > 0}
                        <tr>
                            <td>Subtypes</td>
                            <td>
                                {card_sub_types[
                                    data.card.attributes
                                        .card_subtype_ids as CardSubTypeIds
                                ]}
                            </td>
                        </tr>
                    {/if}
                    <tr>
                        <td>Faction</td>
                        <td>
                            <a
                                href={localizeHref(
                                    `/faction/${data.card.attributes.faction_id}`,
                                )}
                                class="icon-label"
                            >
                                <span
                                    data-faction-theme={data.card.attributes
                                        .faction_id}
                                >
                                    <Icon
                                        name={data.card.attributes.faction_id}
                                        size="sm"
                                    />
                                </span>
                                {factions[
                                    data.card.attributes
                                        .faction_id as FactionIds
                                ]}
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td>Influence</td>
                        <td>
                            <Influence
                                count={data.card.attributes.influence_cost}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Cost</td>
                        <td>
                            <span class="icon-label">
                                <Icon name="credit" size="sm" />
                                {data.card.attributes.cost}
                            </span>
                        </td>
                    </tr>
                    {#if data.card.attributes.trash_cost}
                        <tr>
                            <td>Trash</td>
                            <td>
                                <span class="icon-label">
                                    <Icon name="trash" size="sm" />
                                    {data.card.attributes.trash_cost}
                                </span>
                            </td>
                        </tr>
                    {/if}
                </tbody>
            </table>
            <div>
                <FormatText text={data.card.attributes.text} />
                <br />
                <hr />
                <br />
                {#if data.printings[0].attributes.flavor}
                    <p>Flavor: {data.printings[0].attributes.flavor}</p>
                {/if}
            </div>

            <p>
                <a
                    href={localizeHref(
                        `/illustrators/${data.printings[0].attributes.illustrator_ids[0]}`,
                    )}
                    class="underline"
                >
                    Illustrated by {data.printings[0].attributes
                        .display_illustrators}
                </a>
            </p>

            <p>
                <Button
                    href={localizeHref(
                        `/decklists/search?cards[]=${data.card.id}`,
                    )}
                    class="underline"
                >
                    <Icon name="subroutine" size="sm" />
                    <!-- TODO(i18n) -->
                    Decklists with this card
                </Button>
                <Button
                    href={`${NRDB_API_URL}/cards/${data.card.id}`}
                    target="_blank"
                >
                    <Icon name="subroutine" size="sm" />
                    <!-- TODO(i18n) -->
                    View on NetrunnerDB
                </Button>
            </p>

            {#if data.card.attributes.card_type_id.includes("_identity")}
                <p>
                    <Button
                        href={localizeHref(
                            `/decklist/create?identity=${data.card.id}`,
                        )}
                    >
                        Create deck with this identity
                    </Button>
                </p>
            {/if}
        </div>

        <div>
            <div>
                <p>Cycle</p>
                {#each data.card.attributes.card_cycle_ids as cycle_id, index}
                    <a
                        href={localizeHref(`/cycles/${cycle_id}`)}
                        class="underline"
                    >
                        {data.card.attributes.card_cycle_names[index]}
                    </a>
                {/each}
            </div>
            <hr />
            <div>
                <p>sets</p>
                {#each data.card.attributes.card_set_ids as set_id, index}
                    <a href={localizeHref(`/sets/${set_id}`)} class="underline">
                        {data.card.attributes.card_set_names[index]}
                    </a>
                {/each}
            </div>
            <hr />
            <div>
                <p>legality</p>
            </div>
        </div>
    </div>

    <div style="display: grid; gap: 1rem;">
        <!-- PRINTINGS/ALTERNATIVE-ARTS -->
        {#if data.printings.length > 1}
            <div class="box">
                <!-- TODO(i18n) -->
                <h2>Prints &amp; Alternative Arts</h2>
                <div>
                    <div
                        style="display: grid; grid-template-columns: repeat(5, minmax(auto, 1fr)); gap: 1rem;"
                    >
                        {#each data.printings as printing (printing.id)}
                            <CardMeta card={printing} title={false}>
                                <CardImage card={printing} href={null} />
                                <!-- <pre>{JSON.stringify(printing, null, 2)}</pre> -->
                                {#snippet content()}
                                    Illusrated by <a
                                        href={localizeHref(
                                            `/illustrators/${printing.attributes.illustrator_ids[0]}`,
                                        )}
                                        >{printing.attributes
                                            .display_illustrators}</a
                                    >
                                {/snippet}
                            </CardMeta>
                        {/each}
                    </div>
                </div>
            </div>
        {/if}

        <!-- RULINGS -->
        {#await data.rulings}
            <Ghost />
        {:then rulings}
            <!-- <pre>{JSON.stringify(rulings, null, 2)}</pre> -->
            <div class="box rulings">
                <!-- TODO: i18n value for header -->
                <h2>Rulings</h2>
                {#if rulings.length > 0}
                    <ul>
                        {#each rulings as ruling (ruling.id)}
                            <RulingItem data={ruling} />
                        {/each}
                    </ul>
                {:else}
                    <p>No rulings found for this card.</p>
                {/if}
            </div>
        {:catch error}
            <p>error loading rulings: {error.message}</p>
        {/await}

        <!-- REVIEWS -->
        {#await data.reviews}
            Loading reviews...
        {:then reviews}
            <div class="box reviews">
                <h2>Reviews</h2>
                {#each reviews as review (review.id)}
                    <Review {review} />
                {/each}
            </div>
        {:catch error}
            <p>error loading comments: {error.message}</p>
        {/await}

        <!-- <pre>{JSON.stringify(data.card, null, 2)}</pre>
    
            prev:
            <pre>{JSON.stringify(data.card_prev, null, 2)}</pre>
            next:
            <pre>{JSON.stringify(data.card_next, null, 2)}</pre> -->
    </div>
</Container>

<HeaderImage card={data.card} />

<pre>{JSON.stringify(data.card, null, 2)}</pre>

<style>
    /* Temporary styles */
    .card-details {
        display: grid;
        grid-template-columns: minmax(240px, 1fr) 2fr 1fr;
        gap: 1rem;
    }

    .reviews {
        display: grid;
        gap: 1rem;
    }

    .box {
        padding: 2rem;
        border-radius: 0.5rem;
        background-color: var(--foreground);
    }
</style>
