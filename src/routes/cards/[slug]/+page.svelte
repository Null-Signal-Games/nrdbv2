<script lang="ts">
	import { getHighResImage, NRDB_API_URL } from '$lib/utils';

	const { data } = $props();

	const card = data.card;
</script>

{#if card}
	<div>
		<h1>{card?.attributes.title}</h1>
		<img src={getHighResImage(card)} alt={card?.attributes.title} />
		<a href={`${NRDB_API_URL}/cards/${card.id}`} target="_blank">View on NetrunnerDB</a>
		<a href="/">Back to search</a>
	</div>
{/if}
