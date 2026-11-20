<script lang="ts">
	import type { Ruling } from '$lib/types';
	import Header from '$lib/components/Header.svelte';
	import Container from '$lib/components/Container.svelte';
	import RulingItem from '$lib/components/Ruling.svelte';
	import Ghost from '$lib/components/Ghost.svelte';
	import Meta from '$lib/components/Meta.svelte';
	import Hint from '$lib/components/ui/Hint.svelte';

	let { data }: { data: { rulings: Ruling[] } } = $props();
</script>

<Meta title="Rulings" />

<Header title="Rulings" />

<Container>
	{#await data.rulings}
		{#each Array(5) as _}
			<Ghost />
		{/each}
	{:then rulings}
		<Hint>
			<ul>
				{#each rulings as ruling (ruling.id)}
					<RulingItem data={ruling} />
				{/each}
			</ul>
		</Hint>
	{:catch error}
		<p>error loading rulings: {error.message}</p>
	{/await}
</Container>

<style>
	/* Temporary styles */
	ul {
		display: grid;
		gap: 1rem;
	}
</style>
