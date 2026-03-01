<script lang="ts">
    import { type Snippet } from "svelte";

    interface Props {
        children?: Snippet;
        class?: string;
    }

    let { children, class: classList }: Props = $props();
</script>

<div class={`container ${classList}`}>
    {@render children?.()}
</div>
