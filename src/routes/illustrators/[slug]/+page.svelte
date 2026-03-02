<script lang="ts">
    import type { Illustrator, Printing } from "$lib/types";
    import Header from "$lib/components/Header.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";
    import Container from "$lib/components/Container.svelte";
    import CardImage from "$lib/components/card/CardImage.svelte";
    import CardMeta from "$lib/components/card/Meta.svelte";

    let {
        data,
    }: {
        data: {
            illustrator: Illustrator;
            printings: Printing[];
        };
    } = $props();
</script>

{#if data.illustrator}
    <Header title={`Illustrator: ${data.illustrator.attributes.name}`} />

    <Container>
        <ul>
            {#each data.printings as printing (printing.id)}
                <li>
                    <!-- /**
                    * `getHighResImage` does not account for this, and `CardImage` expects a `Card` type.
                    * Need to adjust/expand the types and utility functions to handle this properly.
                    */ -->
                    <CardMeta card={printing}>
                        <CardImage card={printing} />
                    </CardMeta>
                </li>
            {/each}
        </ul>
    </Container>
{/if}

<style>
    /* Temporary styles */
    ul {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 1rem;
    }
</style>
