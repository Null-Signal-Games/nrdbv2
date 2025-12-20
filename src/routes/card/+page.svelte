<script lang="ts">
	import type { Card } from '$lib/types';
	import { cards } from '$lib/store';
	import Header from '$lib/components/Header.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';

	let data = $derived<Card[]>($cards);
</script>

{#if data}
	<Header title="Factions" />

	<ul>
		{#each data as card (card.id)}
			<li>
				<a href={localizeHref(`/card/${card.id}`)}>
					{card.attributes.title}
				</a>
			</li>
		{/each}
	</ul>
{/if}
