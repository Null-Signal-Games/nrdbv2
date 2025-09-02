<script lang="ts">
	import type { Decklist, Card } from '$lib/types';
	import { NRDB_CLASSIC_URL } from '$lib/utils';
	import CardImage from './CardImage.svelte';
	import { cards } from '$lib/store';

	interface Props {
		decklist: Decklist;
	}

	const { decklist }: Props = $props();

	const identityCard = $derived(
		$cards.find((card: Card) => card.id === decklist.attributes.identity_card_id)
	);
</script>

<a href={`${NRDB_CLASSIC_URL}/decklist/${decklist.id}`} target="_blank">
	<div class="decklist-preview">
		{#if identityCard}
			<div class="decklist-preview-identity-card">
				<CardImage card={identityCard} boxShadow={false} />
			</div>
		{/if}
		<div class="decklist-preview-info">
			<p>
				{decklist.attributes.name}
			</p>
			<p>
				{decklist.attributes.user_id}
			</p>
		</div>
	</div>
</a>

<style>
	.decklist-preview {
		display: flex;
		gap: 1rem;
		padding: 1rem;
	}

	.decklist-preview-identity-card {
		max-width: 100px;
	}
</style>
