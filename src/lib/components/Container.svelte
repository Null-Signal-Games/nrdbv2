<script lang="ts">
    import { type Snippet } from "svelte";

    interface Props {
        children?: Snippet;
        class?: string;
        rest?: string;
    }

    let { children, class: classList, ...rest }: Props = $props();
</script>

<article class="container {classList}" {...rest}>
    {@render children?.()}
</article>
