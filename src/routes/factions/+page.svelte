<script lang="ts">
	import type { PageServerData, PageData } from './$types';
	import Header from '$lib/components/Header.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Container from '$lib/components/Container.svelte';
	import Ghost from '$lib/components/Ghost.svelte';
	import Meta from '$lib/components/Meta.svelte';

	interface Props {
		data: PageServerData & PageData;
	}

	let { data }: Props = $props();
</script>

<Meta title="Factions" />

<Header title="Factions" />

<Container>
	<ul>
		{#each data.factions as faction (faction.id)}
			<li>
				<a href={localizeHref(`/faction/${faction.id}`)}>
					{faction.attributes.name}
				</a>
			</li>
		{/each}
	</ul>
</Container>

<style>
	/* Temporary styles */
	ul {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-4);
	}
</style>
