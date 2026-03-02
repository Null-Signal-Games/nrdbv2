<script lang="ts">
    import { cards, searchQuery } from "$lib/store";
    import { filterAndRankCards } from "$lib/search";
    import CardImage from "$lib/components/card/CardImage.svelte";
    import DecklistSuggestions from "$lib/components/DecklistSuggestions.svelte";
    import { afterNavigate } from "$app/navigation";
    import { localizeHref } from "$lib/paraglide/runtime";
    import { onMount } from "svelte";
    import Icon from "./Icon.svelte";

    let search_input: HTMLInputElement | null = null;
    let is_open = $state(false);
    let dropdown_element = $state<HTMLDivElement | null>(null);
    const filtered_cards = $derived(
        filterAndRankCards($cards, $searchQuery).slice(0, 5),
    );

    // Close the dropdown on navigation, to prevent it from sticking around when navigating via search results
    afterNavigate(() => {
        is_open = false;
    });

    onMount(() => {
        const on_key_down = (e: KeyboardEvent) => {
            const ua = (
                navigator as unknown as {
                    userAgentData?: { platform?: string };
                }
            ).userAgentData;

            const platform =
                typeof ua?.platform === "string"
                    ? ua.platform
                    : navigator.userAgent;
            const mac =
                typeof platform === "string" &&
                platform.toLowerCase().includes("mac");

            const is_find =
                (mac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "f";

            if (is_find) {
                if (document.activeElement === search_input) return;
                e.preventDefault();
                search_input?.focus();
                is_open = true;
                return;
            }

            if (e.key === "Escape" || e.key === "Esc") {
                if (!is_open) return;
                const active = document.activeElement as Node | null;
                const focus_inside =
                    (dropdown_element && active
                        ? dropdown_element.contains(active)
                        : false) || document.activeElement === search_input;
                if (focus_inside) {
                    e.preventDefault();
                    is_open = false;
                    search_input?.blur();
                }
            }
        };

        window.addEventListener("keydown", on_key_down);
        return () => window.removeEventListener("keydown", on_key_down);
    });
</script>

<div class="search-input-root">
    <span class="search-input-container">
        <Icon name="subroutine" size="md" class="search-icon" />
        <input
            bind:this={search_input}
            type="text"
            placeholder="Search"
            bind:value={$searchQuery}
            onfocus={() => (is_open = true)}
            onblur={(e) => {
                const next = (e as FocusEvent).relatedTarget as Node | null;
                const focus_inside =
                    dropdown_element && next
                        ? dropdown_element.contains(next)
                        : false;
                if (!focus_inside) {
                    is_open = false;
                }
            }}
        />
    </span>
    {#if is_open && $searchQuery.length > 0}
        <div class="search-dropdown" bind:this={dropdown_element}>
            <h2>Cards</h2>
            <div class="card-grid">
                {#each filtered_cards as card (card.id)}
                    <div class="card-grid-item">
                        <CardImage
                            {card}
                            loading="lazy"
                            boxShadow={false}
                            hasTransition={true}
                            href={localizeHref(`/card/${card.id}`)}
                        />
                    </div>
                {/each}
            </div>
            <DecklistSuggestions firstCard={filtered_cards[0]} />
        </div>
    {/if}
</div>

<style>
    .search-input-root {
        position: relative;
        width: 100%;
    }

    .search-input-root:has(.search-dropdown)::after {
        content: "";
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 20;
        pointer-events: none;
    }

    .search-input-container {
        display: flex;
        flex-direction: row;
        gap: 1rem;
        position: relative;
        z-index: 30;
    }

    .search-input-container :global(.search-icon) {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: 0.75rem;
        pointer-events: none;
    }

    .search-input-container input {
        width: 100%;
        padding: 0.5rem;
        padding-left: 2.5rem;
        border: 1px solid #ccc;
        font-size: 1rem;
        line-height: 1.5;
    }

    .search-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 30;
        background-color: var(--foreground);
        border: 1px solid var(--border);
        padding: 1.5rem;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
        max-height: 75dvh;
        overflow-x: auto;
    }

    .card-grid {
        padding: 0.5rem;
        display: flex;
        gap: 1rem;
        overflow-x: scroll;
    }

    .card-grid-item {
        max-width: 200px;
        display: block;
        flex: 0 0 auto;
    }
</style>
