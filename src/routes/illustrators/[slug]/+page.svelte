<script lang="ts">
    import type { PageData } from "./$types";
    import Header from "$lib/components/Header.svelte";
    import Container from "$lib/components/Container.svelte";
    import CardImage from "$lib/components/card/CardImage.svelte";
    import CardMeta from "$lib/components/card/Meta.svelte";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
</script>

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
                    <!-- TODO: printing uses number based ID rather than string, in V2, this does not work as we use string IDs -->
                    <CardImage card={printing} />
                </CardMeta>
            </li>
        {/each}
    </ul>
</Container>

<style>
    /* Temporary styles */
    ul {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 1rem;
    }
</style>
