<script lang="ts">
    import { localizeHref } from "$lib/paraglide/runtime";
    import type { Card, Printing } from "$lib/types";
    import { getHighResImage } from "$lib/utils";

    interface Props {
        card: Card | Printing;
        type: "card" | Printing["type"];
        href?: string | null;
        loading?: "lazy" | "eager";
        class?: string;
        boxShadow?: boolean;
        hasTransition?: boolean;
        responsive?: boolean;
    }

    const {
        card,
        type = card?.type ?? "card",
        // TODO: review/implement proper href routing for printings, currently does nothing (maybe use an achor of #printings instead?)
        href = `/card/${card && "type" in card && card.type === "printings" ? `${card.attributes.card_id}?printing=${card.id}` : card.id}`,
        loading = "lazy",
        class: className = "",
        boxShadow = true,
        hasTransition = false,
        responsive = false,
    }: Props = $props();

    const get_title = (value: Props["card"]): string => {
        return value.attributes.title ?? "Card image";
    };

    const get_printing_ids = (value: Props["card"]): string[] => {
        return value.attributes.printing_ids ?? [];
    };

    const get_printing_card_id = (value: Props["card"]): string => {
        return "card_id" in value.attributes
            ? value.attributes.card_id
            : value.id;
    };

    const is_printing = (value: Props["card"]): value is Printing => {
        return "type" in value && value.type === "printings";
    };
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
                alt={get_title(card)}
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
            alt={get_title(card)}
            {loading}
            style:view-transition-name={hasTransition ? `card-${card.id}` : ""}
        />
    {/if}
{/snippet}

{#if get_printing_ids(card).length > 0 || is_printing(card)}
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
