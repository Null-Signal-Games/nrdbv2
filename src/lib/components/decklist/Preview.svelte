<script lang="ts">
    import type { Decklist, Card as TCard } from "$lib/types";
    import Icon from "$lib/components/Icon.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";

    interface Props {
        decklist: Decklist;
    }

    let { decklist }: Props = $props();
</script>

<a
    class="preview-card"
    href={localizeHref(`/decklist/${decklist.id}`)}
    data-sveltekit-preload-data
>
    <span class="preview-card__faction">
        <Icon
            name={decklist.attributes.faction_id}
            size="md"
            theme={decklist.attributes.faction_id}
        />
    </span>

    <div class="preview-card__content">
        <p class="preview-card__title">{decklist.attributes.name}</p>
        <p class="preview-card__meta">
            {decklist.attributes.user_id}
            <!-- {#if decklist.attributes?.user_rating}
                ({decklist.attributes.user_rating})
            {/if} -->
        </p>
    </div>
</a>

<style>
    .preview-card {
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 16px;
        background: var(--foreground);
        border: 1px solid var(--border);
        border-radius: 0.25rem;
        text-decoration: none;
    }

    .preview-card__faction {
        min-width: 32px;
        min-height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .preview-card__content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    }

    .preview-card__title {
        font-family:
            Inter,
            system-ui,
            -apple-system,
            "Segoe UI",
            Roboto,
            "Helvetica Neue",
            Arial;
        font-weight: 600;
        font-size: 16px;
        line-height: 1;
        margin: 0;
        color: var(--text, #fff);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .preview-card__meta {
        margin: 0;
    }

    .preview-card__author {
        color: #878787;
        font-size: 14px;
        text-decoration: none;
    }
</style>
