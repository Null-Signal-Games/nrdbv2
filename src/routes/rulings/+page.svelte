<script lang="ts">
    import type { Ruling } from "$lib/types";
    import Header from "$lib/components/Header.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";
    import Container from "$lib/components/Container.svelte";
    import RulingItem from "$lib/components/Ruling.svelte";

    let { data }: { data: { rulings: Ruling[] } } = $props();
</script>

{#if data.rulings}
    <Header title="Rulings" />

    <Container>
        <ul>
            {#each data.rulings as ruling (ruling.id)}
                <RulingItem data={ruling} />
                <!-- <li>
                    <a href={localizeHref(`/rulings/${ruling.id}`)}>
                        {ruling.attributes.question}
                    </a>
                </li> -->
            {/each}
        </ul>
    </Container>
{/if}

<style>
    /* Temporary styles */
    ul {
        display: grid;
        gap: 1rem;
    }
</style>
