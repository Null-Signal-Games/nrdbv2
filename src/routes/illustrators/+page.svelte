<script lang="ts">
    import type { PageData } from "./$types";

    import type { ApiResponse, Illustrator, Printing } from "$lib/types";
    import Header from "$lib/components/Header.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";
    import CardImage from "$lib/components/card/CardImage.svelte";
    import Container from "$lib/components/Container.svelte";
    // import { cards } from "$lib/store";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
</script>

<Header title="Illustrators" />

<Container>
    <div class="grid">
        {#each data.illustrators as illustrator, index (illustrator.id)}
            <a href={localizeHref(`/illustrators/${illustrator.id}`)}>
                <p>
                    {illustrator.name} ({illustrator.num_printings} cards)
                </p>
            </a>
        {/each}
    </div>
</Container>

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
</style>
