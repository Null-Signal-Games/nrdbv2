<script lang="ts">
	import type { Decklist } from '$lib/types';
	import Header from '$lib/components/Header.svelte';
	import DecklistItem from '$lib/components/decklist/Item.svelte';

	let { data }: { data: { decklists: Decklist[] } } = $props();
</script>

{#if data.decklists}
	<Header title="Decklists" />

	<ul>
		{#each data.decklists as decklist (decklist.id)}
			<DecklistItem {decklist} />
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
