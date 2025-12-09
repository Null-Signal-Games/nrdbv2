<script lang="ts">
	import type { Faction } from '$lib/types';
	import { factions } from '$lib/store';
	import Header from '$lib/components/Header.svelte';

	let data = $derived<Faction[]>($factions);
</script>

{#if data}
	<Header title="Factions" />

	<ul>
		{#each data as faction (faction.id)}
			<li>
				<a href={`/faction/${faction.id}`}>
					{faction.attributes.name}
				</a>
			</li>
		{/each}
	</ul>
{/if}
