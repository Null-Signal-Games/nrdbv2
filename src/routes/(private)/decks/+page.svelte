<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Container from "$lib/components/Container.svelte";
    import { m } from "$lib/paraglide/messages.js";
    import { localizeHref } from "$lib/paraglide/runtime.js";
    import { page } from "$app/state";
    import type { Decklist } from "$lib/types";
    import Button from "$lib/components/ui/Button.svelte";

    interface Props {
        data: {
            decks: Decklist[];
        };
    }

    let { data }: Props = $props();
</script>

<!-- TODO: i18n values -->
<Header title="Decks" subtitle="Manage your decks" />

<Container>
    <!-- TODO: convert button innerHTML string to full i18n value -->
    <a href={localizeHref(`/decklist/create?side=corp`)}
        >Create new {m.corp()} decklist</a
    >
    <a href={localizeHref(`/decklist/create?side=runner`)}
        >Create new {m.runner()} decklist</a
    >
    <button>Import deck</button>

    {#if page.data.decks.length > 0}
        <ul>
            {#each page.data.decks as deck}
                <li>{deck.name}</li>
            {/each}
        </ul>
    {:else}
        <p>You have no decks yet.</p>
        <Button href={localizeHref(`/decklist/create`)}>Create a deck</Button>
    {/if}

    <p>{JSON.stringify(page)}</p>
</Container>
