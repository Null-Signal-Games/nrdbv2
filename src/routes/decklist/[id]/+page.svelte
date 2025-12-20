<script lang="ts">
	import type { Decklist, FileFormat, Card as TCard } from '$lib/types';
	import Header from '$lib/components/Header.svelte';
	import {
		group_cards_by_type,
		card_quantity,
		format_date,
		print,
		share,
		download_file,
		export_format
	} from '$lib/utils';
	import { tooltip } from '$lib/actions';
	import CardImage from '$lib/components/CardImage.svelte';
	import Table from '$lib/components/Table.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { card_types } from '$lib/i18n';
	import DeckListSummary from '$lib/components/decklist/Summary.svelte';
	import DecklistBreakdown from '$lib/components/decklist/Breakdown.svelte';
	import Printer from '$lib/components/Printer.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';

	interface Props {
		data: {
			identity: TCard;
			decklist: Decklist;
			cards: TCard[];
		};
	}

	let { data }: Props = $props();

	const grouped_cards = group_cards_by_type(data.cards);
	const count = card_quantity(data.decklist, grouped_cards);
	// const total_cards = Object.values(count).reduce((sum, n) => sum + n, 0);

	// TODO(review): Ensure packs are unique and sorted by release date, and anything else useful
	const packs = $derived(
		Array.from(new Set(data.cards.flatMap((card) => card.attributes.card_set_ids)))
	);

	const export_and_download = async (format: FileFormat = 'json') => {
		const data_formatted = export_format(data.decklist, format as FileFormat);
		download_file(JSON.stringify(data_formatted, null, 2), data.decklist.attributes.name, format);
	};
</script>

{#if data.decklist}
	<Icon name={data.decklist.attributes.faction_id} />
	<Header
		title={`Decklist: ${data.decklist.attributes.name}`}
		subtitle={`by ${data.decklist.attributes.user_id}`}
	/>
	<p>Created at: {format_date(data.decklist.attributes.created_at)}</p>
	<p>Updated at: {format_date(data.decklist.attributes.updated_at)}</p>

	<!-- TODO: get decklists likes count -->
	<p>
		<Icon name="heart" />
		Likes: [NUMBER]
	</p>

	<!-- TODO: get decklists favourites count -->
	<p>
		<Icon name="star" />
		Favourites: [NUMBER]
	</p>

	<!-- TODO: get decklists comments count -->
	<p>
		<Icon name="comment" />
		Comments: [NUMBER]
	</p>

	<div>
		<h2>Actions</h2>
		<p>Download as:</p>
		{#each ['json', 'txt', 'otcgn', 'bbcode', 'md', 'jinteki.net'] as format, index (index)}
			<button onclick={() => export_and_download(format as FileFormat)}>
				{format}
			</button>
		{/each}
		<hr />
		<button onclick={() => print()}>print</button>
		<button
			onclick={() =>
				share({
					title: data.decklist.attributes.name,
					text: `Decklist by ${data.decklist.attributes.user_id}`,
					url: window.location.href
				})}>share</button
		>
	</div>

	<div class="wrapper">
		<div class="temp">
			<p>Default layout (classic)</p>
			<!-- TODO: Abstract to component for reuse on homepage -->
			<div class="decklist">
				<DeckListSummary identity={data.identity} decklist={data.decklist} />
				<DecklistBreakdown decklist={data.decklist} cards={data.cards} />
			</div>
		</div>

		<div class="temp">
			<p>Visual card layout</p>
			{#each grouped_cards as group (group.type)}
				<div class="group">
					<div>
						<Icon name={group.type} />
						<h2>{card_types[group.type]} ({count[group.type]})</h2>
					</div>
					<ul class="cards">
						{#each group.data as card (card.id)}
							<li use:tooltip={card}>
								<CardImage hasTransition {card} />
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>

		<div class="temp">
			<p>Table layout</p>
			{#each grouped_cards as group (group.type)}
				<div class="group">
					<div>
						<Icon name={group.type} />
						<h2>{card_types[group.type]} ({count[group.type]})</h2>
					</div>
					<Table decklist={data.decklist} cards={group.data} />
				</div>
			{/each}
		</div>

		<div class="temp">
			<h2>Legality</h2>
			<!-- TODO: get decklists legality(s) -->
		</div>

		<div class="temp">
			<h2>Rotation</h2>
			<!-- TODO: get decklists rotation(s) -->
		</div>

		<div class="temp">
			<h2>Packs</h2>
			{#if packs.length > 0}
				<ul>
					<!-- TODO(i18n): ensure pack names are translated and use i18n values (currently uses API ID) -->
					{#each packs as pack (pack)}
						<li>
							<a href={localizeHref(`/sets/${pack}`)}>
								{pack}
							</a>
						</li>
					{/each}
				</ul>
			{:else}
				<p>No packs found</p>
			{/if}
		</div>
	</div>

	<Printer decklist={data.decklist} cards={data.cards} />

	<pre>{JSON.stringify(data, null, 2)}</pre>
{/if}

<style>
	/* Temporary styles */
	.group {
		display: grid;
		gap: 1rem;
	}

	ul {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.cards {
		grid-template-columns: repeat(4, 1fr);
	}

	.wrapper {
		display: grid;
		gap: 1rem;
	}

	.temp {
		border: 1px solid red;
		padding: 1rem;
	}
</style>
