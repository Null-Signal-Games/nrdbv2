<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Container from "$lib/components/Container.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";
    import type { Printing } from "$lib/types";
    import type {
        ProcessedFormat,
        ProcessedRestriction,
        BanCardGroup,
    } from "./+page.server";

    interface Props {
        data: { formats: ProcessedFormat[] | null };
    }

    let { data }: Props = $props();

    let formats = $derived(data.formats ?? []);

    function format_date(date_start: string): string {
        return new Date(date_start).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    function card_href(card: Printing): string {
        return localizeHref(`/card/${card.attributes.card_id}`);
    }
</script>

formats.length: {formats.length}

{#if formats.length > 0}
    <Header title="Ban Lists" />

    <Container>
        {#each formats as format (format.id)}
            <section class="format">
                <h2>{format.name}</h2>

                {#each format.restrictions as restriction (restriction.id)}
                    <section class="restriction">
                        <h3>
                            {restriction.name}
                            <span class="date"
                                >{format_date(restriction.date_start)}</span
                            >
                        </h3>

                        {#snippet card_list(cards: Printing[])}
                            <ul class="card-list">
                                {#each cards as card (card.id)}
                                    <li>
                                        <a href={card_href(card)}>
                                            {card.attributes.title}
                                        </a>
                                    </li>
                                {/each}
                            </ul>
                        {/snippet}

                        {#snippet side_section(
                            label: string,
                            group: BanCardGroup,
                            has_points: boolean,
                            has_universal_influence: boolean,
                            banned_subtype: string | null,
                            formatted_banned_subtype: string | null,
                        )}
                            <div class="side">
                                <h4>{label}</h4>

                                {#if group.banned.length > 0}
                                    <div class="verdict-group">
                                        <h5>Banned</h5>
                                        {@render card_list(group.banned)}
                                    </div>
                                {/if}

                                {#if banned_subtype}
                                    <div class="verdict-group">
                                        <h5>
                                            {formatted_banned_subtype} (banned subtype)
                                        </h5>
                                    </div>
                                {/if}

                                {#if group.restricted.length > 0}
                                    <div class="verdict-group">
                                        <h5>Restricted</h5>
                                        {@render card_list(group.restricted)}
                                    </div>
                                {/if}

                                {#if group.global_penalty.length > 0}
                                    <div class="verdict-group">
                                        <h5>Global Penalty</h5>
                                        {@render card_list(
                                            group.global_penalty,
                                        )}
                                    </div>
                                {/if}

                                {#if has_points}
                                    {#if group.threePoints.length > 0}
                                        <div class="verdict-group">
                                            <h5>3 Points</h5>
                                            {@render card_list(
                                                group.threePoints,
                                            )}
                                        </div>
                                    {/if}
                                    {#if group.twoPoints.length > 0}
                                        <div class="verdict-group">
                                            <h5>2 Points</h5>
                                            {@render card_list(group.twoPoints)}
                                        </div>
                                    {/if}
                                    {#if group.onePoint.length > 0}
                                        <div class="verdict-group">
                                            <h5>1 Point</h5>
                                            {@render card_list(group.onePoint)}
                                        </div>
                                    {/if}
                                {/if}

                                {#if has_universal_influence}
                                    {#if group.threeUniversalInfluence.length > 0}
                                        <div class="verdict-group">
                                            <h5>3 Universal Influence</h5>
                                            {@render card_list(
                                                group.threeUniversalInfluence,
                                            )}
                                        </div>
                                    {/if}
                                    {#if group.oneUniversalInfluence.length > 0}
                                        <div class="verdict-group">
                                            <h5>1 Universal Influence</h5>
                                            {@render card_list(
                                                group.oneUniversalInfluence,
                                            )}
                                        </div>
                                    {/if}
                                {/if}
                            </div>
                        {/snippet}

                        <div class="sides">
                            {@render side_section(
                                "Corp",
                                restriction.corp,
                                restriction.has_points,
                                restriction.has_universal_influence,
                                restriction.banned_subtype,
                                restriction.formatted_banned_subtype,
                            )}
                            {@render side_section(
                                "Runner",
                                restriction.runner,
                                restriction.has_points,
                                restriction.has_universal_influence,
                                restriction.banned_subtype,
                                restriction.formatted_banned_subtype,
                            )}
                        </div>
                    </section>
                {/each}
            </section>
        {/each}
    </Container>
{/if}

<style>
    .format {
        margin-bottom: 3rem;
    }

    h2 {
        text-transform: capitalize;
        font-size: 1.75rem;
        margin-bottom: 1rem;
    }

    .restriction {
        border-top: 1px solid var(--color-border, #ccc);
        padding-top: 1rem;
        margin-bottom: 2rem;
    }

    h3 {
        font-size: 1.25rem;
        margin-bottom: 0.75rem;
        display: flex;
        align-items: baseline;
        gap: 0.75rem;
    }

    .date {
        font-size: 0.875rem;
        font-weight: normal;
        opacity: 0.6;
    }

    .sides {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }

    h4 {
        font-size: 1rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .verdict-group {
        margin-bottom: 1rem;
    }

    h5 {
        font-size: 0.875rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
        opacity: 0.75;
    }

    .card-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }

    .card-list a {
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }
</style>
