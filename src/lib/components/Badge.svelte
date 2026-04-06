<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        children?: Snippet;
        icon?: Snippet;
        color?: "green" | "red" | "yellow" | null;
    }

    let { children, icon, color = null }: Props = $props();
</script>

<span data-id="badge" class="badge {color}">
    {@render icon?.()}
    {@render children?.()}
</span>

<style>
    /* Temporary styles */
    .badge {
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        border: #fff solid 1px;
        text-transform: uppercase;

        &.green {
            border-color: var(--verified);
            background-color: var(--verified);
            color: white;
        }
        &.red {
            border-color: red;
            background-color: red;
            color: white;
        }
        &.yellow {
            border-color: yellow;
            background-color: yellow;
            color: black;
        }
    }
</style>
