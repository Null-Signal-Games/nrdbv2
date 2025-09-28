<script lang="ts">
	import type { Cycle, Set } from '$lib/types';
	import { sets, cycles } from '$lib/store';
	import Header from '$lib/components/Header.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { format_date } from '$lib/utils';

	let data_cycles = $derived<Cycle[]>(
		$cycles.slice().sort((a, b) => (a.attributes.date_release > b.attributes.date_release ? -1 : 1))
	);
	let data_sets = $derived<Set[]>(
		$sets.slice().sort((a, b) => (a.attributes.date_release > b.attributes.date_release ? -1 : 1))
	);
</script>

{#if data_cycles && data_sets}
	<Header title="Sets" />

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
						<a href={`/cycles/${cycle.id}`}>{cycle.attributes.name}</a>
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
				{#if cycle.attributes.card_set_ids.length > 1}
					{#each cycle.attributes.card_set_ids as set_id (set_id)}
						{#each data_sets.filter((set: Set) => set.id === set_id) as set (set)}
							<tr>
								<td>
									<span class="icon-label">
										<Icon name="subroutine" size="sm" />
										<a href="/sets/{set.id}">{set.attributes.name}</a>
									</span>
								</td>
								<!-- <td>{set.attributes.size}</td> -->
								<td>{set.attributes.date_release}</td>
								<td>
									<span class="icon-label">
										<Icon name={set.attributes.released_by} size="sm" />
										{set.attributes.released_by}
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

	<pre>{JSON.stringify(data_cycles, null, 2)}</pre>
	<pre>{JSON.stringify(data_sets, null, 2)}</pre>
{/if}
