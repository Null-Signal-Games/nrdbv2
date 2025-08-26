<script lang="ts">
	import type { Decklist } from '$lib/types';
	import { NRDB_CLASSIC_URL } from '$lib/utils';
	import CardImage from './CardImage.svelte';
	import { store } from '$lib/store/index.svelte';

	interface Props {
		decklist: Decklist;
	}

	const { decklist }: Props = $props();

	const identityCard = $derived(store.cardIdToCard[decklist.attributes.identity_card_id]);
</script>

<a href={`${NRDB_CLASSIC_URL}/decklist/${decklist.id}`} target="_blank">
	<div class="decklist-preview">
		<div class="decklist-preview-identity-card">
			<CardImage card={identityCard} />
		</div>
		<p>
			{decklist.attributes.name} - {decklist.attributes.user_id}
		</p>
	</div>
</a>

<style>
	.decklist-preview {
		border: 1px solid #ccc;
		padding: 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}

	.decklist-preview-identity-card {
		max-width: 100px;
	}
</style>
