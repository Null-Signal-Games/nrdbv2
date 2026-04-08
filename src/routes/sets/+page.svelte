<script lang="ts">
    import type { PageData } from "./$types";
    import type { Cycle, Set, Publishers } from "$lib/types";
    import Header from "$lib/components/Header.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { m } from "$lib/paraglide/messages.js";
    import { format_date } from "$lib/utils";
    import { publishers } from "$lib/i18n";
    import { localizeHref } from "$lib/paraglide/runtime";
    import Container from "$lib/components/Container.svelte";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
</script>

<pre>{JSON.stringify(data, null, 2)}</pre>

<Header title="Sets" />

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
                <tr data-id={cycle.id}>
                    <td>
                        <a href={localizeHref(`/cycles/${cycle.id}`)}
                            >{cycle.name}</a
                        >
                    </td>
                    <!-- <td>{cycle.size}</td> -->
                    <td>
                        <time datetime={cycle.date_release}>
                            {format_date(cycle.date_release)}
                        </time>
                    </td>
                    <td>
                        <label class="icon-label">
                            <Icon name={cycle.released_by} size="sm" />
                            {publishers[cycle.released_by as Publishers]}
                        </label>
                    </td>
                    <td>Standard</td>
                    <td>Startup</td>
                    <td>Eternal</td>
                </tr>
                {#if data.cycle.card_set_ids.length > 1}
                    {#each data.cycle.card_set_ids as set_id (set_id)}
                        {#each data.sets.filter((set: Set) => set.id === set_id) as set (set)}
                            <tr>
                                <td>
                                    <span class="icon-label">
                                        <Icon name="subroutine" size="sm" />
                                        <a
                                            href={localizeHref(
                                                `/sets/${set.id}`,
                                            )}>{set.name}</a
                                        >
                                    </span>
                                </td>
                                <!-- <td>{set.size}</td> -->
                                <td>{set.date_release}</td>
                                <td>
                                    <span class="icon-label">
                                        <Icon
                                            name={set.released_by}
                                            size="sm"
                                        />
                                        {publishers[
                                            set.released_by as Publishers
                                        ]}
                                    </span>
                                </td>
                                <td>Standard</td>
                                <td>Startup</td>
                                <td>Eternal</td>
                            </tr>
                        {/each}
                    {/each}
                {/if}
            {/each}
        </tbody>
    </table>

    <!-- <pre>{JSON.stringify(data.cycles, null, 2)}</pre>
        <pre>{JSON.stringify(data.sets, null, 2)}</pre> -->
</Container>
