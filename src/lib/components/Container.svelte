<script lang="ts">
    import { type Snippet } from "svelte";

    interface Props {
        children?: Snippet;
        class?: string;
        [key: string]: unknown;
    }

    let { children, class: classList, ...rest }: Props = $props();
</script>

<article class="container {classList}" {...rest}>
    {@render children?.()}
</article>
