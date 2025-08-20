<script lang="ts">
	import { getHighResImage, NRDB_API_URL } from '$lib/utils';
	import PageTitle from '$lib/components/PageTitle.svelte';

	const { data } = $props();

	const card = data.card;
</script>

<PageTitle subtitle={card?.attributes.title} />

{#if card}
	<h1>{card?.attributes.title}</h1>
	<a href="/">Back to search</a>
	<br /><br />
	<img class="card" src={getHighResImage(card)} alt={card?.attributes.title} />
	<br /><br />
	<a
		href={`${NRDB_API_URL}/cards/${card.id}`}
		target="_blank"
		data-sveltekit-noscroll
		data-sveltekit-preload-data>View on NetrunnerDB</a
	>
	<br />
	<a href="/">Back to search</a>
{/if}
