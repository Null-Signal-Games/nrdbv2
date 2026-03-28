<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Container from "$lib/components/Container.svelte";
    import { m } from "$lib/paraglide/messages.js";
    import { localizeHref } from "$lib/paraglide/runtime.js";

    import type { Decklist } from "$lib/types";

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

    <p>{JSON.stringify(data.decks)}</p>
</Container>
