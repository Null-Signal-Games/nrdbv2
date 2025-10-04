<script lang="ts">
	import type { Card, Decklist } from '$lib/types';
	import CardImage from '$lib/components/CardImage.svelte';
	import Icon from '$lib/components/Icon.svelte';

	interface Props {
		identity: Card;
		decklist: Decklist;
	}

	let { identity, decklist }: Props = $props();
</script>

<div class="summary">
	<div>
		<CardImage card={identity} />
	</div>
	<div>
		<h3>
			<a href={`/decklist/${decklist.id}`}>
				{decklist.attributes.name}
			</a>
		</h3>
		{#if identity?.attributes?.title}
			<p>
				<Icon name={decklist.attributes.faction_id} />
				{identity.attributes.title}
			</p>
		{/if}

		<p>by <a href={`/profile/${decklist.attributes.user_id}`}>{decklist.attributes.user_id}</a></p>
	</div>
</div>

<style>
	/* Temporary styles */
	.summary {
		display: grid;
		grid-template-columns: 1fr 3fr;
		gap: 1rem;
	}
</style>
