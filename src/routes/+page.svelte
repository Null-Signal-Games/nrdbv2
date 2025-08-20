<script lang="ts">
	import type { Card } from '$lib/types';
	import { getContext } from 'svelte';

	const store = getContext<{ allCards: Card[] }>('store');
</script>

<ul>
	{#each store.allCards as card}
		<li>
			{card.attributes.title}
		</li>
	{/each}
</ul>
