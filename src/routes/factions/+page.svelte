<script lang="ts">
	import type { Faction } from '$lib/types';
	import { factions } from '$lib/store';
	import Header from '$lib/components/Header.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';

	let data = $derived<Faction[]>($factions);
</script>

{#if data}
	<Header title="Factions" />

	<ul>
		{#each data as faction (faction.id)}
			<li>
				<a href={localizeHref(`/faction/${faction.id}`)}>
					{faction.attributes.name}
				</a>
			</li>
		{/each}
	</ul>
{/if}
