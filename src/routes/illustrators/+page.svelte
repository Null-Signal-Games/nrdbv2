<script lang="ts">
	import type { Ruling } from '$lib/types';
	import Header from '$lib/components/Header.svelte';

	let { data }: { data: { illustrators: Ruling[] } } = $props();
</script>

{#if data.illustrators}
	<Header title="Illustrators" />

	<ul>
		{#each data.illustrators as illustrator (illustrator.id)}
			<li>
				<a href={`/illustrators/${illustrator.id}`}>
					{illustrator.attributes.name}
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
