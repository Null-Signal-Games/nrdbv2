<script lang="ts">
	import type { Illustrator } from '$lib/types';
	import Header from '$lib/components/Header.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';

	let { data }: { data: { illustrators: Illustrator[] } } = $props();
</script>

{#if data.illustrators}
	<Header title="Illustrators" />

	<ul>
		{#each data.illustrators as illustrator (illustrator.id)}
			<li>
				<a href={localizeHref(`/illustrators/${illustrator.id}`)}>
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
