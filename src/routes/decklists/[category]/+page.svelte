<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import type { Decklist } from '$lib/types';
	import DecklistItem from '$lib/components/decklist/Item.svelte';

	interface Props {
		data: {
			title: string;
			decklists: Decklist[];
		};
	}

	let { data }: Props = $props();
</script>

<Header title={data.title} />

{#if data.decklists}
	<ul>
		{#each data.decklists as decklist (decklist.id)}
			<DecklistItem {decklist} />
		{/each}
	</ul>
{/if}

<pre>{JSON.stringify(data, null, 2)}</pre>

<style>
	/* Temporary styles */
	ul {
		display: grid;
		gap: 1rem;
	}
</style>
