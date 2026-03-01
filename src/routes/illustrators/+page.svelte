<script lang="ts">
    import type { ApiResponse, Illustrator, Printing } from "$lib/types";
    import Header from "$lib/components/Header.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";
    import CardImage from "$lib/components/card/CardImage.svelte";

    let {
        data,
    }: {
        data: { illustrators: Illustrator[]; cards: ApiResponse<Printing>[] };
    } = $props();

    console.log(data.cards);
</script>

{#if data.illustrators}
    <Header title="Illustrators" />

    <div class="grid">
        {#each data.illustrators as illustrator, index (illustrator.id)}
            <a href={localizeHref(`/illustrators/${illustrator.id}`)}>
                {#if false}
                    <div class="cards">
                        {#each data.cards[index].data as card (card.id)}
                            <!-- TODO: fix type error (Printing is not assignable to type `card`) -->
                            <CardImage {card} href={false} />
                        {/each}
                    </div>
                {/if}
                <p>
                    {illustrator.attributes.name} ({illustrator.attributes
                        .num_printings} cards)
                </p>
            </a>
        {/each}
    </div>
{/if}

<style>
    /* Temporary styles */
    .grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(3, 1fr);
        list-style: none;
    }

    .grid a {
        padding: 1rem;
        border: 1px solid var(--border);
        background: var(--foreground);
    }

    .cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
    }
</style>
