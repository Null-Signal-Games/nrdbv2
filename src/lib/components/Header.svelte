<script lang="ts">
    import { type Snippet } from "svelte";
    import Container from "./Container.svelte";

    interface Props {
        title: string;
        subtitle?: string;
        children?: Snippet;
    }

    let { title, subtitle, children }: Props = $props();
</script>

<header class="page-header">
    <Container>
        <h1>{title}</h1>
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
