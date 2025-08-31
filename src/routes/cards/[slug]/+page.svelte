<script lang="ts">
	import { NRDB_API_URL } from '$lib/utils';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import Card from '$lib/components/Card.svelte';
	import type { Card as TCard } from '$lib/types';
	import { cards } from '$lib/store';

	let { data }: PageProps = $props();

	let card = $derived($cards.find((card: TCard) => card.id === page.params.slug));
</script>

{#if card}
	<PageTitle subtitle={card?.attributes.title} />

	<h1>{card?.attributes.title}</h1>
	<a href="/">Back to search</a>
	<br /><br />
	<Card data={card} />
	<br /><br />
	<a
		href={`${NRDB_API_URL}/cards/${card.id}`}
		target="_blank"
		data-sveltekit-noscroll
		data-sveltekit-preload-data>View on NetrunnerDB</a
	>
	<br />
	<a href="/">Back to search</a>
	<br />

	{#await data.reviews}
		Loading reviews...
	{:then reviews}
		<pre>{JSON.stringify(reviews, null, 2)}</pre>
	{:catch error}
		<p>error loading comments: {error.message}</p>
	{/await}
{/if}

<br />
<hr />
<br />

<pre>{JSON.stringify(card, null, 2)}</pre>
