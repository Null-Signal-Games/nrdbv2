<script lang="ts">
	import type { Cycle } from '$lib/types';
	import { cycles } from '$lib/store';
	import Header from '$lib/components/Header.svelte';

	let data = $derived<Cycle[]>($cycles);
</script>

{#if data}
	<Header title="Cycles" />

	<ul>
		{#each data as cycle (cycle.id)}
			<li>
				<a href={`/cycles/${cycle.id}`}>
					{cycle.attributes.name}
				</a>
			</li>
		{/each}
	</ul>
{/if}
