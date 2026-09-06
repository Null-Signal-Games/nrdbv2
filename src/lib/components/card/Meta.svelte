<script lang="ts">
    import { type Snippet } from "svelte";
    import type { Card, Printing } from "$lib/types";
    import CardImage from "./CardImage.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";
    import Influence from "../Influence.svelte";

    interface Props {
        children?: Snippet;
        card: Card | Printing;
        quantity?: number;
        content?: Snippet;
        title?: boolean;
    }

    const { children, card, quantity, content, title }: Props = $props();
</script>

<div class="meta">
    {@render children?.()}

    {#if title || quantity || content}
        <div class="meta__content">
            {#if title}
                <p class="meta__title">
                    {#if quantity}&times;{quantity}{/if}
                    {card.attributes.title}
                </p>
            {/if}
            {#if quantity}
                <Influence
                    count={quantity}
                    total={true}
                    theme={card.attributes.faction_id}
                />
            {/if}
            {@render content?.()}
        </div>
    {/if}
</div>

<style>
    .meta,
    .meta__content {
        display: grid;
    }

    .meta {
        gap: 1rem;
    }

    .meta__content {
        gap: 0.25rem;

        & .meta__title {
            margin: unset;
            font-size: var(--font-size-lg);
            font-weight: var(--font-weight-semibold);
            line-height: var(--leading-tight);
        }
    }
</style>
