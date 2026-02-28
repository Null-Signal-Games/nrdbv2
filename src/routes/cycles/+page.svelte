<script lang="ts">
	import type { Cycle } from '$lib/types';
	import { cycles } from '$lib/store';
	import Header from '$lib/components/Header.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { format_date, store_or_server } from '$lib/utils';
	import { localizeHref } from '$lib/paraglide/runtime';

	interface Props {
		data: { cycles: Cycle[] | null };
	}

	let { data }: Props = $props();

	let data_cycles = $derived<Cycle[]>(store_or_server($cycles, data.cycles, 'cycles'));
</script>

{#if data_cycles}
	<Header title="Cycles" />

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
			{#each data_cycles as cycle (cycle.id)}
				<tr>
					<td>
						<a href={localizeHref(`/cycles/${cycle.id}`)}>{cycle.attributes.name}</a>
					</td>
					<!-- <td>{cycle.attributes.size}</td> -->
					<td>{format_date(cycle.attributes.date_release)}</td>
					<td>
						<label class="icon-label">
							<Icon name={cycle.attributes.released_by} size="sm" />
							{cycle.attributes.released_by}
						</label>
					</td>
					<td>Standard</td>
					<td>Startup</td>
					<td>Eternal</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<pre>{JSON.stringify(data_cycles, null, 2)}</pre>
{/if}
