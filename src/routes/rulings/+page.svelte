<script lang="ts">
	import type { Ruling } from '$lib/types';
	import Header from '$lib/components/Header.svelte';

	let { data }: { data: { rulings: Ruling[] } } = $props();
</script>

{#if data.rulings}
	<Header title="Rulings" />

	<ul>
		{#each data.rulings as ruling (ruling.id)}
			<li>
				<a href={`/rulings/${ruling.id}`}>
					{ruling.attributes.question}
				</a>
			</li>
		{/each}
	</ul>
{/if}

<style>
	/* Temporary styles */
	ul {
		display: grid;
		gap: 1rem;
	}
</style>
