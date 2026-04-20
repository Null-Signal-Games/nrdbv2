<script lang="ts">
    import type { PageServerData, PageData } from "./$types";
    import Header from "$lib/components/Header.svelte";
    import Table from "$lib/components/Table.svelte";
    import Container from "$lib/components/Container.svelte";

    interface Props {
        data: PageServerData & PageData;
    }

    let { data }: Props = $props();
</script>

<Header title={`Cycle: ${data.cycle.attributes.name}`} />

<Container>
    <Table cards={data.cards} />
</Container>
