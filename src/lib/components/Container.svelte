<script lang="ts">
    import { type Snippet } from "svelte";

    interface Props {
        children?: Snippet;
        class?: string;
    }

    let { children, class: classList }: Props = $props();
</script>

<article class="container {classList}">
    {@render children?.()}
</article>
