<script lang="ts">
    import { type Snippet } from "svelte";
    import type { FactionIds, Card as TCard, Printing } from "$lib/types";
    import CardImage from "./CardImage.svelte";
    import { cards } from "$lib/store";
    import { localizeHref } from "$lib/paraglide/runtime";
    import Influence from "../Influence.svelte";

    interface Props {
        children?: Snippet;
        card: TCard | Printing;
        quantity?: number;
        content?: Snippet;
    }

    const { children, card, quantity, content }: Props = $props();
</script>

<div class="meta">
    {@render children?.()}
    <div class="meta__content">
        <h3>
            {#if quantity}&times;{quantity}{/if}
            {card.attributes.title}
        </h3>
        {#if quantity}
            <Influence
                count={quantity}
                total={true}
                theme={card.attributes.faction_id as FactionIds}
            />
        {/if}
        {@render content?.()}
    </div>
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

        & h3 {
            margin: unset;
            font-size: 1.125rem;
        }
    }
</style>
