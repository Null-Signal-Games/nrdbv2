<script lang="ts">
    import type { Card, Decklist } from "$lib/types";
    import Fan from "$lib/components/decklist/Fan.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import UserRoundIcon from "@lucide/svelte/icons/user-round";
    import { localizeHref } from "$lib/paraglide/runtime";

    interface Props {
        decklist: Decklist;
        cards: Card[];
    }

    let { decklist, cards }: Props = $props();

    const attributes = $derived(decklist.attributes);
    const faction_id = $derived(attributes.faction_id);

    const fan_tier = (card: Card): number => {
        const { faction_id: card_faction } = card.attributes;
        if (
            card_faction === "neutral_corp" ||
            card_faction === "neutral_runner" ||
            card_faction === faction_id
        )
            return 1;

        return 0;
    };

    const fan_cards = $derived.by(() => {
        const identity_card = cards.find(
            (card) => card.id === attributes.identity_card_id,
        );

        // TODO: Consider using some frequency math to prioritize less common cards
        // For now, out of faction cards first, then alphabetically
        const sorted_cards = cards
            .filter((card) => card.id !== attributes.identity_card_id)
            .sort((a, b) => {
                const tier_difference = fan_tier(a) - fan_tier(b);

                return tier_difference !== 0
                    ? tier_difference
                    : a.attributes.title.localeCompare(b.attributes.title);
            });

        return [identity_card, sorted_cards[0], sorted_cards[1]] as const;
    });

    let hover = $state(false);
</script>

<a
    class="tile"
    href={localizeHref(`/decklist/${decklist.id}`)}
    data-sveltekit-preload-data
    onmouseenter={() => (hover = true)}
    onmouseleave={() => (hover = false)}
    onfocus={() => (hover = true)}
    onblur={() => (hover = false)}
>
    <span class="tile__watermark watermark" aria-hidden="true">
        <Icon name={faction_id} size="none" label="" theme={faction_id} />
    </span>

    <Fan cards={fan_cards} {hover} />

    <span class="tile__content">
        <span class="tile__title">{attributes.name}</span>
        <span class="tile__author" style="color: var(--{faction_id})">
            <UserRoundIcon size={16} aria-hidden="true" />
            {attributes.user_id}
        </span>
    </span>
</a>

<style>
    .tile {
        position: relative;
        isolation: isolate;
        display: flex;
        gap: 0.5rem;
        align-items: stretch;
        padding: 0.75rem 1rem;
        background: var(--foreground);
        color: var(--text);
        text-decoration: none;
    }

    .tile__watermark {
        --icon-size: 12rem;

        position: absolute;
        inset: 0;
        z-index: -1;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        overflow: hidden;
        opacity: 0.1;
        pointer-events: none;
    }

    .tile__watermark :global(> *) {
        flex: none;
        transform: translateX(2rem);
    }

    .tile__content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 0.5rem;
        min-width: 0;
    }

    .tile__title {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        line-height: var(--leading-tight);
        text-wrap: balance;
    }

    .tile__author {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
</style>
