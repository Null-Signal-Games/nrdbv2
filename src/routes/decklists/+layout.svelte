<script lang="ts">
    import Container from "$lib/components/Container.svelte";
    import Header from "$lib/components/Header.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";

    let { children } = $props();

    const categories = [
        {
            path: "search",
            title: "Search",
        },
        {
            path: "recent",
            title: "Recent",
        },
        {
            path: "of-the-week",
            title: "Decklists of the Week",
        },
        {
            path: "tournament",
            title: "Tournament",
        },
        {
            path: "hot-topics",
            title: "Hot Topics",
        },
        {
            path: "hall-of-fame",
            title: "Decklist Hall of fame",
        },
        {
            path: "mine",
            title: "My Decklists",
        },
        {
            path: "favorites",
            title: "My Favorites",
        },
    ];
</script>

<Header title="Decklists" />

<Container class="wrapper">
    <aside>
        {#each categories as category (category.path)}
            <a href={localizeHref(`/decklists/${category.path}`)}>
                <h3>{category.title}</h3>
            </a>
        {/each}
    </aside>

    <main>
        {@render children?.()}
    </main>
</Container>

<style>
    /* Temporary styles */
    .wrapper {
        display: grid;
        gap: 2rem;
        grid-template-columns: 1fr 3fr;
    }
</style>
