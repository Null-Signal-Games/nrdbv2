<script lang="ts">
	import type { Card, Decklist } from '$lib/types';
	import { NRDB_API_URL } from '$lib/constants';
	import DecklistPreview from './DecklistPreview.svelte';

	interface Props {
		firstCard: Card | undefined;
	}

	const { firstCard }: Props = $props();

	let decklistSuggestions = $state<Decklist[] | null>(null);
	let lastFirstCardId: string | null = null;

	$effect(() => {
		const currentFirstCardId = firstCard?.id || null;

		if (currentFirstCardId === lastFirstCardId) {
			return;
		}

		lastFirstCardId = currentFirstCardId;

		if (!firstCard) {
			decklistSuggestions = null;
			return;
		}

		(async () => {
			try {
				const response = await fetch(
					`${NRDB_API_URL}/decklists?filter[card_id]=${firstCard.id}&page[size]=5&sort=-created_at`
				);
				const { data } = await response.json();
				decklistSuggestions = data;
			} catch (error) {
				console.error('Error fetching decklists:', error);
			}
		})();
	});
</script>

<div class="decklist-suggestions">
	{#if decklistSuggestions}
		<h2>Decklists featuring {firstCard?.attributes.title}</h2>
		{#each decklistSuggestions as decklist (decklist.id)}
			<DecklistPreview {decklist} />
		{/each}
	{/if}
</div>
