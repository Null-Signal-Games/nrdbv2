<!-- <script lang="ts">
    import type { Decklist } from "$lib/types";
    import CardImage from "$lib/components/card/CardImage.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";
    import { sql } from "$lib/sqlite";

    interface Props {
        decklist: Decklist;
    }

    const { decklist }: Props = $props();

    const identityCard = $derived(
        sql`SELECT * FROM unified_cards WHERE id = ${decklist.attributes.identity_card_id} LIMIT 1`[0],
    );
</script>

<a href={localizeHref(`/decklist/${decklist.id}`)} data-sveltekit-preload-data>
    <div class="decklist-preview">
        {#if identityCard}
            <div class="decklist-preview-identity-card">
                <CardImage card={identityCard} boxShadow={false} href={null} />
            </div>
        {/if}
        <div class="decklist-preview-info">
            <p>
                {decklist.attributes.name}
            </p>
            <p>
                {decklist.attributes.user_id}
            </p>
        </div>
    </div>
</a>

<style>
    .decklist-preview {
        display: flex;
        gap: 1rem;
        padding: 1rem;
    }

    .decklist-preview-identity-card {
        max-width: 100px;
    }
</style> -->
