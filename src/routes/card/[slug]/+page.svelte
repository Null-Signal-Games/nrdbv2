<script lang="ts">
	import { NRDB_API_URL } from '$lib/utils';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import CardImage from '$lib/components/CardImage.svelte';
	import { page } from '$app/state';
	import { searchQuery } from '$lib/store';
	import type { Card as TCard, Review as TReview } from '$lib/types';
	import { cards } from '$lib/store';
	import Review from '$lib/components/review/Item.svelte';

	interface Props {
		data: {
			searchParams: string;
			reviews: TReview[];
		};
	}

	let { data }: Props = $props();

	let card = $derived($cards.find((card: TCard) => card.id === page.params.slug));
	const backUrl = $derived($searchQuery.length > 0 ? '/' : '/');
</script>

{#if card}
	<PageTitle subtitle={card?.attributes.title} />

	<h1>{card?.attributes.title}</h1>
	<a href={backUrl}>Back to search</a>
	<br /><br />
	<div class="card-container">
		<CardImage {card} hasTransition={true} href={null} />
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
	<br />

	{#await data.reviews}
		Loading reviews...
	{:then reviews}
		<div class="reviews">
			{#each reviews as review (review.id)}
				<Review {review} />
			{/each}
		</div>
	{:catch error}
		<p>error loading comments: {error.message}</p>
	{/await}
{/if}

<style>
	/* Temporary styles */
	.card-container {
		max-width: 300px;
	}

	.reviews {
		display: grid;
		gap: 1rem;
	}
</style>
