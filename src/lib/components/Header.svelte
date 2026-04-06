<script lang="ts">
    import { type Snippet } from "svelte";
    import Container from "./Container.svelte";

    interface Props {
        icon?: Snippet;
        title: string;
        subtitle?: string;
        children?: Snippet;
        actions?: Snippet;
    }

    let { icon, title, subtitle, children, actions }: Props = $props();
</script>

<header data-id="page-header">
    <Container>
        <div class="upper">
            <div class="content">
                <div>
                    {@render icon?.()}
                    <h1>{title}</h1>
                </div>
                {#if subtitle}
                    <p>{subtitle}</p>
                {/if}
            </div>
            <div>
                {@render actions?.()}
            </div>
        </div>
        <div>
            {@render children?.()}
        </div>
    </Container>
</header>

<style>
    header {
        border-bottom: 1px solid var(--border);
        padding-block: 2rem;
    }

    .upper {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: 1rem;
    }

    .content {
        display: flex;
        align-items: center;
        justify-items: center;
        flex-direction: row;
        gap: 1rem;
    }

    .actions {
    }
</style>
