<script lang="ts">
    import type { PageData } from "./$types";
    import Header from "$lib/components/Header.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { m } from "$lib/paraglide/messages.js";
    import { format_date } from "$lib/utils";
    import { localizeHref } from "$lib/paraglide/runtime";
    import Container from "$lib/components/Container.svelte";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
</script>

<Header title="Cycles" />

<Container>
    <!-- TODO: replace with <Table /> once the component is more generic/extensible -->
    <table class="results mt-5">
        <thead>
            <tr>
                <th>{m.name()}</th>
                <!-- <th>{m.cards()}</th> -->
                <th>{m.release_date()}</th>
                <th>{m.publisher()}</th>
                <th>{m.standard()}</th>
                <th>{m.startup()}</th>
                <th>{m.eternal()}</th>
            </tr>
        </thead>
        <tbody>
            {#each data.cycles as cycle (cycle.id)}
                <tr>
                    <td>
                        <a href={localizeHref(`/cycles/${cycle.id}`)}
                            >{cycle.name}</a
                        >
                    </td>
                    <!-- <td>{cycle.size}</td> -->
                    <td>{format_date(cycle.date_release)}</td>
                    <td>
                        <label class="icon-label">
                            <Icon name={cycle.released_by} size="sm" />
                            {cycle.released_by}
                        </label>
                    </td>
                    <td>Standard</td>
                    <td>Startup</td>
                    <td>Eternal</td>
                </tr>
            {/each}
        </tbody>
    </table>
</Container>
