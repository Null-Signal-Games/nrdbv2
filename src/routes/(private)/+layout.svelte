<script lang="ts">
    import { onMount, type Snippet } from "svelte";
    import { page } from "$app/state";
    import { signIn } from "@auth/sveltekit/client";

    interface Props {
        children?: Snippet;
    }

    let { children }: Props = $props();

    onMount(() => {
        if (!page.data.session) {
            signIn("nsg-keycloak");
        }
    });
</script>

{@render children?.()}
