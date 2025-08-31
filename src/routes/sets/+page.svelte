<script lang="ts">
	import type { Set } from '$lib/types';
	import { sets } from '$lib/store';
	import Header from '$lib/components/Header.svelte';

	let data = $derived<Set[]>($sets);
</script>

{#if data}
	<Header title="Sets" />

	<ul>
		{#each data as set (set.id)}
			<li>
				<a href={`/sets/${set.id}`}>
					{set.attributes.name}
				</a>
			</li>
		{/each}
	</ul>
{/if}
