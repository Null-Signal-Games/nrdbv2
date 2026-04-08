<script lang="ts">
    import type { PageData } from "./$types";
    import Header from "$lib/components/Header.svelte";
    import Table from "$lib/components/Table.svelte";
    import Container from "$lib/components/Container.svelte";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
</script>

<Header title={`Cycle: ${data.cycle.name}`} />

<Container>
    <Table cards={data.cards} />
</Container>
