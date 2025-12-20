<script lang="ts">
	import type { Illustrator, Printing } from '$lib/types';
	import Header from '$lib/components/Header.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	// import CardImage from '$lib/components/CardImage.svelte';

	let {
		data
	}: {
		data: {
			illustrator: Illustrator;
			printings: Printing[];
		};
	} = $props();
</script>

{#if data.illustrator}
	<Header title={`Illustrator: ${data.illustrator.attributes.name}`} />

	<ul>
		{#each data.printings as printing (printing.id)}
			<li>
				<!-- /**
				* TODO(types): `printing` is not of type `Card`, slightly different attribute structure,
				* `getHighResImage` does not account for this, and `CardImage` expects a `Card` type.
				* Need to adjust/expand the types and utility functions to handle this properly.
				*/ -->
				<!-- <CardImage card={printing} /> -->

				<a href={localizeHref(`/card/${printing.attributes.card_id}`)}>
					{printing.attributes.card_id}
				</a>
			</li>
		{/each}
	</ul>
{/if}
