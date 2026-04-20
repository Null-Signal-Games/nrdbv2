<script lang="ts">
    import type { PageServerData, PageData } from "./$types";
    import Header from "$lib/components/Header.svelte";
    import Container from "$lib/components/Container.svelte";

    interface Props {
        data: PageServerData & PageData;
    }

    let { data }: Props = $props();
</script>

<Header title={`Format: ${data.format.attributes.name}`} />

<Container>
    <pre>{JSON.stringify(data.format, null, 2)}</pre>
</Container>
