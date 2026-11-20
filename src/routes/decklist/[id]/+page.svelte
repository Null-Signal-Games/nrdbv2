<script lang="ts">
	import type { Decklist, Card as TCard, Set as TSet } from '$lib/types';
	import { format_date, share } from '$lib/utils';
	import Icon from '$lib/components/Icon.svelte';
	import Printer from '$lib/components/Printer.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Container from '$lib/components/Container.svelte';
	import Meta from '$lib/components/Meta.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import DeckExportMenu from '$lib/components/decklist/DeckExportMenu.svelte';
	import DeckHeader from '$lib/components/decklist/DeckHeader.svelte';
	import DeckDetails from '$lib/components/decklist/DeckDetails.svelte';
	import DeckWriteup from '$lib/components/decklist/DeckWriteup.svelte';

	interface Props {
		data: {
			identity: TCard;
			decklist: Decklist;
			cards: TCard[];
			sets: TSet[];
			writeup: string | null;
		};
	}

	let { data }: Props = $props();

	const attributes = $derived(data.decklist.attributes);
	const social = [
		{ name: 'heart', label: 'Likes' },
		{ name: 'star', label: 'Favourites' }
	];
</script>

<Meta title={attributes.name} />

<Container class="decklist">
	<DeckHeader identity={data.identity} name={attributes.name}>
		<p class="decklist__byline">
			by <a href={localizeHref(`/profile/${attributes.user_id}`)}>{attributes.user_id}</a>
			&middot;
			<time datetime={attributes.created_at}>{format_date(attributes.created_at)}</time>
		</p>

		{#snippet actions()}
			{#each social as { name, label } (name)}
				<Button color="secondary" size="sm" title={label}>
					{#snippet icon()}
						<Icon {name} size="sm" {label} />
					{/snippet}
					&ndash;
				</Button>
			{/each}
			<Button
				color="secondary"
				size="sm"
				onclick={() =>
					share({
						title: attributes.name,
						text: `Decklist by ${attributes.user_id}`,
						url: window.location.href
					})}
			>
				Share
			</Button>
			<DeckExportMenu decklist={data.decklist} cards={data.cards} />
		{/snippet}
	</DeckHeader>

	<div class="decklist__body" class:decklist__body--writeup={data.writeup}>
		<div class="decklist__deck">
			<DeckDetails
				identity={data.identity}
				decklist={data.decklist}
				cards={data.cards}
				sets={data.sets}
			/>
		</div>

		{#if data.writeup}
			<DeckWriteup html={data.writeup} />
		{/if}
	</div>
</Container>

<Printer decklist={data.decklist} cards={data.cards} />

<style>
	:global(.decklist) {
		display: grid;
		gap: var(--space-6);
		padding-block: var(--page-top) var(--page-bottom);
	}

	.decklist__byline {
		margin: 0;
		color: var(--text-muted);
	}

	.decklist__byline a {
		color: var(--text);
	}

	.decklist__body {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-8);
		align-items: start;
	}

	.decklist__body--writeup {
		grid-template-columns: minmax(0, 1fr) minmax(0, 40rem);
	}

	.decklist__body--writeup .decklist__deck {
		position: sticky;
		top: var(--space-4);
		max-block-size: calc(100dvh - 2 * var(--space-4));
		overflow-y: auto;
		overscroll-behavior: contain;
	}
</style>
