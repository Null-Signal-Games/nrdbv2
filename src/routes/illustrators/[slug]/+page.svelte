<script lang="ts">
	import type { Illustrator, Printing } from '$lib/types';
	import Header from '$lib/components/Header.svelte';

	let { data }: { data: { illustrator: Illustrator; printings: Printing[] } } = $props();
</script>

{#if data.illustrator}
	<Header title={`Illustrator: ${data.illustrator.attributes.name}`} />

	<ul>
		{#each data.printings as printing (printing.id)}
			<li>
				<a href={`/cards/${printing.attributes.card_id}`}>
					{printing.attributes.card_id}
				</a>
			</li>
		{/each}
	</ul>
{/if}
