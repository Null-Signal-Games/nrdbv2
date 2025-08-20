<script lang="ts">
	import { getHighResImage, NRDB_API_URL } from '$lib/utils';

	const { data } = $props();

	const card = data.card;
</script>

{#if card}
	<h1>{card?.attributes.title}</h1>
	<a href="/">Back to search</a>
	<br /><br />
	<img src={getHighResImage(card)} alt={card?.attributes.title} />
	<br /><br />
	<a href={`${NRDB_API_URL}/cards/${card.id}`} target="_blank">View on NetrunnerDB</a>
	<br />
	<a href="/">Back to search</a>
{/if}
