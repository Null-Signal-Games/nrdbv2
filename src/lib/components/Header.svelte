<script lang="ts">
    import { type Snippet } from "svelte";
    import Container from "./Container.svelte";

    interface Props {
        icon?: Snippet;
        title: string;
        subtitle?: string;
        children?: Snippet;
    }

    let { icon, title, subtitle, children }: Props = $props();
</script>

<header class="page-header">
    <Container>
        <div
            style="display: flex; align-items: center; justify-items: center; flex-direction: row; gap: 1rem;"
        >
            {@render icon?.()}
            <h1>{title}</h1>
        </div>
        {#if subtitle}
            <p>{subtitle}</p>
        {/if}
        {@render children?.()}
    </Container>
</header>

<style>
    header {
        border-bottom: 1px solid var(--border);
        padding-block: 2rem;
    }
</style>
