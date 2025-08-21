<script lang="ts">
	import { NRDB_API_URL } from '$lib/utils';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import CardImage from '$lib/components/CardImage.svelte';

	const { data } = $props();

	const card = data.card;
	const backUrl = data.searchParams ? `/?${data.searchParams}` : '/';
</script>

<PageTitle subtitle={card?.attributes.title} />

{#if card}
	<h1>{card?.attributes.title}</h1>
	<a href={backUrl}>Back to search</a>
	<br /><br />
	<div class="card-container">
		<CardImage {card} />
	</div>
	<br /><br />
	<a
		href={`${NRDB_API_URL}/cards/${card.id}`}
		target="_blank"
		data-sveltekit-noscroll
		data-sveltekit-preload-data>View on NetrunnerDB</a
	>
	<br />
	<a href={backUrl}>Back to search</a>
{/if}

<style>
	.card-container {
		max-width: 300px;
	}
</style>
