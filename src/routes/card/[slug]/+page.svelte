<script lang="ts">
	import { NRDB_API_URL } from '$lib/constants';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import CardImage from '$lib/components/CardImage.svelte';
	import { page } from '$app/state';
	import type {
		CardTypeIds,
		FactionIds,
		Printing,
		Ruling,
		Card as TCard,
		Review as TReview
	} from '$lib/types';
	import { cards, printings } from '$lib/store';
	import Review from '$lib/components/review/Item.svelte';
	import Header from '$lib/components/Header.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { card_types, factions } from '$lib/i18n';
	import Influence from '$lib/components/Influence.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';

	interface Props {
		data: {
			searchParams: string;
			reviews: TReview[];
			rulings: Ruling[];
		};
	}

	let { data }: Props = $props();

	let card_data = $derived<TCard | undefined>(
		$cards.find((card: TCard) => card.id === page.params.slug)
	);
	let printing_data = $derived<Printing[]>(
		$printings.filter((card: Printing) => card.attributes.title === card_data?.attributes.title)
	);

	// TODO: handle edge cases (first/last card), where there is no previous/next card, likely just wrap button in {#if} block instead?
	let card_previous = $derived<TCard | undefined>(
		$cards[$cards.findIndex((card: TCard) => card.id === page.params.slug) - 1]
	);
	let card_next = $derived<TCard | undefined>(
		$cards[$cards.findIndex((card: TCard) => card.id === page.params.slug) + 1]
	);
</script>

{#if card_data}
	<PageTitle subtitle={card_data?.attributes.title} />

	<Header title={card_data?.attributes.title} />

	{#if card_previous?.id}
		<a href={localizeHref(`/card/${card_previous.id}`)}>Previous</a>
	{/if}

	{#if card_next?.id}
		<a href={localizeHref(`/card/${card_next.id}`)}>Next</a>
	{/if}

	<div class="card-details">
		<CardImage card={card_data} hasTransition={true} href={null} />
		<div>
			<table>
				<tbody>
					<tr>
						<td>Type</td>
						<td>
							<span class="icon-label">
								<Icon name={card_data.attributes.card_type_id} size="sm" />
								{card_types[card_data.attributes.card_type_id as CardTypeIds]}
							</span>
						</td>
					</tr>
					{#if card_data.attributes.card_subtype_ids.length > 0}
						<tr>
							<td>Subtypes</td>
							<td>{card_data.attributes.card_subtype_ids}</td>
						</tr>
					{/if}
					<tr>
						<td>Faction</td>
						<td>
							<a
								href={localizeHref(`/faction/${card_data.attributes.faction_id}`)}
								class="icon-label"
							>
								<span data-faction-theme={card_data.attributes.faction_id}>
									<Icon name={card_data.attributes.faction_id} size="sm" />
								</span>
								{factions[card_data.attributes.faction_id as FactionIds]}
							</a>
						</td>
					</tr>
					<tr>
						<td>Influence</td>
						<td>
							<Influence count={card_data.attributes.influence_cost} />
						</td>
					</tr>
					<tr>
						<td>Cost</td>
						<td>
							<span class="icon-label">
								<Icon name="credit" size="sm" />
								{card_data.attributes.cost}
							</span>
						</td>
					</tr>
					{#if card_data.attributes.trash_cost}
						<tr>
							<td>Trash</td>
							<td>
								<span class="icon-label">
									<Icon name="trash" size="sm" />
									{card_data.attributes.trash_cost}
								</span>
							</td>
						</tr>
					{/if}
				</tbody>
			</table>

			<div>
				<pre>{JSON.stringify(card_data.attributes.text, null, 2)}</pre>
				<br />
				<hr />
				<br />
				{#if printing_data[0].attributes.flavor}
					<p>Flavor: {printing_data[0].attributes.flavor}</p>
				{/if}
			</div>

			<p>
				<a
					href={localizeHref(`/illustrators/${printing_data[0].attributes.illustrator_ids[0]}`)}
					class="underline"
				>
					Illustrated by {printing_data[0].attributes.display_illustrators}
				</a>
			</p>

			<p>
				<a href={localizeHref(`/decklists/find?cards[]=${card_data.id}`)} class="underline">
					Decklists with this card
				</a>
			</p>
		</div>
		<div>Cycle, set, legality, printings</div>
	</div>

	<a
		href={`${NRDB_API_URL}/cards/${card_data.id}`}
		target="_blank"
		data-sveltekit-noscroll
		data-sveltekit-preload-data>View on NetrunnerDB</a
	>

	<!-- PRINTINGS -->
	{#if printing_data.length > 1}
		<div>
			<h2>Printings/alt arts</h2>
			{#each printing_data as printing (printing.id)}
				<p>
					<!-- TODO: ensure image correctly gets pulled through, although <CardImage> uses `Card` type, and currently does not support `Printing` type -->
					<!-- <CardImage data={printing} /> -->
					<!-- <pre>{JSON.stringify(printing, null, 2)}</pre> -->
					{printing.id}
				</p>
			{/each}
		</div>
	{/if}

	<!-- RULINGS -->
	{#await data.rulings}
		Loading rulings...
	{:then rulings}
		<pre>{JSON.stringify(rulings, null, 2)}</pre>
		<div class="rulings">
			<h2>Rulings</h2>
			{#if rulings.length > 0}
				{#each rulings as ruling (ruling.id)}
					<pre>{JSON.stringify(ruling, null, 2)}</pre>
				{/each}
			{:else}
				<p>No rulings found for this card.</p>
			{/if}
		</div>
	{:catch error}
		<p>error loading rulings: {error.message}</p>
	{/await}

	<!-- REVIEWS -->
	{#await data.reviews}
		Loading reviews...
	{:then reviews}
		<div class="reviews">
			<h2>Reviews</h2>
			{#each reviews as review (review.id)}
				<Review {review} />
			{/each}
		</div>
	{:catch error}
		<p>error loading comments: {error.message}</p>
	{/await}

	<pre>{JSON.stringify(card_data, null, 2)}</pre>

	prev:
	<pre>{JSON.stringify(card_previous, null, 2)}</pre>
	next:
	<pre>{JSON.stringify(card_next, null, 2)}</pre>
{/if}

<style>
	/* Temporary styles */
	.card-details {
		display: grid;
		grid-template-columns: minmax(240px, 1fr) 2fr 1fr;
		gap: 1rem;
	}

	.reviews {
		display: grid;
		gap: 1rem;
	}
</style>
