<script lang="ts">
	import type { Faction } from '$lib/types';
	import { factions } from '$lib/store';
	import Header from '$lib/components/Header.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { store_or_server } from '$lib/utils';

	interface Props {
		data: { factions: Faction[] | null };
	}

	let { data }: Props = $props();

	let factions_list = $derived<Faction[]>(store_or_server($factions, data.factions, 'factions'));
</script>

{#if factions_list.length > 0}
	<Header title="Factions" />

	<ul>
		{#each factions_list as faction (faction.id)}
			<li>
				<a href={localizeHref(`/faction/${faction.id}`)}>
					{faction.attributes.name}
				</a>
			</li>
		{/each}
	</ul>
{/if}
