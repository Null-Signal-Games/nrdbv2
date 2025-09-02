<script lang="ts">
	import type { Review } from '$lib/types';
	import Header from '$lib/components/Header.svelte';

	let { data }: { data: { reviews: Review[] } } = $props();
</script>

{#if data.reviews}
	<Header title={`Reviews: ${data.reviews[0].attributes.card}`} />

	<ul>
		{#each data.reviews as review (review.id)}
			<li>
				{review.attributes.body}
			</li>
		{/each}
	</ul>
{/if}
