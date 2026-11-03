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

	interface Props {
		data: {
			identity: TCard;
			decklist: Decklist;
			cards: TCard[];
			sets: TSet[];
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

	<DeckDetails
		identity={data.identity}
		decklist={data.decklist}
		cards={data.cards}
		sets={data.sets}
	/>
</Container>

<Printer decklist={data.decklist} cards={data.cards} />

<style>
	:global(.decklist) {
		display: grid;
		gap: 1.5rem;
		padding-block: 2rem 3rem;
	}

	.decklist__byline {
		margin: 0;
		color: var(--text-muted);
	}

	.decklist__byline a {
		color: var(--text);
	}
</style>
