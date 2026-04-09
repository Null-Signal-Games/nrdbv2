<script lang="ts">
    import { type Snippet } from "svelte";

    interface Props {
        children?: Snippet;
        icon?: Snippet;
        class?: string;
        href?: string;
        type?: "button" | "submit" | "reset";
        [key: string]: unknown;
    }

    let {
        children,
        icon,
        class: classList,
        href,
        type = "button",
        ...rest
    }: Props = $props();
</script>

{#snippet button()}
    {@render icon?.()}
    {@render children?.()}
{/snippet}

{#if href}
    <a data-id="button" class="button {classList}" {href} {...rest}>
        {@render button()}
    </a>
{:else}
    <button data-id="button" class="button {classList}" {type} {...rest}>
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
    }
</style>
