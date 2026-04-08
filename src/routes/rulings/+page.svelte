<script lang="ts">
    import type { Ruling } from "$lib/types";
    import Header from "$lib/components/Header.svelte";
    // import { localizeHref } from "$lib/paraglide/runtime";
    import Container from "$lib/components/Container.svelte";
    import RulingItem from "$lib/components/Ruling.svelte";
    import Ghost from "$lib/components/Ghost.svelte";

    let { data }: { data: { rulings: Ruling[] } } = $props();
</script>

<Header title="Rulings" />

<Container>
    {#await data.rulings}
        {#each Array(5) as _}
            <Ghost />
        {/each}
    {:then rulings}
        <ul>
            {#each rulings as ruling (ruling.id)}
                ruling.id: {ruling.id}
                <RulingItem data={ruling} />
                <!-- <li>
                    <a href={localizeHref(`/rulings/${ruling.id}`)}>
                        {ruling.attributes.question}
                    </a>
                </li> -->
            {/each}
        </ul>
    {:catch error}
        <p>error loading rulings: {error.message}</p>
    {/await}
</Container>

<style>
    /* Temporary styles */
    ul {
        display: grid;
        gap: 1rem;
    }
</style>
