<script lang="ts">
    import { localizeHref } from "$lib/paraglide/runtime";
    import type { Card, Printing, SQLite } from "$lib/types";
    import { getHighResImage } from "$lib/utils";

    interface Props {
        card: SQLite<Card | Printing, "attributes">;
        href?: string | null;
        loading?: "lazy" | "eager";
        class?: string;
        boxShadow?: boolean;
        hasTransition?: boolean;
        responsive?: boolean;
    }

    const {
        card,
        // TODO: review/implement proper href routing for printings, currently does nothing (maybe use an achor of #printings instead?)
        href = `/card/${card && "type" in card && card.type === "printings" ? `${card.card_id}?printing=${card.id}` : card.id}`,
        loading = "lazy",
        class: className = "",
        boxShadow = true,
        hasTransition = false,
        responsive = false,
    }: Props = $props();
</script>

{#snippet image(card: Props["card"])}
    {#if responsive}
        <picture>
            <source
                srcset={getHighResImage(card, "small")}
                type="image/jpeg"
                media="(max-width:936px)"
            />
            <source
                srcset={getHighResImage(card, "large")}
                type="image/jpeg"
                media="(min-width:936px)"
            />
            <img
                crossorigin="anonymous"
                class="card {className}"
                class:shadow={boxShadow}
                src={getHighResImage(card)}
                alt={card.title}
                {loading}
                style:view-transition-name={hasTransition
                    ? `card-${card.id}`
                    : ""}
            />
        </picture>
    {:else}
        <img
            crossorigin="anonymous"
            class="card {className}"
            class:shadow={boxShadow}
            src={getHighResImage(card)}
            alt={card.title}
            {loading}
            style:view-transition-name={hasTransition ? `card-${card.id}` : ""}
        />
    {/if}
{/snippet}

{#if card?.printing_ids?.[0]}
    {#if href}
        <a class="card-link" href={localizeHref(href)}>
            {@render image(card)}
        </a>
    {:else}
        {@render image(card)}
    {/if}
{/if}

<style>
    .card-link {
        display: inline-block;
        text-decoration: none;
    }

    img.card {
        display: flex;
        aspect-ratio: 0.718 / 1;
        border-radius: 4.55% / 3.5%;
        width: 100%;
    }

    img.card.shadow {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
</style>
