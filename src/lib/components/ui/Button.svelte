<script lang="ts">
    import { type Snippet } from "svelte";

    interface Props {
        children?: Snippet;
        icon?: Snippet;
        class?: string;
        href?: string;
        type?: "button" | "submit" | "reset";
        color?: "primary" | "secondary" | "ghost" | "danger";
        size?: "sm" | "md";
        [key: string]: unknown;
    }

    let {
        children,
        icon,
        class: classList,
        href,
        type = "button",
        color = "primary",
        size = "md",
        ...rest
    }: Props = $props();

    let _color = $derived<string>(`button--${color}`);
    let _size = $derived<string>(`button--${size}`);
</script>

{#snippet button()}
    {@render icon?.()}
    {@render children?.()}
{/snippet}

{#if href}
    <a
        data-id="button"
        class="button {_size} {_color} {classList}"
        {href}
        {...rest}
    >
        {@render button()}
    </a>
{:else}
    <button
        data-id="button"
        class="button {_color} {_size} {classList}"
        {type}
        {...rest}
    >
        {@render button()}
    </button>
{/if}

<style>
    .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: var(--border);
        border: 1px solid var(--border);
        color: var(--text);
        text-decoration: none;
        border-radius: 0.25rem;

        &.button--sm {
            padding: 0.5rem 0.75rem;
        }

        /*&.button--primary {

        }*/

        &.button--secondary {
        }

        &.button--ghost {
            border-color: var(--border);
            opacity: 0.5;
            background: transparent;
        }

        &.button--danger {
        }
    }
</style>
