<script lang="ts">
    import type { PageData } from "./$types";
    import Header from "$lib/components/Header.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";
    import Container from "$lib/components/Container.svelte";
    import CardImage from "$lib/components/card/CardImage.svelte";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
</script>

<Header title="Illustrators" />

<Container>
    <div class="illustrators">
        {#each data.illustrators as illustrator (illustrator.id)}
            {@const illustratorPrintings =
                data.illustrator_printings?.[illustrator.id] ?? []}

            <article class="illustrator-card">
                <a
                    class="illustrator-card__heading"
                    href={localizeHref(`/illustrators/${illustrator.id}`)}
                >
                    <h2>{illustrator.attributes.name}</h2>
                    <p>{illustrator.attributes.num_printings} cards</p>
                </a>

                <div class="illustrator-card__printings">
                    {#each illustratorPrintings.slice(0, 3) as printing, index (printing.id)}
                        <div>
                            <CardImage card={printing} loading="lazy" />
                        </div>
                    {/each}
                </div>
            </article>
        {/each}
    </div>
</Container>

<style>
    .illustrators {
        display: grid;
        gap: 1.25rem;
        grid-template-columns: repeat(3, 1fr);
    }

    .illustrator-card {
        display: grid;
        gap: 1rem;
        padding: 1rem;
        border: 1px solid var(--border);
        background: var(--foreground);
        border-radius: 0.75rem;
    }

    .illustrator-card__heading {
        display: grid;
        gap: 0.25rem;
        color: inherit;
        text-decoration: none;
    }

    .illustrator-card__heading h2,
    .illustrator-card__heading p {
        margin: 0;
    }

    .illustrator-card__heading p {
        opacity: 0.75;
    }

    .illustrator-card__printings {
        display: grid;
        gap: 0.5rem;
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
</style>
