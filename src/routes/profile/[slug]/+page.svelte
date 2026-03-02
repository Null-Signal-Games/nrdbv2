<script lang="ts">
    import Container from "$lib/components/Container.svelte";
    import DecklistPreview from "$lib/components/decklist/Preview.svelte";
    import Header from "$lib/components/Header.svelte";
    import type { ApiResponse, Decklist } from "$lib/types";

    interface Props {
        data: {
            user: ApiResponse<unknown>;
            decks: Decklist[];
        };
    }

    let { data }: Props = $props();
</script>

<Header title={data?.user?.name ?? "Unknown user"} />

<Container>
    {#each data.decks as deck}
        <DecklistPreview decklist={deck} />
    {/each}
</Container>
