<script lang="ts">
    import { tooltip, tooltip_hover } from "$lib/store";
    import { onMount, tick } from "svelte";
    import CardImage from "$lib/components/CardImage.svelte";
    import { page } from "$app/state";
    import { dev } from "$app/environment";
    import Icon from "./Icon.svelte";
    import Influence from "./Influence.svelte";
    import type { FactionIds } from "$lib/types";
    import FormatText from "./FormatText.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";

    let tooltip_element: HTMLElement | undefined = $state();
    let is_over_tooltip = $state(false);
    let is_over_bridge = $state(false);
    let bridge_svg_height = $state(0);
    let bridge_points = $state("");
    let adjusted_position = $state({ x: 0, y: 0 });

    // Non-reactive cursor tracking
    let cursor_x = 0;
    let cursor_y = 0;

    function calculate_adjusted_position() {
        if (!tooltip_element)
            return { x: $tooltip.position.x, y: $tooltip.position.y };

        const rect = tooltip_element.getBoundingClientRect();
        const viewport_width = window.innerWidth;
        const viewport_height = window.innerHeight;

        let adjusted_x = $tooltip.position.x;
        let adjusted_y = $tooltip.position.y;

        // Edge detection - horizontal
        if (rect.left < 0) {
            adjusted_x = adjusted_x - rect.left + 8; // 8px padding from edge
        } else if (rect.right > viewport_width) {
            adjusted_x = adjusted_x - (rect.right - viewport_width) - 8;
        }

        // Edge detection - vertical
        if (rect.top < 0) {
            adjusted_y = adjusted_y - rect.top + 8;
        } else if (rect.bottom > viewport_height) {
            adjusted_y = adjusted_y - (rect.bottom - viewport_height) - 8;
        }

        return { x: adjusted_x, y: adjusted_y };
    }

    function update_bridge() {
        if (!tooltip_element || !$tooltip.visible || !$tooltip.element) {
            bridge_points = "";
            bridge_svg_height = 0;
            return;
        }

        const tooltip_rect = tooltip_element.getBoundingClientRect();
        const trigger_rect = $tooltip.element.getBoundingClientRect();

        // Check if cursor is over the trigger element or already in tooltip/bridge
        const is_over_trigger =
            cursor_x >= trigger_rect.left &&
            cursor_x <= trigger_rect.right &&
            cursor_y >= trigger_rect.top &&
            cursor_y <= trigger_rect.bottom;

        if (!is_over_trigger && !is_over_tooltip && !is_over_bridge) {
            return;
        }

        // Calculate distance from tooltip bottom to trigger center
        const trigger_center_y = trigger_rect.top + trigger_rect.height / 2;
        const distance = Math.max(trigger_center_y - tooltip_rect.bottom, 10);

        // Always show a bridge that extends down
        bridge_svg_height = distance;

        // Create a wide trapezoid/triangle from tooltip bottom to trigger area
        // Make it wider than just the cursor point for more forgiving hover
        const trigger_left = Math.max(
            trigger_rect.left,
            tooltip_rect.left - 50,
        );
        const trigger_right = Math.min(
            trigger_rect.right,
            tooltip_rect.right + 50,
        );

        const rel_left = trigger_left - tooltip_rect.left;
        const rel_right = trigger_right - tooltip_rect.left;

        // Trapezoid: top-left (0,0), top-right (width,0), bottom-right, bottom-left
        bridge_points = `0,0 ${tooltip_rect.width},0 ${rel_right},${distance} ${rel_left},${distance}`;
    }

    function handle_mouse_move(e: MouseEvent) {
        cursor_x = e.clientX;
        cursor_y = e.clientY;

        if ($tooltip.visible) {
            update_bridge();
        }
    }

    function sync_hover_state() {
        tooltip_hover.set({
            is_over_tooltip,
            is_over_bridge,
        });
    }

    function handle_mouse_enter_tooltip() {
        is_over_tooltip = true;
        sync_hover_state();
    }

    function handle_mouse_leave_tooltip() {
        is_over_tooltip = false;
        sync_hover_state();
        maybe_hide_tooltip();
    }

    function handle_mouse_enter_bridge() {
        is_over_bridge = true;
        sync_hover_state();
    }

    function handle_mouse_leave_bridge() {
        is_over_bridge = false;
        sync_hover_state();
        maybe_hide_tooltip();
    }

    function maybe_hide_tooltip() {
        if (!is_over_tooltip && !is_over_bridge) {
            hide_tooltip();
        }
    }

    function hide_tooltip() {
        tooltip.set({
            element: null,
            visible: false,
            card: null,
            position: { x: 0, y: 0 },
        });
        bridge_points = "";
        bridge_svg_height = 0;
    }

    // Update tooltip position and bridge when tooltip becomes visible
    $effect(() => {
        if (!$tooltip.visible || !tooltip_element) {
            bridge_points = "";
            bridge_svg_height = 0;
            return;
        }

        tick().then(() => {
            adjusted_position = calculate_adjusted_position();
            update_bridge();
        });
    });

    // Hide tooltip on page navigation
    $effect(() => {
        const current_url = page.url.href;
        return () => {
            hide_tooltip();
        };
    });

    // Add/remove mouse move listener based on tooltip visibility
    $effect(() => {
        if ($tooltip.visible) {
            window.addEventListener("mousemove", handle_mouse_move);
            return () => {
                window.removeEventListener("mousemove", handle_mouse_move);
            };
        }
    });

    onMount(() => {
        window.addEventListener("scroll", hide_tooltip);
        return () => {
            window.removeEventListener("scroll", hide_tooltip);
        };
    });
</script>

<!-- onmouseenter={handle_mouse_enter_tooltip}
	onmouseleave={handle_mouse_leave_tooltip} -->
<div
    bind:this={tooltip_element}
    style="--left: {adjusted_position.x}px; --top: calc({adjusted_position.y}px + var(--scroll));"
    class="tooltip"
    data-visible={$tooltip.visible}
    onmouseenter={handle_mouse_enter_tooltip}
    onmouseleave={handle_mouse_leave_tooltip}
    role="tooltip"
    aria-roledescription="tooltip"
>
    {#if $tooltip?.card}
        <div class="tooltip__image">
            <CardImage card={$tooltip.card} />
        </div>
        <div class="tooltip__meta">
            <div>
                <p>
                    <a href={localizeHref(`/card/${$tooltip.card?.id}`)}
                        >{$tooltip.card?.attributes.title}</a
                    >
                </p>
                <span>
                    <Icon
                        name={$tooltip.card.attributes.card_type_id}
                        size="sm"
                    />
                    {$tooltip.card?.attributes.card_type_id}
                </span>
                {#if $tooltip.card.attributes.influence_cost}
                    <Influence
                        text={true}
                        count={$tooltip.card.attributes.influence_cost}
                        theme={$tooltip.card.attributes
                            .faction_id as FactionIds}
                        total={true}
                    />
                {/if}
            </div>
            {#if $tooltip.card.attributes?.text}
                <div data-faction-theme={$tooltip.card.attributes.faction_id}>
                    <FormatText text={$tooltip.card.attributes.text} />
                </div>
            {/if}
        </div>
    {/if}

    {#if $tooltip.visible && bridge_points}
        <svg class="tooltip-bridge" width="100%" height={bridge_svg_height}>
            <polygon
                role="presentation"
                points={bridge_points}
                onmouseenter={handle_mouse_enter_bridge}
                onmouseleave={handle_mouse_leave_bridge}
                class={dev ? "debug" : ""}
            />
        </svg>
    {/if}
</div>

<style>
    /* Temporary styles */
    .tooltip {
        --spacing: 0.25rem;
        --caret: calc(var(--spacing) * 2);
        position: absolute;
        display: grid;
        gap: calc(var(--spacing) * 4);
        grid-template-columns: auto 1fr;
        /* align-items: start; */
        width: 100%;
        max-width: var(--tooltip);
        left: var(--left);
        top: var(--top);
        transform: translate(-50%, calc(-100% - var(--caret)));
        background-color: var(--foreground);
        color: var(--text);
        pointer-events: none;
        opacity: 0;
        transition: opacity 120ms ease;
        max-width: 400px;
        padding: 1rem;
        border: 2px solid var(--border);
        border-radius: 0.5rem;
        z-index: 10000;
    }

    .tooltip[data-visible="true"] {
        pointer-events: auto;
        opacity: 1;
    }

    .tooltip::before,
    .tooltip::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translate(-50%, 100%);
        border-style: solid;
    }

    .tooltip::before {
        border-width: calc(var(--spacing) * 3);
        border-color: black transparent transparent transparent;
    }

    .tooltip::after {
        border-width: calc(var(--spacing) * 2.5);
        border-color: black transparent transparent transparent;
    }

    .tooltip__image {
        max-width: 140px;
    }

    .tooltip-bridge {
        position: absolute;
        left: 0;
        top: 100%;
        width: 100%;
        pointer-events: all;
    }

    .tooltip-bridge polygon {
        fill: transparent;
        pointer-events: auto;
    }

    .tooltip-bridge polygon.debug {
        fill: rgba(255, 0, 0, 0.5);
    }
</style>
