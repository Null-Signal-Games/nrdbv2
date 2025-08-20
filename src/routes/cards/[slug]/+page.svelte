<script lang="ts">
	import { getContext } from 'svelte';
	import type { Card } from '$lib/types';
	import { getHighResImage, NRDB_API_URL } from '$lib/utils';
	const store = getContext<{ allCards: Card[] }>('store');

	const { params } = $props();

	const card = store.allCards.find((card) => card.id === params.slug);
</script>

<div>
	<h1>{card?.attributes.title}</h1>
	<img src={getHighResImage(card)} alt={card?.attributes.title} />
	<a href={`${NRDB_API_URL}/cards/${params.slug}`} target="_blank">View on NetrunnerDB</a>
	<a href="/">Back to search</a>
</div>
