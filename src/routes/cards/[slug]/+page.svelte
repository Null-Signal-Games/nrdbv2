<script lang="ts">
	import { NRDB_API_URL } from '$lib/utils';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import CardImage from '$lib/components/CardImage.svelte';

	const { data } = $props();

	const card = data.card;
</script>

<PageTitle subtitle={card?.attributes.title} />

{#if card}
	<h1>{card?.attributes.title}</h1>
	<a href="/">Back to search</a>
	<br /><br />
	<CardImage {card} />
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
