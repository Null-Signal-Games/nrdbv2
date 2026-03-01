<script lang="ts">
    import type { Ruling } from "$lib/types";
    import Header from "$lib/components/Header.svelte";
    import Container from "$lib/components/Container.svelte";

    let { data }: { data: { ruling: Ruling } } = $props();
</script>

{#if data.ruling}
    <Header title={`Rulings: ${data.ruling.attributes.question}`} />

    <Container>
        <pre>{JSON.stringify(data.ruling, null, 2)}</pre>
    </Container>
{/if}
